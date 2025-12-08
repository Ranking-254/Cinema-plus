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
  try {
    const { seatId } = req.body;
    
    // Check Auth
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.auth.userId;

    // Call Service
    const seat = await seatService.holdSeat(seatId, userId);

    if (!seat) {
      return res.status(409).json({
        status: 'fail',
        message: 'Seat is not available (already held or sold).'
      });
    }

    // Broadcast to Socket
    try {
        const io = req.app.get('io');
        io.emit('seat_updated', seat);
    } catch (err) {
        console.error("⚠️ Socket Error:", err.message);
    }

    res.status(200).json({ status: 'success', data: seat });

  } catch (error) {
    console.error("💥 Error in holdSeat:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. BOOK SEAT (Database Only - No Email)
exports.bookSeat = async (req, res) => {
  try {
    // We only need seatId here. Email is handled by Frontend now.
    const { seatId } = req.body;
    const userId = req.auth.userId;

    // 1. Book the seat in DB
    const seat = await seatService.bookSeat(seatId, userId);

    if (!seat) {
      return res.status(400).json({
        status: 'fail',
        message: 'Booking failed. Seat reservation may have expired.'
      });
    }

    // 2. Broadcast update
    const io = req.app.get('io');
    io.emit('seat_updated', seat);

    // 3. Success Response
    res.status(200).json({
      status: 'success',
      message: 'Payment verified & Seat confirmed!',
      data: seat
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. RELEASE SEAT
exports.releaseSeat = async (req, res) => {
  try {
    const { seatId } = req.body;
    const userId = req.auth.userId;

    const seat = await seatService.releaseSeat(seatId, userId);

    if (!seat) {
      return res.status(400).json({ message: "Could not release seat (Not yours or already sold)" });
    }

    const io = req.app.get('io');
    io.emit('seat_updated', seat);

    res.status(200).json({ status: 'success', message: 'Seat released' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. GET MY TICKETS
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const tickets = await seatService.getUserTickets(userId);

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. ADMIN RESET
exports.resetEvent = async (req, res) => {
  try {
    const ADMIN_ID = "user_361z8x8l7bdaJlqKO9rP5LbCZYB"; 

    if (req.auth.userId !== ADMIN_ID) {
      return res.status(403).json({ message: "Nice try! Admins only." });
    }

    await seatService.resetAllSeats();

    const events = await require('../services/event.service').getAllEvents();
    if (events.length > 0) {
        const freshSeats = await seatService.getSeatsByEventId(events[0]._id);
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