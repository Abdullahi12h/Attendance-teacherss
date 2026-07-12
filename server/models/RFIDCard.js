const mongoose = require('mongoose');

const rfidCardSchema = new mongoose.Schema({
  uid:              { type: String, required: true, unique: true },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', default: null },
  status:           { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
  last_scanned:     { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('RFIDCard', rfidCardSchema);
