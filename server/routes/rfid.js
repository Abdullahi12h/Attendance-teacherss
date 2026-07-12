const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const {
  scanRFIDCard,
  registerRFIDCard,
  getRFIDCards,
  getLiveAttendance
} = require('../controllers/rfidController');

// Scanning RFID card (can be called by simulated hardware clients/scripts)
router.post('/scan', scanRFIDCard);

// Managing RFID Cards (Admins only)
router.post('/register', protect, roles('admin'), registerRFIDCard);
router.get('/cards', protect, roles('admin'), getRFIDCards);

// Live active attendance feed (Accessible by admins, teachers, and students)
router.get('/live', protect, getLiveAttendance);

module.exports = router;
