const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An event must have a title'],
    trim: true
  },
  description: String,
  date: {
    type: Date,
    required: [true, 'An event must have a date']
  },
  venue: {
    type: String,
    required: true
  },
  // We keep a simple counter for convenience, but the real data is in the Seat collection
  totalSeats: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;