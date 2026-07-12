const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const { getDashboardStats, getAttendanceReport, getSettings, updateSettings } = require('../controllers/reportsController');

router.get('/dashboard', protect, getDashboardStats);
router.get('/attendance', protect, getAttendanceReport);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, roles('admin'), updateSettings);

module.exports = router;
