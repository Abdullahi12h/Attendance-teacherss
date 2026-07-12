const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AttendanceSession = sequelize.define('AttendanceSession', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  session_id: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  section: { type: DataTypes.STRING(20), defaultValue: 'A' },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  finished_at: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM('Active', 'Paused', 'Finished'),
    defaultValue: 'Active',
  },
  late_threshold_minutes: { type: DataTypes.INTEGER, defaultValue: 15 },
  total_students: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'attendance_sessions' });

const AttendanceRecord = sequelize.define('AttendanceRecord', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.ENUM('Present', 'Late', 'Absent'),
    defaultValue: 'Present',
  },
  verification_method: {
    type: DataTypes.ENUM('Fingerprint', 'RFID', 'Manual', 'QR'),
    defaultValue: 'Fingerprint',
  },
  duplicate_scan_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'attendance_records' });

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('Info', 'Warning', 'Success', 'Error'),
    defaultValue: 'Info',
  },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });

const SystemSettings = sequelize.define('SystemSettings', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  university_name: { type: DataTypes.STRING(200), defaultValue: 'Smart University' },
  university_logo: { type: DataTypes.STRING(500), allowNull: true },
  primary_color: { type: DataTypes.STRING(20), defaultValue: '#4F46E5' },
  dark_mode: { type: DataTypes.BOOLEAN, defaultValue: false },
  language: { type: DataTypes.STRING(10), defaultValue: 'en' },
  timezone: { type: DataTypes.STRING(50), defaultValue: 'Africa/Nairobi' },
  late_threshold_minutes: { type: DataTypes.INTEGER, defaultValue: 15 },
  allow_manual_entry: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'system_settings' });

module.exports = { AttendanceSession, AttendanceRecord, Notification, SystemSettings };
