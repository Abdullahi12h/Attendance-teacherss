const jwt = require('jsonwebtoken');
const { User, StudentProfile, TeacherProfile } = require('../models');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const user = await User.findOne({ username });
    if (!user || !user.is_active)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const valid = await user.validatePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken(user._id);

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: user._id });
    }

    const userObj = user.toJSON();
    const responseData = { ...userObj, id: user._id, profile };

    if (profile) {
      responseData.studentId    = profile.student_id;
      responseData.fingerprintId= profile.fingerprint_id;
      responseData.department   = profile.department;
      responseData.program      = profile.program;
      responseData.semester     = profile.semester;
      responseData.academicYear = profile.academic_year;
    }

    res.json({ access: token, refresh: 'mock_refresh_token_12345', user: responseData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already taken.' });

    const user = await User.create({ username, email, password, first_name, last_name, role });
    const token = signToken(user._id);
    res.status(201).json({ access: token, refresh: 'mock_refresh_token_12345', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ userId: user._id });
    }

    const userObj = user.toJSON();
    const responseData = { ...userObj, id: user._id, profile };

    if (profile) {
      responseData.studentId    = profile.student_id;
      responseData.fingerprintId= profile.fingerprint_id;
      responseData.department   = profile.department;
      responseData.program      = profile.program;
      responseData.semester     = profile.semester;
      responseData.academicYear = profile.academic_year;
    }

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, photo } = req.body;
    await User.findByIdAndUpdate(req.user._id, { first_name, last_name, email, phone, photo });
    const updated = await User.findById(req.user._id);
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const valid = await req.user.validatePassword(old_password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect.' });
    req.user.password = new_password;
    await req.user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, register, getMe, updateProfile, changePassword };
