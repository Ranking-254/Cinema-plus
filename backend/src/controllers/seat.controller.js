const seatService = require('../services/seat.service');
const nodemailer = require('nodemailer');

// 📧 CONFIGURATION: SETUP EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS  
  },
  // 👇 Hii ndio muhimu sana kwa Render (IPv4)
  family: 4, 
});

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
    const { seatId } = req.body;
    
    // Check if Clerk Auth worked
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
    console.error("💥 CRITICAL ERROR in holdSeat:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. BOOK SEAT (With Email Debugging)
exports.bookSeat = async (req, res) => {
  try {
    const { seatId, email, fullName, movie, price } = req.body;
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

    // 3. SEND EMAIL (DEBUG MODE: AWAIT IT!)
    if (email) {
      try {
        console.log(`Attempting to send email to ${email}...`);
        
        await transporter.sendMail({
          from: '"Cinema Plus" <' + process.env.GMAIL_USER + '>', 
          to: email,
          subject: `Your Ticket for ${movie || 'Cinema Plus'}`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #1a1b26; color: white; padding: 30px; border-radius: 10px; max-width: 500px;">
                <h2 style="color: #f97316;">Booking Confirmed! 🍿</h2>
                <p>Hi ${fullName},</p>
                <div style="background: #2a2b3d; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Movie:</strong> ${movie || 'Cinema Plus Event'}</p>
                    <p><strong>Seat:</strong> ${seat.row}${seat.number}</p>
                    <p><strong>Price:</strong> $${price}</p>
                </div>
                <p style="color: #737373; font-size: 12px;">Cinema Plus • Austin, TX</p>
            </div>
          `
        });
        
        console.log("✅ Email sent successfully!");
        
      } catch (emailError) {
        console.error("❌ EMAIL FAILED:", emailError);
        // We return an error so the frontend knows exactly why it failed
        return res.status(500).json({ 
            status: 'error', 
            message: 'Booking saved, but Email Failed!', 
            details: emailError.message 
        });
      }
    }

    // 4. Success Response
    res.status(200).json({
      status: 'success',
      message: 'Payment verified. Seat confirmed & Email sent!',
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