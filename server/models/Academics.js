const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  hod: { type: DataTypes.STRING(100), allowNull: true },
  room: { type: DataTypes.STRING(50), allowNull: true },
}, { tableName: 'departments' });

const Program = sequelize.define('Program', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  duration: { type: DataTypes.STRING(50), defaultValue: '4 Years' },
}, { tableName: 'programs' });

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  credits: { type: DataTypes.INTEGER, defaultValue: 3 },
}, { tableName: 'courses' });

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  hours: { type: DataTypes.INTEGER, defaultValue: 3 },
}, { tableName: 'subjects' });

const Classroom = sequelize.define('Classroom', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  room_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  building: { type: DataTypes.STRING(100), allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 50 },
  device_uuid: { type: DataTypes.STRING(100), allowNull: true },
}, { tableName: 'classrooms' });

const Semester = sequelize.define('Semester', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  term: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Upcoming', 'Completed'), defaultValue: 'Upcoming' },
}, { tableName: 'semesters' });

module.exports = { Department, Program, Course, Subject, Classroom, Semester };
