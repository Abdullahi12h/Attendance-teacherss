const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RFIDCard = sequelize.define('RFIDCard', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  uid: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Disabled'),
    defaultValue: 'Active'
  },
  last_scanned: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'rfid_cards',
  timestamps: true
});

module.exports = RFIDCard;
