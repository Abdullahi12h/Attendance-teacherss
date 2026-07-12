const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  device_id: { type: String, required: true, unique: true },
  ip:        { type: String, required: true },
  battery:   { type: Number, default: 100 },
  wifi:      { type: String, default: 'Excellent' },
  status:    { type: String, enum: ['Connected', 'Battery Alert', 'Offline'], default: 'Connected' },
  last_sync: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
