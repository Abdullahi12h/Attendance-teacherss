const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getQRToken, verifyQRToken } = require('../controllers/qrController');

// Teacher gets a fresh QR token (called every 30s by the frontend timer)
router.get('/token', protect, getQRToken);

// Student verifies the scanned QR token (student must be authenticated)
router.post('/verify', protect, verifyQRToken);

module.exports = router;
