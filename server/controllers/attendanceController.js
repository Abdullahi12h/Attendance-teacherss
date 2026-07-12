const { v4: uuidv4 } = require('uuid');
const { AttendanceSession, AttendanceRecord, StudentProfile, User, Subject, Course, Classroom, Semester, Device } = require('../models');

const sessionPopulate = [
  { path: 'teacherId', select: 'first_name last_name email photo', as: 'teacher' },
  { path: 'subjectId', model: 'Subject' },
  { path: 'courseId',  model: 'Course' },
  { path: 'classroomId', model: 'Classroom' },
  { path: 'semesterId', model: 'Semester' },
  { path: 'deviceId', model: 'Device' },
];

// GET /api/attendance/sessions
const getSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.user.role === 'teacher') filter.teacherId = req.user._id;

    const total = await AttendanceSession.countDocuments(filter);
    const sessions = await AttendanceSession.find(filter)
      .populate('teacherId', 'first_name last_name email photo')
      .populate('subjectId')
      .populate('courseId')
      .populate('classroomId')
      .populate('semesterId')
      .populate('deviceId')
      .sort({ started_at: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ sessions, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/sessions/:id
const getSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('teacherId', 'first_name last_name email photo')
      .populate('subjectId').populate('courseId')
      .populate('classroomId').populate('semesterId').populate('deviceId');
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/sessions
const createSession = async (req, res) => {
  try {
    const { subjectId, courseId, classroomId, semesterId, deviceId, section, late_threshold_minutes, lat, lng } = req.body;
    const session_id = `SES-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    const session = await AttendanceSession.create({
      session_id,
      teacherId: req.user._id,
      subjectId, courseId, classroomId, semesterId, deviceId,
      section: section || 'A',
      late_threshold_minutes: late_threshold_minutes || 15,
      status: 'Active',
      lat: lat || null,
      lng: lng || null,
    });

    const result = await AttendanceSession.findById(session._id)
      .populate('teacherId', 'first_name last_name email photo')
      .populate('subjectId').populate('courseId')
      .populate('classroomId').populate('semesterId').populate('deviceId');
    res.status(201).json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/attendance/sessions/:id
const updateSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const updates = { ...req.body };
    if (req.body.status === 'Finished' && !session.finished_at) {
      updates.finished_at = new Date();
    }
    Object.assign(session, updates);
    await session.save();

    const result = await AttendanceSession.findById(session._id)
      .populate('teacherId', 'first_name last_name email photo')
      .populate('subjectId').populate('courseId')
      .populate('classroomId').populate('semesterId').populate('deviceId');
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/sessions/:id/records
const getSessionRecords = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ sessionId: req.params.id })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'first_name last_name email photo' }
      })
      .sort({ time: 1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/scan
const scanAttendance = async (req, res) => {
  try {
    const { session_id, fingerprint_id, rfid, student_id, verification_method = 'Fingerprint' } = req.body;

    const session = await AttendanceSession.findOne({ session_id, status: 'Active' });
    if (!session) return res.status(404).json({ message: 'No active session found with that ID.' });

    const profileFilter = {};
    if (fingerprint_id) profileFilter.fingerprint_id = fingerprint_id;
    else if (rfid) profileFilter.rfid = rfid;
    else if (student_id) profileFilter.student_id = student_id;
    else return res.status(400).json({ message: 'Must provide fingerprint_id, rfid, or student_id.' });

    const student = await StudentProfile.findOne(profileFilter)
      .populate('userId', 'first_name last_name photo');
    if (!student) return res.status(404).json({ message: 'Student not found in system.' });

    const existing = await AttendanceRecord.findOne({ sessionId: session._id, studentId: student._id });
    if (existing) {
      existing.duplicate_scan_count += 1;
      await existing.save();
      return res.json({ duplicate: true, record: existing, student });
    }

    const minutesLate = Math.floor((new Date() - session.started_at) / 60000);
    const status = req.body.status || (minutesLate > session.late_threshold_minutes ? 'Late' : 'Present');

    const record = await AttendanceRecord.create({
      sessionId: session._id,
      studentId: student._id,
      status,
      verification_method,
      time: new Date(),
    });

    if (req.io) {
      req.io.to(`session_${session._id}`).emit('scan', {
        record, student, status, time: record.time, method: verification_method
      });
    }

    res.status(201).json({ record, student, status, duplicate: false });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/records (manual entry)
const addManualRecord = async (req, res) => {
  try {
    const { sessionId, studentId, status, notes } = req.body;
    const existing = await AttendanceRecord.findOne({ sessionId, studentId });
    if (existing) {
      existing.status = status;
      existing.notes  = notes;
      await existing.save();
      return res.json(existing);
    }
    const record = await AttendanceRecord.create({
      sessionId, studentId, status, notes, verification_method: 'Manual',
    });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/student/:studentId
const getStudentHistory = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ studentId: req.params.studentId })
      .populate({
        path: 'sessionId',
        populate: [
          { path: 'subjectId' },
          { path: 'courseId' },
          { path: 'teacherId', select: 'first_name last_name' },
        ]
      })
      .sort({ time: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const clearSessionRecords = async (req, res) => {
  try {
    await AttendanceRecord.deleteMany({ sessionId: req.params.id });
    res.json({ message: 'Session records cleared.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getSessions, getSession, createSession, updateSession, getSessionRecords, scanAttendance, addManualRecord, getStudentHistory, clearSessionRecords };
