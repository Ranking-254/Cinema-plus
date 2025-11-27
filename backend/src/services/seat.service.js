const Seat = require('../models/Seat');

exports.getSeatsByEventId = async (eventId) => {
  // Find all seats for this event
  // .sort({ row: 1, number: 1 }) ensures they come out in order: A1, A2, B1...
  const seats = await Seat.find({ event: eventId })
                          .sort({ row: 1, number: 1 });
  return seats;
};


//hii iko responsible for hold 

exports.holdSeat = async (seatId, userId) => {
  
  // 1. Calculate expiration time (10 mins from now)
  const holdDuration = 10 *60* 1000; // 10 minutes in ms///currently set for 10 seconds for development
  const expiresAt = new Date(Date.now() + holdDuration);

  // 2. The Atomic Operation
  // We search for the seat by ID *AND* check that status is 'AVAILABLE'
  // If the status is already 'HELD' or 'SOLD', this finds nothing and returns null.
  const updatedSeat = await Seat.findOneAndUpdate(
    { _id: seatId, status: 'AVAILABLE' }, // Filter
    { 
      $set: { 
        status: 'HELD', 
        userId: userId, 
        holdExpiresAt: expiresAt 
      } 
    },
    { new: true } // Return the updated document, not the old one
  );

  return updatedSeat;
};

//hii inaangalia kama umelipa dio itoke from hold to sold
exports.bookSeat = async (seatId, userId) => {
  // Logic: 
  // 1. Find the seat
  // 2. MUST be status 'HELD'
  // 3. MUST be held by THIS user
  // 4. MUST NOT be expired (holdExpiresAt > Now)
  
  const seat = await Seat.findOneAndUpdate(
    { 
      _id: seatId, 
      status: 'HELD',
      userId: userId,
      holdExpiresAt: { $gt: new Date() } // $gt means "Greater Than" (future)
    },
    { 
      $set: { 
        status: 'SOLD',
        holdExpiresAt: null // Clear the timer, it's theirs forever now
      } 
    },
    { new: true }
  );

  return seat;
};

//release seat
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

// 4. RESET THEATER (Admin)
exports.resetAllSeats = async (eventId) => {
  // UpdateMany finds ALL matching documents and updates them at once
  const result = await Seat.updateMany(
    { event: eventId }, 
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