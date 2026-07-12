const { RFIDCard, StudentProfile, User, AttendanceSession, AttendanceRecord } = require('../models');

const processRFIDScan = async (rfidUid, io) => {
  const card = await RFIDCard.findOne({ uid: rfidUid })
    .populate({
      path: 'studentProfileId',
      populate: { path: 'userId', select: 'first_name last_name photo' }
    });

  if (!card) {
    if (io) io.emit('rfid_unregistered', { uid: rfidUid });
    return { success: false, errorType: 'NOT_FOUND', message: 'Card Not Registered' };
  }
  if (card.status !== 'Active') {
    return { success: false, errorType: 'DISABLED', message: 'Card Disabled' };
  }
  if (!card.studentProfileId) {
    return { success: false, errorType: 'UNASSIGNED', message: 'Card Not Assigned' };
  }

  const student = card.studentProfileId;
  const session = await AttendanceSession.findOne({ status: 'Active' }).sort({ started_at: -1 });
  if (!session) return { success: false, errorType: 'NO_SESSION', message: 'No Active Session' };

  const existing = await AttendanceRecord.findOne({ sessionId: session._id, studentId: student._id });
  if (existing) {
    existing.duplicate_scan_count += 1;
    await existing.save();
    if (io) io.to(`session_${session._id}`).emit('scan_duplicate', { student, duplicate: true });
    return { success: true, duplicate: true, studentName: student.userId.first_name, student, message: 'Already Recorded' };
  }

  const minutesLate = Math.floor((new Date() - session.started_at) / 60000);
  const status = minutesLate > session.late_threshold_minutes ? 'Late' : 'Present';
  const timeNow = new Date();

  const record = await AttendanceRecord.create({
    sessionId: session._id, studentId: student._id,
    status, verification_method: 'RFID', time: timeNow
  });

  card.last_scanned = timeNow;
  await card.save();

  if (io) io.to(`session_${session._id}`).emit('scan', { record, student, status, time: record.time });

  return {
    success: true, duplicate: false,
    studentName: student.userId.first_name,
    time: timeNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status, record, student
  };
};

const scanRFIDCard = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'UID is required.' });
    const result = await processRFIDScan(uid.toUpperCase(), req.io);
    if (!result.success) return res.status(result.errorType === 'NOT_FOUND' ? 404 : 400).json({ message: result.message });
    res.json({ message: result.duplicate ? 'Attendance already recorded.' : 'Attendance logged successfully.', ...result });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const registerRFIDCard = async (req, res) => {
  try {
    const { uid, studentProfileId } = req.body;
    if (!uid) return res.status(400).json({ message: 'Card UID is required.' });

    let card = await RFIDCard.findOne({ uid: uid.toUpperCase() });
    if (card) {
      if (studentProfileId) card.studentProfileId = studentProfileId;
      card.status = 'Active';
      await card.save();
    } else {
      card = await RFIDCard.create({ uid: uid.toUpperCase(), studentProfileId, status: 'Active' });
    }

    if (studentProfileId) {
      const student = await StudentProfile.findById(studentProfileId);
      if (student) { student.rfid = uid.toUpperCase(); await student.save(); }
    }

    res.status(201).json({ message: 'RFID Card registered and assigned successfully.', card });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getRFIDCards = async (req, res) => {
  try {
    const cards = await RFIDCard.find()
      .populate({ path: 'studentProfileId', populate: { path: 'userId', select: 'first_name last_name email' } })
      .sort({ updatedAt: -1 });
    res.json(cards);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getLiveAttendance = async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({ status: 'Active' }).sort({ started_at: -1 });
    if (!session) return res.json({ active: false, session: null, records: [] });

    const records = await AttendanceRecord.find({ sessionId: session._id })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'first_name last_name photo' } })
      .sort({ time: -1 });

    res.json({ active: true, session, records });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { processRFIDScan, scanRFIDCard, registerRFIDCard, getRFIDCards, getLiveAttendance };
