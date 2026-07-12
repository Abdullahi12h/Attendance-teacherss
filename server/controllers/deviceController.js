const { Device } = require('../models');

const getDevices = async (req, res) => {
  try { res.json(await Device.findAll({ order: [['name', 'ASC']] })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const createDevice = async (req, res) => {
  try { res.status(201).json(await Device.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found.' });
    await device.update(req.body);
    res.json(device);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteDevice = async (req, res) => {
  try {
    await Device.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Device deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/devices/:id/ping
const pingDevice = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    if (!device) return res.status(404).json({ message: 'Device not found.' });

    // Simulate ping — in production this would actually ping the device IP
    const isOnline = Math.random() > 0.2; // 80% success rate simulation
    const newStatus = isOnline ? 'Connected' : 'Offline';
    await device.update({ status: newStatus, last_sync: new Date() });

    res.json({ success: isOnline, status: newStatus, device });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/devices/heartbeat  — called by hardware devices to report status
const deviceHeartbeat = async (req, res) => {
  try {
    const { device_id, battery, wifi, ip } = req.body;
    const device = await Device.findOne({ where: { device_id } });
    if (!device) return res.status(404).json({ message: 'Device not registered.' });

    const batteryStatus = battery <= 20 ? 'Battery Alert' : 'Connected';
    await device.update({ battery, wifi, ip, status: batteryStatus, last_sync: new Date() });
    res.json({ message: 'Heartbeat received.', device });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getDevices, createDevice, updateDevice, deleteDevice, pingDevice, deviceHeartbeat };
