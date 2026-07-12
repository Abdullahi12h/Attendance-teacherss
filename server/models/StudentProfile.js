const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentProfile = sequelize.define('StudentProfile', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  gender: { type: DataTypes.ENUM('Male', 'Female'), defaultValue: 'Male' },
  department: { type: DataTypes.STRING(100), defaultValue: '' },
  program: { type: DataTypes.STRING(100), defaultValue: '' },
  semester: { type: DataTypes.STRING(50), defaultValue: '' },
  academic_year: { type: DataTypes.STRING(50), defaultValue: '' },
  guardian: { type: DataTypes.STRING(100), allowNull: true },
  fingerprint_id: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  rfid: { type: DataTypes.STRING(50), allowNull: true },
  qr_code: { type: DataTypes.STRING(100), allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
}, { tableName: 'student_profiles' });

module.exports = StudentProfile;
