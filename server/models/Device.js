const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  device_id: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  ip: { type: DataTypes.STRING(45), allowNull: false },
  battery: { type: DataTypes.INTEGER, defaultValue: 100 },
  wifi: { type: DataTypes.STRING(50), defaultValue: 'Excellent' },
  status: {
    type: DataTypes.ENUM('Connected', 'Battery Alert', 'Offline'),
    defaultValue: 'Connected',
  },
  last_sync: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'devices' });

module.exports = Device;
