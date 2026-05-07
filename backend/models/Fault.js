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
  phase: {
    type: String,
    enum: ['R', 'Y', 'B', 'ALL', 'NONE'],
    default: 'NONE',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Fault', FaultSchema);
