const express = require('express');
const router = express.Router();
const Fault = require('../models/Fault');

// POST /api/fault — save a new fault record
router.post('/fault', async (req, res) => {
  try {
    const { distance, temperature, status } = req.body;
    if (distance === undefined || temperature === undefined || !status) {
      return res.status(400).json({ error: 'distance, temperature, and status are required' });
    }
    const fault = new Fault({ distance, temperature, status });
    await fault.save();
    return res.status(201).json({ message: 'Fault record saved', fault });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/faults — return all fault records sorted by timestamp desc
router.get('/faults', async (req, res) => {
  try {
    const faults = await Fault.find().sort({ timestamp: -1 });
    return res.json(faults);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/faults/latest — return most recent fault record
router.get('/faults/latest', async (req, res) => {
  try {
    const latest = await Fault.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.status(404).json({ message: 'No fault records found' });
    }
    return res.json(latest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
