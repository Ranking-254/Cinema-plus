// services/event.service.js
const Event = require('../models/Events');
const Seat = require('../models/Seat');

// 1. For creating new events (Admin)
exports.createEventWithSeats = async (eventData) => {
  const newEvent = await Event.create(eventData);
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 10;
  const seats = [];

  rows.forEach((row) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      seats.push({
        event: newEvent._id,
        row: row,
        number: i,
        price: eventData.basePrice || 10,
        status: 'AVAILABLE'
      });
    }
  });

  await Seat.insertMany(seats);
  return newEvent;
};

// 2. For the Booking Page (FETCH SINGLE)
exports.getEventById = async (id) => {
  return await Event.findById(id);
};

// 🚀 3. ADD THIS FOR THE GALLERY (FETCH ALL)
exports.getAllEvents = async () => {
  // Sort by date so the upcoming events appear first
  return await Event.find().sort({ date: 1 });
};