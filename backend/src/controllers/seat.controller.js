const seatService = require('../services/seat.service');
const Event = require('../models/Events');
const Seat = require('../models/Seat');
const { clerkClient } = require('@clerk/clerk-sdk-node');

// 1. GET ALL TICKETS FOR AN EVENT (Protected Analytics)
exports.getEventSeats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.auth.userId; 
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID; 

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Wrap Clerk lookup to avoid 500 errors for non-existent users during lookup
    let userEmails = [];
    try {
      const user = await clerkClient.users.getUser(userId);
      userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());
    } catch (clerkErr) {
      console.warn("Clerk user lookup failed, proceeding with ID check only.");
    }

    const savedIdentifier = event.organizerIdentifier?.toLowerCase();

    // DUAL PERMISSION CHECK: Supports Super Admin, Clerk ID, or Email matching
    const isAuthorized = 
      userId === SUPER_ADMIN_ID || 
      userId === event.organizerIdentifier || 
      userEmails.includes(savedIdentifier);

    if (!isAuthorized) {
      return res.status(403).json({ 
        status: 'fail', 
        message: "Access Denied: You do not have permission to view these analytics." 
      });
    }

    const tickets = await seatService.getSeatsByEventId(eventId);

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: tickets
    });

  } catch (error) {
    console.error("💥 Final Analytics Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. PUBLIC: Get seat counts by tier for an event (No auth required)
exports.getPublicSeatCounts = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Only fetch the row/tier field to count availability
    const tickets = await Seat.find({ event: eventId }).select('row');

    const stats = tickets.reduce((acc, t) => {
      const tierName = t.row.toUpperCase();
      acc[tierName] = (acc[tierName] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: stats 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. BULK BOOKING (Open to all customers)
exports.bookBulkTickets = async (req, res) => {
  try {
    const { eventId, tickets, customerDetails } = req.body;
    const userId = req.auth.userId;

    if (!customerDetails || !customerDetails.email || !customerDetails.fullName) {
      return res.status(400).json({ message: "Customer details are required for ticket generation." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Helper to calculate capacity impact based on ticket types
    const calculateTotalImpact = (selectedTickets) => {
      return Object.entries(selectedTickets).reduce((sum, [tierName, qty]) => {
        const multiplier = tierName.toLowerCase().includes('group') ? 3 : 1;
        return sum + (qty * multiplier);
      }, 0);
    };

    const existingSeats = await seatService.getSeatsByEventId(eventId);
    
    const currentOccupancy = existingSeats.reduce((sum, seat) => {
      const multiplier = seat.row.toLowerCase().includes('group') ? 3 : 1;
      return sum + multiplier;
    }, 0);

    const newBookingImpact = calculateTotalImpact(tickets);

    // Validation against event maxCapacity
    if (currentOccupancy + newBookingImpact > event.maxCapacity) {
      return res.status(400).json({ 
        status: 'fail',
        message: `Venue capacity reached! Only ${event.maxCapacity - currentOccupancy} spots remaining.` 
      });
    }

    // Delegating to seatService to handle numbering and database writes
    const bookingResults = await seatService.createBulkBookings(
      eventId, 
      userId, 
      tickets, 
      customerDetails
    );

    // Socket.io real-time update
    const io = req.app.get('io');
    io.emit('tickets_purchased', { eventId, tickets });

    res.status(200).json({
      status: 'success',
      message: 'Tickets confirmed!',
      data: bookingResults
    });

  } catch (error) {
    console.error("💥 Error in bookBulkTickets:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. CHECK-IN TICKET (Scanner Mode)
exports.checkInTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.auth.userId;
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;

    // 1. Find the ticket and populate event to check permissions
    const ticket = await Seat.findById(ticketId).populate('event');
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });

    // 2. Fetch current user's emails from Clerk for flexible identification
    let userEmails = [];
    try {
      const user = await clerkClient.users.getUser(userId);
      userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());
    } catch (clerkErr) {
      console.warn("Clerk lookup failed during check-in, using ID check only.");
    }

    const savedIdentifier = ticket.event.organizerIdentifier?.toLowerCase();

    // 🛡️ SECURE DUAL PERMISSION CHECK
    // Allows Super Admin, Clerk ID match, or Email match
    const isAuthorized = 
      userId === SUPER_ADMIN_ID || 
      userId === ticket.event.organizerIdentifier || 
      userEmails.includes(savedIdentifier);

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: "ACCESS DENIED: You are not authorized to check-in guests for this event." 
      });
    }

    // 3. Prevent double entry
    if (ticket.isUsed) {
      return res.status(400).json({ 
        message: "Warning: Ticket already used!", 
        scannedAt: ticket.scannedAt 
      });
    }

    // 4. Update the ticket status
    ticket.isUsed = true;
    ticket.scannedAt = new Date();
    await ticket.save();

    res.status(200).json({ 
      status: 'success', 
      message: `Check-in successful! Admitted: ${ticket.customerName}` 
    });

  } catch (error) {
    console.error("💥 Check-in Controller Error:", error);
    res.status(500).json({ message: "Internal server error during check-in processing." });
  }
};

// 5. GET MY TICKETS (Customer Dashboard)
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

// 6. ADMIN RESET (System Maintenance)
exports.resetEvent = async (req, res) => {
  try {
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;
    if (req.auth.userId !== SUPER_ADMIN_ID) {
      return res.status(403).json({ message: "Forbidden: Super Admins only." });
    }

    await seatService.resetAllBookings();

    res.status(200).json({ 
      status: 'success', 
      message: "Event Bookings Reset Successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};