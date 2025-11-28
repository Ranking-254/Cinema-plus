const seatService = require('../services/seat.service');

// 1. GET ALL SEATS
exports.getEventSeats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const seats = await seatService.getSeatsByEventId(eventId);

    res.status(200).json({
      status: 'success',
      results: seats.length,
      data: seats
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. HOLD SEAT 
exports.holdSeat = async (req, res) => {
  console.log("👉 1. Request reached Controller!"); 

  try {
    // A. Extract Data
    const { seatId } = req.body;
    
    // Check if Clerk Auth worked
    if (!req.auth || !req.auth.userId) {
        console.log("❌ No Auth found. User not logged in?");
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.auth.userId;
    console.log(`👉 2. User ID: ${userId}, Seat ID: ${seatId}`);

    // B. Call Service
    const seat = await seatService.holdSeat(seatId, userId);
    console.log("👉 3. Service finished. Result:", seat ? "Seat Held" : "Failed (Null)");

    if (!seat) {
      return res.status(409).json({
        status: 'fail',
        message: 'Seat is not available (already held or sold).'
      });
    }

    // C. Broadcast to Socket
    try {
        const io = req.app.get('io');
        io.emit('seat_updated', seat);
        console.log("👉 4. Socket message emitted");
    } catch (err) {
        console.error("⚠️ Socket Error (Non-fatal):", err.message);
    }

    // D. Send Response
    res.status(200).json({
      status: 'success',
      data: seat
    });
    console.log("👉 5. Response sent successfully!");

  } catch (error) {
    console.error("💥 CRITICAL ERROR in holdSeat:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. BOOK SEAT
exports.bookSeat = async (req, res) => {
  try {
    const { seatId } = req.body;
    const userId = req.auth.userId;

    const seat = await seatService.bookSeat(seatId, userId);

    if (!seat) {
      return res.status(400).json({
        status: 'fail',
        message: 'Booking failed. Seat reservation may have expired or belongs to another user.'
      });
    }

    // Broadcast update
    const io = req.app.get('io');
    io.emit('seat_updated', seat);

    res.status(200).json({
      status: 'success',
      message: 'Payment verified. Seat confirmed!',
      data: seat
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
//release seat
exports.releaseSeat = async (req, res) => {
  try {
    const { seatId } = req.body;
    const userId = req.auth.userId;

    const seat = await seatService.releaseSeat(seatId, userId);

    if (!seat) {
      return res.status(400).json({ message: "Could not release seat (Not yours or already sold)" });
    }

    // 🔥 Broadcast the freedom!
    const io = req.app.get('io');
    io.emit('seat_updated', seat);

    res.status(200).json({ status: 'success', message: 'Seat released' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 4. ADMIN RESET
exports.resetEvent = async (req, res) => {
  try {
    const ADMIN_ID = "user_361z8x8l7bdaJlqKO9rP5LbCZYB"; 

    if (req.auth.userId !== ADMIN_ID) {
      return res.status(403).json({ message: "Nice try! Admins only." });
    }

    // 1. NUKE EVERYTHING (No ID needed anymore)
    await seatService.resetAllSeats();

    // 2. Fetch fresh seats to update the live map
    // We need an event ID to fetch the data to send back. 
    // Since we reset EVERYTHING, we can just fetch the seats for the *first* event found.
    const events = await require('../services/event.service').getAllEvents();
    if (events.length > 0) {
        const freshSeats = await seatService.getSeatsByEventId(events[0]._id);
        
        // Broadcast the update
        const io = req.app.get('io');
        io.emit('events_reset', freshSeats);
    }

    res.status(200).json({ 
      status: 'success', 
      message: "Theater Reset Successfully" 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
