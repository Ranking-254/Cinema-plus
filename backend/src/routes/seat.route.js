const express = require('express');
const seatController = require('../controllers/seat.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

// --- Public Routes ---
router.get('/event/:eventId/public', seatController.getPublicSeatCounts);


// --- Protected Routes (Requires Clerk Auth) ---

// 🚀 FIX: Analytics now has requireAuth so req.auth.userId will exist
router.get('/event/:eventId', requireAuth, seatController.getEventSeats);
router.patch('/check-in/:ticketId', requireAuth, seatController.checkInTicket);

// The Bulk Booking endpoint
router.post('/book-bulk', requireAuth, seatController.bookBulkTickets);

// Get the logged-in user's tickets
router.get('/mine', requireAuth, seatController.getMyTickets);

// --- Admin Only ---
// Reset bookings for an event
router.post('/reset', requireAuth, seatController.resetEvent);



module.exports = router;