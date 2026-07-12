/**
 * QR Attendance Controller
 * Security model:
 *  - Teacher generates a QR code containing a short-lived signed token (30s TTL).
 *  - Each token is single-use (in-memory set).
 *  - Student scans QR → enters Student ID + Password → server validates and marks attendance.
 */

const crypto = require('crypto');
const { AttendanceSession, AttendanceRecord, StudentProfile, User } = require('../models');

const QR_SECRET = process.env.QR_SECRET || 'smart-attendance-qr-secret-2024';
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

// Haversine distance in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const createToken = (sessionId, ttlSeconds = 30, lat = null, lng = null) => {
  const payload = {
    sessionId,
    iat: Date.now(),
    exp: Date.now() + ttlSeconds * 1000,
    nonce: crypto.randomBytes(8).toString('hex'),
    lat, lng
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', QR_SECRET).update(payloadB64).digest('base64');
  return `${payloadB64}.${sig}`;
};

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

// GET /api/qr/token
const getQRToken = async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({ status: 'Active' }).sort({ started_at: -1 });
    if (!session) return res.status(404).json({ message: 'No active attendance session found.' });

    const { lat, lng } = req.query;
    const TTL = 30;
    const token = createToken(
      session._id.toString(), TTL,
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null
    );

    res.json({ token, sessionId: session._id, expiresIn: TTL, generatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/qr/verify
const verifyQRToken = async (req, res) => {
  try {
    const { token, latitude, longitude, studentId, password } = req.body;
    const userId = req.user?._id;

    if (!token)     return res.status(400).json({ message: 'QR token is required.' });
    if (!userId)    return res.status(401).json({ message: 'Authentication required.' });
    if (!studentId) return res.status(400).json({ message: 'Student ID is required.' });
    if (!password)  return res.status(400).json({ message: 'Password is required.' });

    // 1. Verify token
    let payload;
    try { payload = verifyToken(token); }
    catch (e) { return res.status(400).json({ message: e.message }); }

    // 2. Geolocation check
    if (payload.lat !== undefined && payload.lat !== null && payload.lng !== undefined && payload.lng !== null) {
      if (latitude == null || longitude == null) {
        return res.status(400).json({ message: 'Location access is required to verify classroom attendance.' });
      }
      const distance = getDistance(payload.lat, payload.lng, parseFloat(latitude), parseFloat(longitude));
      if (distance > 6) {
        return res.status(400).json({
          message: `Location verification failed. You must be in the classroom to check-in (detected distance: ${Math.round(distance)}m).`
        });
      }
    }

    // 3. Mark token used
    usedTokens.add(token);

    // 4. Find active session
    const session = await AttendanceSession.findOne({ _id: payload.sessionId, status: 'Active' });
    if (!session) return res.status(400).json({ message: 'Session is no longer active.' });

    // 5. Find student by student_id, include user for password verification
    const student = await StudentProfile.findOne({ student_id: studentId })
      .populate('userId');
    if (!student) return res.status(404).json({ message: 'Student profile not found for the provided Student ID.' });

    // 6. Verify password
    const isPasswordValid = await student.userId.validatePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Incorrect password. Attendance check-in rejected.' });

    // 7. Ensure belongs to logged-in user
    if (student.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied. You cannot check in on behalf of another student.' });
    }

    // 8. Check duplicate
    const existing = await AttendanceRecord.findOne({ sessionId: session._id, studentId: student._id });
    if (existing) return res.status(409).json({ message: 'Your attendance has already been recorded for this session.' });

    // 9. Create record
    const minutesLate = Math.floor((new Date() - session.started_at) / 60000);
    const status = minutesLate > session.late_threshold_minutes ? 'Late' : 'Present';
    const timeNow = new Date();

    const record = await AttendanceRecord.create({
      sessionId: session._id,
      studentId: student._id,
      status,
      verification_method: 'QR',
      time: timeNow
    });

    // 10. Broadcast via Socket.IO
    if (req.io) {
      req.io.to(`session_${session._id}`).emit('scan', {
        record, student, status, time: record.time, method: 'QR'
      });
    }

    const user = student.userId;
    res.json({
      message: `Attendance marked as ${status}`,
      status,
      time: timeNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      student: {
        name: `${user.first_name} ${user.last_name}`,
        studentId: student.student_id,
        photo: user.photo
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getQRToken, verifyQRToken };
