const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  student_id:   { type: String, required: true, unique: true },
  gender:       { type: String, enum: ['Male', 'Female'], default: 'Male' },
  department:   { type: String, default: '' },
  program:      { type: String, default: '' },
  semester:     { type: String, default: '' },
  academic_year:{ type: String, default: '' },
  guardian:     { type: String, default: null },
  fingerprint_id:{ type: String, default: null, unique: true, sparse: true },
  rfid:         { type: String, default: null },
  qr_code:      { type: String, default: null },
  status:       { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
