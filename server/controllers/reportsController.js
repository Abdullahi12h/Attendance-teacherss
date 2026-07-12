const { User, StudentProfile, TeacherProfile, AttendanceSession, AttendanceRecord, SystemSettings } = require('../models');

// GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, totalTeachers, activeSessions, todayRecords, settings] = await Promise.all([
      StudentProfile.countDocuments({ status: 'Active' }),
      TeacherProfile.countDocuments({ status: 'Active' }),
      AttendanceSession.countDocuments({ status: 'Active' }),
      AttendanceRecord.aggregate([
        { $match: { time: { $gte: today } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      SystemSettings.findOne(),
    ]);

    const todayStats = { Present: 0, Late: 0, Absent: 0 };
    todayRecords.forEach(r => {
      if (r._id) {
        todayStats[r._id] = r.count;
      }
    });

    res.json({
      totalStudents,
      totalTeachers,
      activeSessions,
      today: {
        total: todayStats.Present + todayStats.Late + todayStats.Absent,
        present: todayStats.Present,
        late: todayStats.Late,
        absent: todayStats.Absent,
      },
      settings,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/reports/attendance?period=week|month|semester&subjectId=&sessionId=&from=&to=
const getAttendanceReport = async (req, res) => {
  try {
    const { period, subjectId, sessionId, from, to } = req.query;

    let startDate = new Date();
    if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (period === 'semester') startDate.setMonth(startDate.getMonth() - 6);
    else if (from) startDate = new Date(from);

    const recordQuery = {
      time: { $gte: startDate }
    };
    if (to) {
      recordQuery.time.$lte = new Date(to);
    }

    if (sessionId) {
      recordQuery.sessionId = sessionId;
    } else if (subjectId) {
      const sessions = await AttendanceSession.find({ subjectId });
      const sessionIds = sessions.map(s => s._id);
      recordQuery.sessionId = { $in: sessionIds };
    }

    const records = await AttendanceRecord.find(recordQuery)
      .populate({
        path: 'sessionId',
        populate: [
          { path: 'subjectId' },
          { path: 'courseId' },
          { path: 'classroomId' },
          { path: 'semesterId' },
          { path: 'deviceId' }
        ]
      })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'first_name last_name photo' }
      })
      .sort({ time: -1 });

    // Map to Sequelize structure so frontend doesn't break
    const formattedRecords = records.map(r => {
      const obj = r.toObject();
      obj.session = obj.sessionId;
      obj.student = obj.studentId;
      delete obj.sessionId;
      delete obj.studentId;
      return obj;
    });

    // Summary stats
    const summary = { Present: 0, Late: 0, Absent: 0 };
    formattedRecords.forEach(r => { summary[r.status] = (summary[r.status] || 0) + 1; });

    res.json({ records: formattedRecords, summary, total: formattedRecords.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/reports/settings
const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/reports/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getDashboardStats, getAttendanceReport, getSettings, updateSettings };
