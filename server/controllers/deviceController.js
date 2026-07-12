const { Device } = require('../models');

// GET /api/devices
const getDevices = async (req, res) => {
  try { 
    const devices = await Device.find().sort({ name: 1 });
    res.json(devices); 
  }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/devices
const createDevice = async (req, res) => {
  try { 
    const device = await Device.create(req.body);
    res.status(201).json(device); 
  }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/devices/:id
const updateDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found.' });
    Object.assign(device, req.body);
    await device.save();
    res.json(device);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/devices/:id
const deleteDevice = async (req, res) => {
  try {
    await Device.findByIdAndDelete(req.params.id);
    res.json({ message: 'Device deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/devices/:id/ping
const pingDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found.' });

    // Simulate ping — in production this would actually ping the device IP
    const isOnline = Math.random() > 0.2; // 80% success rate simulation
    const newStatus = isOnline ? 'Connected' : 'Offline';
    
    device.status = newStatus;
    device.last_sync = new Date();
    await device.save();

    res.json({ success: isOnline, status: newStatus, device });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/devices/heartbeat — called by hardware devices to report status
const deviceHeartbeat = async (req, res) => {
  try {
    const { device_id, battery, wifi, ip } = req.body;
    const device = await Device.findOne({ device_id });
    if (!device) return res.status(404).json({ message: 'Device not registered.' });

    const batteryStatus = battery <= 20 ? 'Battery Alert' : 'Connected';
    
    device.battery = battery;
    device.wifi = wifi;
    device.ip = ip;
    device.status = batteryStatus;
    device.last_sync = new Date();
    await device.save();

    res.json({ message: 'Heartbeat received.', device });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getDevices, createDevice, updateDevice, deleteDevice, pingDevice, deviceHeartbeat };
