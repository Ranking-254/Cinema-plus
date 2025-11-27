const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  row: {
    type: String,
    required: true,
    trim: true // e.g., "A", "B"
  },
  number: {
    type: Number,
    required: true // e.g., 1, 2, 3
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'HELD', 'SOLD'],
    default: 'AVAILABLE'
  },
  // This is for the "Hold" timer
  holdExpiresAt: {
    type: Date,
    default: null
  },
  // If held or sold, who owns it? (We will add User model later, for now just store ID)
  userId: {
    type: String,
    default: null
  },
  // OPTIMISTIC CONCURRENCY: The version number prevents race conditions
  version: {
    type: Number,
    default: 0
  }
});

// CRITICAL: Prevent duplicate seats (e.g., Row A, Seat 1) for the same Event
seatSchema.index({ event: 1, row: 1, number: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;