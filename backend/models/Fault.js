const mongoose = require('mongoose');

const FaultSchema = new mongoose.Schema({
  distance: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['FAULT', 'NORMAL', 'WARNING'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Fault', FaultSchema);
