/**
 * QR Attendance Controller
 * 
 * Security model:
 *  - Teacher generates a QR code. The QR contains a short-lived signed token (30s TTL).
 *  - Each token is single-use and stored in an in-memory set (usedTokens).
 *  - Student scans the QR → sends token to /api/qr/verify → server validates signature,
 *    expiry, active session, and marks attendance.
 *  - Because the token expires in 30 seconds, a photo forwarded on WhatsApp is useless
 *    by the time a remote student tries to use it.
 */

const crypto = require('crypto');
const { AttendanceSession, AttendanceRecord, StudentProfile, User } = require('../models');

// Secret used to sign tokens — rotated daily via env
const QR_SECRET = process.env.QR_SECRET || 'smart-attendance-qr-secret-2024';

// In-memory set of already-used tokens to prevent replay attacks
const usedTokens = new Set();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const t of usedTokens) {
    try {
      const decoded = JSON.parse(Buffer.from(t.split('.')[0], 'base64').toString());
      if (decoded.exp < now) usedTokens.delete(t);
    } catch {
      usedTokens.delete(t);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create a signed QR token
 * Format: base64(payload) + '.' + base64(hmac_signature)
 */
// Calculate distance in meters using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
};

const createToken = (sessionId, ttlSeconds = 30, lat = null, lng = null) => {
  const payload = {
    sessionId,
    iat: Date.now(),
    exp: Date.now() + ttlSeconds * 1000,
    nonce: crypto.randomBytes(8).toString('hex'),  // unique per generation
    lat,
    lng
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', QR_SECRET).update(payloadB64).digest('base64');
  return `${payloadB64}.${sig}`;
};

/**
 * Verify a QR token — returns decoded payload or throws
 */
const verifyToken = (token) => {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Invalid token format');

  const [payloadB64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', QR_SECRET).update(payloadB64).digest('base64');
  if (expectedSig !== sig) throw new Error('Invalid token signature');

  const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
  if (payload.exp < Date.now()) throw new Error('Token expired');
  if (usedTokens.has(token)) throw new Error('Token already used');

  return payload;
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * GET /api/qr/token
 * Teacher calls this every 30 seconds to get a fresh QR token.
 * Returns the token and how many seconds remain until it expires.
 */
const getQRToken = async (req, res) => {
  try {
    // Find active attendance session
    const session = await AttendanceSession.findOne({
      where: { status: 'Active' },
      order: [['started_at', 'DESC']]
    });

    if (!session) {
      return res.status(404).json({ message: 'No active attendance session found.' });
    }

    const { lat, lng } = req.query;
    const TTL = 30; // seconds
    const token = createToken(session.id, TTL, lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null);

    res.json({
      token,
      sessionId: session.id,
      expiresIn: TTL,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/qr/verify
 * Student submits their JWT token after scanning the QR code.
 * Body: { token: '...', studentId: 'CS-2026-089' }
 * 
 * The student must be logged-in (JWT auth header), so we know *who* is scanning.
 */
const verifyQRToken = async (req, res) => {
  try {
    const { token, latitude, longitude, studentId, password } = req.body;
    const userId = req.user?.id; // comes from the JWT auth middleware

    if (!token) return res.status(400).json({ message: 'QR token is required.' });
    if (!userId) return res.status(401).json({ message: 'Authentication required.' });
    if (!studentId) return res.status(400).json({ message: 'Student ID is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });

    // 1. Verify token signature and expiry
    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    // Geolocation verification if coordinates are embedded in the token
    if (payload.lat !== undefined && payload.lat !== null && payload.lng !== undefined && payload.lng !== null) {
      if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return res.status(400).json({ message: 'Location access is required to verify classroom attendance.' });
      }

      const distance = getDistance(payload.lat, payload.lng, parseFloat(latitude), parseFloat(longitude));
      const ALLOWED_DISTANCE = 6; // meters threshold
      if (distance > ALLOWED_DISTANCE) {
        return res.status(400).json({ 
          message: `Location verification failed. You must be in the classroom to check-in (detected distance: ${Math.round(distance)}m).` 
        });
      }
    }

    // 2. Mark token as used (single-use enforcement)
    usedTokens.add(token);

    // 3. Find the active session
    const session = await AttendanceSession.findOne({
      where: { id: payload.sessionId, status: 'Active' }
    });

    if (!session) {
      return res.status(400).json({ message: 'Session is no longer active.' });
    }

    // 4. Find student profile by studentId
    const student = await StudentProfile.findOne({
      where: { student_id: studentId },
      include: [{ model: User, as: 'user' }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found for the provided Student ID.' });
    }

    // Verify password
    const isPasswordValid = await student.user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password. Attendance check-in rejected.' });
    }

    // Ensure it belongs to the logged-in user
    if (student.userId !== userId) {
      return res.status(403).json({ message: 'Access denied. You cannot check in on behalf of another student.' });
    }

    // 5. Check for duplicate
    const existing = await AttendanceRecord.findOne({
      where: { sessionId: session.id, studentId: student.id }
    });

    if (existing) {
      return res.status(409).json({ message: 'Your attendance has already been recorded for this session.' });
    }

    // 6. Determine Present / Late
    const minutesLate = Math.floor((new Date() - session.started_at) / 60000);
    const status = minutesLate > session.late_threshold_minutes ? 'Late' : 'Present';
    const timeNow = new Date();

    // 7. Create attendance record
    const record = await AttendanceRecord.create({
      sessionId: session.id,
      studentId: student.id,
      status,
      verification_method: 'QR',
      time: timeNow
    });

    const formattedTime = timeNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 8. Broadcast live update via Socket.IO
    if (req.io) {
      req.io.to(`session_${session.id}`).emit('scan', {
        record,
        student,
        status,
        time: record.time,
        method: 'QR'
      });
    }

    res.json({
      message: `Attendance marked as ${status}`,
      status,
      time: formattedTime,
      student: {
        name: `${student.user.first_name} ${student.user.last_name}`,
        studentId: student.student_id,
        photo: student.user.photo
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getQRToken, verifyQRToken };
