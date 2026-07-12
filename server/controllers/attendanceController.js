const { v4: uuidv4 } = require('uuid');
const { AttendanceSession, AttendanceRecord, StudentProfile, User, Subject, Course, Classroom, Semester, Device, Notification } = require('../models');
const { Op } = require('sequelize');

const sessionIncludes = [
  { model: User, as: 'teacher', attributes: ['id', 'first_name', 'last_name', 'email', 'photo'] },
  { model: Subject, as: 'subject' },
  { model: Course, as: 'course' },
  { model: Classroom, as: 'classroom' },
  { model: Semester, as: 'semester' },
  { model: Device, as: 'device' },
];

// GET /api/attendance/sessions
const getSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    // Teachers only see their own sessions
    if (req.user.role === 'teacher') where.teacherId = req.user.id;

    const sessions = await AttendanceSession.findAndCountAll({
      where,
      include: sessionIncludes,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['started_at', 'DESC']],
    });
    res.json({ sessions: sessions.rows, total: sessions.count });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/sessions/:id
const getSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findByPk(req.params.id, { include: sessionIncludes });
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/sessions
const createSession = async (req, res) => {
  try {
    const { subjectId, courseId, classroomId, semesterId, deviceId, section, late_threshold_minutes } = req.body;
    const session_id = `SES-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    const session = await AttendanceSession.create({
      session_id,
      teacherId: req.user.id,
      subjectId, courseId, classroomId, semesterId, deviceId,
      section: section || 'A',
      late_threshold_minutes: late_threshold_minutes || 15,
      status: 'Active',
    });

    const result = await AttendanceSession.findByPk(session.id, { include: sessionIncludes });
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/attendance/sessions/:id
const updateSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const updates = { ...req.body };
    if (req.body.status === 'Finished' && !session.finished_at) {
      updates.finished_at = new Date();
    }
    await session.update(updates);
    const result = await AttendanceSession.findByPk(session.id, { include: sessionIncludes });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/sessions/:id/records
const getSessionRecords = async (req, res) => {
  try {
    const records = await AttendanceRecord.findAll({
      where: { sessionId: req.params.id },
      include: [{
        model: StudentProfile, as: 'student',
        include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'photo'] }],
      }],
      order: [['time', 'ASC']],
    });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/scan  — called by fingerprint hardware or manual entry
const scanAttendance = async (req, res) => {
  try {
    const { session_id, fingerprint_id, rfid, student_id, verification_method = 'Fingerprint' } = req.body;

    const session = await AttendanceSession.findOne({ where: { session_id, status: 'Active' } });
    if (!session) return res.status(404).json({ message: 'No active session found with that ID.' });

    // Find student by fingerprint_id, rfid, or student_id
    const profileWhere = {};
    if (fingerprint_id) profileWhere.fingerprint_id = fingerprint_id;
    else if (rfid) profileWhere.rfid = rfid;
    else if (student_id) profileWhere.student_id = student_id;
    else return res.status(400).json({ message: 'Must provide fingerprint_id, rfid, or student_id.' });

    const student = await StudentProfile.findOne({
      where: profileWhere,
      include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'photo'] }],
    });
    if (!student) return res.status(404).json({ message: 'Student not found in system.' });

    // Check for duplicate scan
    const existing = await AttendanceRecord.findOne({
      where: { sessionId: session.id, studentId: student.id },
    });
    if (existing) {
      await existing.increment('duplicate_scan_count');
      return res.json({ duplicate: true, record: existing, student });
    }

    // Determine status: Present or Late
    const minutesLate = Math.floor((new Date() - session.started_at) / 60000);
    const status = req.body.status || (minutesLate > session.late_threshold_minutes ? 'Late' : 'Present');

    const record = await AttendanceRecord.create({
      sessionId: session.id,
      studentId: student.id,
      status,
      verification_method,
      time: new Date(),
    });

    // Emit real-time update via Socket.IO
    if (req.io) {
      req.io.to(`session_${session.id}`).emit('scan', {
        record,
        student,
        status,
        time: record.time,
        method: verification_method
      });
    }

    res.status(201).json({ record, student, status, duplicate: false });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/records (manual entry)
const addManualRecord = async (req, res) => {
  try {
    const { sessionId, studentId, status, notes } = req.body;
    const existing = await AttendanceRecord.findOne({ where: { sessionId, studentId } });
    if (existing) {
      await existing.update({ status, notes });
      return res.json(existing);
    }
    const record = await AttendanceRecord.create({
      sessionId, studentId, status, notes,
      verification_method: 'Manual',
    });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/student/:studentId — student's own history
const getStudentHistory = async (req, res) => {
  try {
    const records = await AttendanceRecord.findAll({
      where: { studentId: req.params.studentId },
      include: [{
        model: AttendanceSession, as: 'session',
        include: [
          { model: Subject, as: 'subject' },
          { model: Course, as: 'course' },
          { model: User, as: 'teacher', attributes: ['first_name', 'last_name'] },
        ],
      }],
      order: [['time', 'DESC']],
    });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const clearSessionRecords = async (req, res) => {
  try {
    await AttendanceRecord.destroy({ where: { sessionId: req.params.id } });
    res.json({ message: 'Session records cleared.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getSessions, getSession, createSession, updateSession, getSessionRecords, scanAttendance, addManualRecord, getStudentHistory, clearSessionRecords };
