const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const { login, register, getMe, updateProfile, changePassword } = require('../controllers/authController');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'smart_attendance_jwt_secret_key_2024_change_me', { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

router.post('/login', login);
router.post('/login/', login);
router.post('/register', register);
router.post('/register/', register);
router.get('/me', protect, getMe);
router.get('/me/', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile/', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/change-password/', protect, changePassword);

// Mock token refresh endpoint
router.post('/token/refresh', (req, res) => {
  const refresh = req.body.refresh;
  if (!refresh) return res.status(400).json({ message: 'Refresh token required' });
  const token = signToken(req.body.userId || 1);
  res.json({ access: token });
});
router.post('/token/refresh/', (req, res) => {
  const refresh = req.body.refresh;
  if (!refresh) return res.status(400).json({ message: 'Refresh token required' });
  const token = signToken(req.body.userId || 1);
  res.json({ access: token });
});

module.exports = router;
