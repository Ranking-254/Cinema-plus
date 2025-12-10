const Seat = require('../models/Seat');

// 1. GET ALL SEATS
exports.getSeatsByEventId = async (eventId) => {
  // Find all seats for this event
  // .sort({ row: 1, number: 1 }) ensures they come out in order: A1, A2, B1...
  const seats = await Seat.find({ event: eventId })
                          .sort({ row: 1, number: 1 });
  return seats;
};

// 2. HOLD SEAT
exports.holdSeat = async (seatId, userId) => {
  // 10 minutes hold time
  const holdDuration = 10 * 60 * 1000; 
  const expiresAt = new Date(Date.now() + holdDuration);

  const updatedSeat = await Seat.findOneAndUpdate(
    { _id: seatId, status: 'AVAILABLE' }, // Filter
    { 
      $set: { 
        status: 'HELD', 
        userId: userId, 
        holdExpiresAt: expiresAt 
      } 
    },
    { new: true }
  );

  return updatedSeat;
};

// 3. BOOK SEAT (Payment Confirmed)
exports.bookSeat = async (seatId, userId) => {
  const seat = await Seat.findOneAndUpdate(
    { 
      _id: seatId, 
      status: 'HELD',
      userId: userId,
      holdExpiresAt: { $gt: new Date() } // Must not be expired
    },
    { 
      $set: { 
        status: 'SOLD',
        holdExpiresAt: null // Clear timer
      } 
    },
    { new: true }
  );

  return seat;
};

// 4. RELEASE SEAT
exports.releaseSeat = async (seatId, userId) => {
  const seat = await Seat.findOneAndUpdate(
    { 
      _id: seatId, 
      status: 'HELD',
      userId: userId 
    },
    { 
      $set: { 
        status: 'AVAILABLE', 
        userId: null, 
        holdExpiresAt: null 
      } 
    },
    { new: true }
  );
  return seat;
};

// 5. RESET THEATER (Admin)
exports.resetAllSeats = async () => {
  const result = await Seat.updateMany(
    {},
      { 
      $set: { 
        status: 'AVAILABLE', 
        userId: null, 
        holdExpiresAt: null,
        version: 0 
      } 
    }
  );
  return result;
};

// 6. GET USER TICKETS (Hii ilikuwa imejificha, sasa iko nje!) ✅
exports.getUserTickets = async (userId) => {
  // Find seats that are SOLD and belong to this user
  const tickets = await Seat.find({ userId: userId, status: 'SOLD' });
  return tickets;
};