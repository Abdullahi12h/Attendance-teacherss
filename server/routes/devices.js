const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roles } = require('../middleware/roles');
const { getDevices, createDevice, updateDevice, deleteDevice, pingDevice, deviceHeartbeat } = require('../controllers/deviceController');

router.get('/', protect, getDevices);
router.post('/', protect, roles('admin'), createDevice);
router.put('/:id', protect, roles('admin'), updateDevice);
router.delete('/:id', protect, roles('admin'), deleteDevice);
router.post('/:id/ping', protect, pingDevice);
router.post('/heartbeat', deviceHeartbeat); // No auth — called by hardware

module.exports = router;
