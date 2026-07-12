const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true, trim: true },
  email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:   { type: String, required: true },
  first_name: { type: String, default: '' },
  last_name:  { type: String, default: '' },
  role:       { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  photo:      { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  phone:      { type: String, default: null },
  is_active:  { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Hash on findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && update.password) {
    update.password = await bcrypt.hash(update.password, 12);
  }
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
