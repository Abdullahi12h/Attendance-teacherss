const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TeacherProfile = sequelize.define('TeacherProfile', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employee_id: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  department: { type: DataTypes.STRING(100), defaultValue: '' },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
}, { tableName: 'teacher_profiles' });

module.exports = TeacherProfile;
