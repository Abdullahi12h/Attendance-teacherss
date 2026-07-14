const mongoose = require('mongoose');

// Configure global schema options to serialize _id to id in JSON
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  });
  schema.set('toObject', {
    virtuals: true
  });
});

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
