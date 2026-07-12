const User           = require('./User');
const StudentProfile = require('./StudentProfile');
const TeacherProfile = require('./TeacherProfile');
const { Department, Program, Course, Subject, Classroom, Semester } = require('./Academics');
const Device         = require('./Device');
const { AttendanceSession, AttendanceRecord, Notification, SystemSettings } = require('./Attendance');
const RFIDCard       = require('./RFIDCard');

module.exports = {
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
