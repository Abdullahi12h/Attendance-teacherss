const { User, StudentProfile, TeacherProfile, AttendanceSession, AttendanceRecord, Notification, SystemSettings } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// GET /api/reports/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, totalTeachers, activeSessions, todayRecords, settings] = await Promise.all([
      StudentProfile.count({ where: { status: 'Active' } }),
      TeacherProfile.count({ where: { status: 'Active' } }),
      AttendanceSession.count({ where: { status: 'Active' } }),
      AttendanceRecord.findAll({
        where: { time: { [Op.gte]: today } },
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      SystemSettings.findOne(),
    ]);

    const todayStats = { Present: 0, Late: 0, Absent: 0 };
    todayRecords.forEach(r => { todayStats[r.status] = parseInt(r.count); });

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

// GET /api/reports/attendance?period=week|month|semester&subjectId=&sessionId=
const getAttendanceReport = async (req, res) => {
  try {
    const { period, subjectId, sessionId, from, to } = req.query;

    let startDate = new Date();
    if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (period === 'semester') startDate.setMonth(startDate.getMonth() - 6);
    else if (from) startDate = new Date(from);

    const sessionWhere = {};
    if (subjectId) sessionWhere.subjectId = subjectId;
    if (sessionId) sessionWhere.id = sessionId;

    const records = await AttendanceRecord.findAll({
      where: {
        time: { [Op.gte]: startDate, ...(to ? { [Op.lte]: new Date(to) } : {}) },
      },
      include: [
        {
          model: AttendanceSession, as: 'session',
          where: sessionWhere,
        },
        {
          model: StudentProfile, as: 'student',
          include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
        },
      ],
      order: [['time', 'DESC']],
    });

    // Summary stats
    const summary = { Present: 0, Late: 0, Absent: 0 };
    records.forEach(r => { summary[r.status] = (summary[r.status] || 0) + 1; });

    res.json({ records, summary, total: records.length });
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
    await settings.update(req.body);
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getDashboardStats, getAttendanceReport, getSettings, updateSettings };
