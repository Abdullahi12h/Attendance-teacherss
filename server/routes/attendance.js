const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const ctrl = require('../controllers/attendanceController');

// Sessions
router.get('/sessions', protect, ctrl.getSessions);
router.get('/sessions/:id', protect, ctrl.getSession);
router.post('/sessions', protect, roles('admin', 'teacher'), ctrl.createSession);
router.put('/sessions/:id', protect, roles('admin', 'teacher'), ctrl.updateSession);

// Records
router.get('/sessions/:id/records', protect, ctrl.getSessionRecords);
router.post('/records', protect, roles('admin', 'teacher'), ctrl.addManualRecord);
router.delete('/sessions/:id/records', protect, roles('admin', 'teacher'), ctrl.clearSessionRecords);

// Fingerprint scan — can be called by hardware (public) or teacher (protected)
// We allow both: if Authorization header is present, protect validates; otherwise it's from hardware
router.post('/scan', ctrl.scanAttendance); // Hardware can call without auth

// Student's own attendance history
router.get('/student/:studentId', protect, ctrl.getStudentHistory);

// Live active attendance feed
const { getLiveAttendance } = require('../controllers/rfidController');
router.get('/live', protect, getLiveAttendance);

module.exports = router;
