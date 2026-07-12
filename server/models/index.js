const sequelize = require('../config/db');
const User = require('./User');
const StudentProfile = require('./StudentProfile');
const TeacherProfile = require('./TeacherProfile');
const { Department, Program, Course, Subject, Classroom, Semester } = require('./Academics');
const Device = require('./Device');
const { AttendanceSession, AttendanceRecord, Notification, SystemSettings } = require('./Attendance');
const RFIDCard = require('./RFIDCard');

// ── User ↔ Profiles ──────────────────────────────────────────────────────────
User.hasOne(StudentProfile, { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── StudentProfile ↔ RFIDCard ───────────────────────────────────────────────
StudentProfile.hasOne(RFIDCard, { foreignKey: 'studentProfileId', as: 'rfidCard', onDelete: 'SET NULL' });
RFIDCard.belongsTo(StudentProfile, { foreignKey: 'studentProfileId', as: 'student' });

User.hasOne(TeacherProfile, { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' });
TeacherProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Academics ─────────────────────────────────────────────────────────────────
Department.hasMany(Program, { foreignKey: 'departmentId', as: 'programs' });
Program.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Program.hasMany(Course, { foreignKey: 'programId', as: 'courses' });
Course.belongsTo(Program, { foreignKey: 'programId', as: 'program' });

Course.hasMany(Subject, { foreignKey: 'courseId', as: 'subjects' });
Subject.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// ── Attendance Sessions ───────────────────────────────────────────────────────
User.hasMany(AttendanceSession, { foreignKey: 'teacherId', as: 'sessions' });
AttendanceSession.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

Course.hasMany(AttendanceSession, { foreignKey: 'courseId', as: 'sessions' });
AttendanceSession.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Subject.hasMany(AttendanceSession, { foreignKey: 'subjectId', as: 'sessions' });
AttendanceSession.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Classroom.hasMany(AttendanceSession, { foreignKey: 'classroomId', as: 'sessions' });
AttendanceSession.belongsTo(Classroom, { foreignKey: 'classroomId', as: 'classroom' });

Semester.hasMany(AttendanceSession, { foreignKey: 'semesterId', as: 'sessions' });
AttendanceSession.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

Device.hasMany(AttendanceSession, { foreignKey: 'deviceId', as: 'sessions' });
AttendanceSession.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

// ── Attendance Records ────────────────────────────────────────────────────────
AttendanceSession.hasMany(AttendanceRecord, { foreignKey: 'sessionId', as: 'records', onDelete: 'CASCADE' });
AttendanceRecord.belongsTo(AttendanceSession, { foreignKey: 'sessionId', as: 'session' });

StudentProfile.hasMany(AttendanceRecord, { foreignKey: 'studentId', as: 'attendanceRecords' });
AttendanceRecord.belongsTo(StudentProfile, { foreignKey: 'studentId', as: 'student' });

// ── Notifications ─────────────────────────────────────────────────────────────
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  StudentProfile,
  TeacherProfile,
  Department,
  Program,
  Course,
  Subject,
  Classroom,
  Semester,
  Device,
  AttendanceSession,
  AttendanceRecord,
  Notification,
  SystemSettings,
  RFIDCard,
};
