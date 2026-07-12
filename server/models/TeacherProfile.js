const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employee_id: { type: String, required: true, unique: true },
  department:  { type: String, default: '' },
  status:      { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
