const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  session_id:            { type: String, required: true, unique: true },
  teacherId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  courseId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  classroomId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null },
  semesterId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
  deviceId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Device', default: null },
  section:               { type: String, default: 'A' },
  started_at:            { type: Date, default: Date.now },
  finished_at:           { type: Date, default: null },
  status:                { type: String, enum: ['Active', 'Paused', 'Finished'], default: 'Active' },
  late_threshold_minutes:{ type: Number, default: 15 },
  total_students:        { type: Number, default: 0 },
  lat:                   { type: Number, default: null },
  lng:                   { type: Number, default: null },
}, { timestamps: true });

const attendanceRecordSchema = new mongoose.Schema({
  sessionId:          { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  studentId:          { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  time:               { type: Date, default: Date.now },
  status:             { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
  verification_method:{ type: String, enum: ['Fingerprint', 'RFID', 'Manual', 'QR'], default: 'Fingerprint' },
  duplicate_scan_count:{ type: Number, default: 0 },
  notes:              { type: String, default: null },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  message:     { type: String, required: true },
  type:        { type: String, enum: ['Info', 'Warning', 'Success', 'Error'], default: 'Info' },
  is_read:     { type: Boolean, default: false },
}, { timestamps: true });

const systemSettingsSchema = new mongoose.Schema({
  university_name:       { type: String, default: 'Smart University' },
  university_logo:       { type: String, default: null },
  primary_color:         { type: String, default: '#4F46E5' },
  dark_mode:             { type: Boolean, default: false },
  language:              { type: String, default: 'en' },
  timezone:              { type: String, default: 'Africa/Nairobi' },
  late_threshold_minutes:{ type: Number, default: 15 },
  allow_manual_entry:    { type: Boolean, default: true },
}, { timestamps: true });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
const AttendanceRecord  = mongoose.model('AttendanceRecord', attendanceRecordSchema);
const Notification      = mongoose.model('Notification', notificationSchema);
const SystemSettings    = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = { AttendanceSession, AttendanceRecord, Notification, SystemSettings };
