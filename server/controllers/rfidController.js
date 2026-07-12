const { RFIDCard, StudentProfile, User, AttendanceSession, AttendanceRecord } = require('../models');

/**
 * Shared logic to process an RFID card scan (called by both Serial and REST API)
 * @param {string} rfidUid - Card UID in Hex
 * @param {Object} io - Socket.IO instance
 * @returns {Promise<Object>} - Scan processing results
 */
const processRFIDScan = async (rfidUid, io) => {
  // 1. Look up card registration
  const card = await RFIDCard.findOne({
    where: { uid: rfidUid },
    include: [{
      model: StudentProfile,
      as: 'student',
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'photo'] }]
    }]
  });

  if (!card) {
    // Notify admin console of scanned card to facilitate quick enrollment
    if (io) {
      io.emit('rfid_unregistered', { uid: rfidUid });
    }
    return { success: false, errorType: 'NOT_FOUND', message: 'Card Not Registered' };
  }

  if (card.status !== 'Active') {
    return { success: false, errorType: 'DISABLED', message: 'Card Disabled' };
  }

  if (!card.student) {
    return { success: false, errorType: 'UNASSIGNED', message: 'Card Not Assigned' };
  }

  const student = card.student;
  const studentName = `${student.user.first_name} ${student.user.last_name}`;

  // 2. Find active attendance session
  const session = await AttendanceSession.findOne({
    where: { status: 'Active' },
    order: [['started_at', 'DESC']]
  });

  if (!session) {
    return { success: false, errorType: 'NO_SESSION', message: 'No Active Session' };
  }

  // 3. Check for duplicate scan
  const existing = await AttendanceRecord.findOne({
    where: { sessionId: session.id, studentId: student.id }
  });

  if (existing) {
    await existing.increment('duplicate_scan_count');
    
    // Broadcast duplicate check-in trigger to socket rooms
    if (io) {
      io.to(`session_${session.id}`).emit('scan_duplicate', {
        student,
        duplicate: true
      });
    }
    return {
      success: true,
      duplicate: true,
      studentName: student.user.first_name,
      student,
      message: 'Already Recorded'
    };
  }

  // 4. Determine status: Present or Late
  const minutesLate = Math.floor((new Date() - session.started_at) / 60000);
  const status = minutesLate > session.late_threshold_minutes ? 'Late' : 'Present';

  const timeNow = new Date();
  
  // 5. Create Attendance log record
  const record = await AttendanceRecord.create({
    sessionId: session.id,
    studentId: student.id,
    status,
    verification_method: 'RFID',
    time: timeNow
  });

  // 6. Update card's last scanned timestamp
  await card.update({ last_scanned: timeNow });

  const formattedTime = timeNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 7. Emit real-time update event via Socket.IO
  if (io) {
    io.to(`session_${session.id}`).emit('scan', {
      record,
      student,
      status,
      time: record.time
    });
  }

  return {
    success: true,
    duplicate: false,
    studentName: student.user.first_name,
    time: formattedTime,
    status,
    record,
    student
  };
};

// POST /api/rfid/scan
const scanRFIDCard = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'UID is required.' });

    const result = await processRFIDScan(uid.toUpperCase(), req.io);

    if (!result.success) {
      return res.status(result.errorType === 'NOT_FOUND' ? 404 : 400).json({
        message: result.message
      });
    }

    res.json({
      message: result.duplicate ? 'Attendance already recorded.' : 'Attendance logged successfully.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/rfid/register
const registerRFIDCard = async (req, res) => {
  try {
    const { uid, studentProfileId } = req.body;
    if (!uid) return res.status(400).json({ message: 'Card UID is required.' });

    let card = await RFIDCard.findOne({ where: { uid: uid.toUpperCase() } });
    if (card) {
      if (studentProfileId) card.studentProfileId = studentProfileId;
      card.status = 'Active';
      await card.save();
    } else {
      card = await RFIDCard.create({
        uid: uid.toUpperCase(),
        studentProfileId,
        status: 'Active'
      });
    }

    // Sync student profile column
    if (studentProfileId) {
      const student = await StudentProfile.findByPk(studentProfileId);
      if (student) {
        student.rfid = uid.toUpperCase();
        await student.save();
      }
    }

    res.status(201).json({
      message: 'RFID Card registered and assigned successfully.',
      card
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rfid/cards
const getRFIDCards = async (req, res) => {
  try {
    const cards = await RFIDCard.findAll({
      include: [{
        model: StudentProfile,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }]
      }],
      order: [['updatedAt', 'DESC']]
    });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/attendance/live
const getLiveAttendance = async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({
      where: { status: 'Active' },
      order: [['started_at', 'DESC']]
    });

    if (!session) {
      return res.json({ active: false, session: null, records: [] });
    }

    const records = await AttendanceRecord.findAll({
      where: { sessionId: session.id },
      include: [{
        model: StudentProfile,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'photo'] }]
      }],
      order: [['time', 'DESC']]
    });

    res.json({ active: true, session, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  processRFIDScan,
  scanRFIDCard,
  registerRFIDCard,
  getRFIDCards,
  getLiveAttendance
};
