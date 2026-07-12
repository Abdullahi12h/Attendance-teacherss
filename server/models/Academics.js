const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hod:  { type: String, default: null },
  room: { type: String, default: null },
}, { timestamps: true });

const programSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  duration:     { type: String, default: '4 Years' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  credits:   { type: Number, default: 3 },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  code:     { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  hours:    { type: Number, default: 3 },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
}, { timestamps: true });

const classroomSchema = new mongoose.Schema({
  room_number: { type: String, required: true, unique: true },
  building:    { type: String, required: true },
  capacity:    { type: Number, default: 50 },
  device_uuid: { type: String, default: null },
}, { timestamps: true });

const semesterSchema = new mongoose.Schema({
  term:       { type: String, required: true, unique: true },
  start_date: { type: Date, required: true },
  end_date:   { type: Date, required: true },
  status:     { type: String, enum: ['Active', 'Upcoming', 'Completed'], default: 'Upcoming' },
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
const Program    = mongoose.model('Program', programSchema);
const Course     = mongoose.model('Course', courseSchema);
const Subject    = mongoose.model('Subject', subjectSchema);
const Classroom  = mongoose.model('Classroom', classroomSchema);
const Semester   = mongoose.model('Semester', semesterSchema);

module.exports = { Department, Program, Course, Subject, Classroom, Semester };
