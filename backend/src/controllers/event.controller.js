const eventService = require('../services/event.service');
const Seat = require('../models/Seat'); 
const Event = require('../models/Events'); 
const { clerkClient } = require('@clerk/clerk-sdk-node');

// --- PUBLIC DATA ---
exports.getEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({ status: 'success', results: events.length, data: events });
  } catch (error) {
    console.error("❌ BACKEND ERROR IN GET_EVENTS:", error); 
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });
    const { email } = req.query;

    const myEvents = await Event.find({
      $or: [
        { organizerIdentifier: userId },
        { organizerIdentifier: email },
        { organizerClerkId: userId },
        { organizerEmail: email }
      ]
    }).sort({ date: -1 });

    res.status(200).json({ status: 'success', data: myEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });
    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    console.error("❌ BACKEND ERROR IN GET_EVENT_BY_ID:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- ADMIN ACTIONS ---
exports.createEvent = async (req, res) => {
  try {
    const { organizerClerkId, organizerEmail, organizerIdentifier } = req.body;
    if (!organizerClerkId && !organizerEmail && !organizerIdentifier) {
      return res.status(400).json({ status: 'error', message: 'Missing organizer identification.' });
    }
    const event = await Event.create(req.body);
    res.status(201).json({ status: 'success', data: event });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- 💰 FINANCIALS & SETTLEMENT ---
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.eventId, 
      { payoutStatus: status, paidAt: status === 'PAID' ? new Date() : null },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ status: 'success', data: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Global Admin Stats
exports.getGlobalAdminStats = async (req, res) => {
  try {
    // 🚀 SECURE: Pulling from .env
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID; 
    
    if (req.auth.userId !== SUPER_ADMIN_ID) {
      return res.status(403).json({ message: "Forbidden: Pattin Access Only" });
    }

    const allSeats = await Seat.find() || []; 
    const allEvents = await Event.find() || [];
    
    const totalGross = allSeats.reduce((sum, s) => sum + (s.price || 0), 0);
    const platformProfit = totalGross * 0.10; 
    const totalTicketsSold = allSeats.length;

    const eventSummaries = allEvents.map(ev => {
      const rev = allSeats
        .filter(s => s.event?.toString() === ev._id.toString())
        .reduce((sum, s) => sum + (s.price || 0), 0);

      return { title: ev.title, payoutStatus: ev.payoutStatus || 'PENDING', revenue: rev };
    });

    res.status(200).json({ totalGross, platformProfit, totalTicketsSold, eventSummaries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    const userId = req.auth.userId;
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID; // 🚀 Pulling from .env

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 🛡️ Permission Check (Super Admin or Event Owner)
    if (userId !== SUPER_ADMIN_ID && userId !== event.organizerIdentifier) {
      return res.status(403).json({ message: "Unauthorized to cancel this event" });
    }

    event.status = 'CANCELLED';
    event.cancellationReason = reason;
    event.cancelledAt = new Date();
    await event.save();

    const affectedTickets = await Seat.find({ event: eventId });
    const refundList = [...new Set(affectedTickets.map(t => t.customerEmail))];

    await Seat.updateMany({ event: eventId }, { $set: { status: 'REFUND_PENDING' } });

    res.status(200).json({ status: 'success', message: `Event cancelled.`, refundList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkOrganizerStatus = async (req, res) => {
  try {
    const { clerkId, email } = req.query; 
    if (!clerkId && !email) return res.status(200).json({ isOrganizer: false });

    const queryConditions = [];
    if (clerkId) {
      queryConditions.push({ organizerIdentifier: clerkId }, { organizerClerkId: clerkId });
    }
    if (email) {
      const emailRegex = new RegExp(`^${email.trim()}$`, 'i');
      queryConditions.push({ organizerIdentifier: emailRegex }, { organizerEmail: emailRegex });
    }

    const eventCount = await Event.countDocuments({ $or: queryConditions });
    res.status(200).json({ isOrganizer: eventCount > 0 });
  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    res.status(500).json({ status: 'error', message: "Internal Server Error" });
  }
};