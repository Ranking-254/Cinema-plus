const express = require('express');
const seatController = require('../controllers/seat.controller');
const requireAuth = require('../middleware/auth.middleware'); // <--- Import

const router = express.Router();

// Public Route (Anyone can view)
router.get('/event/:eventId', seatController.getEventSeats);

// Protected Routes (Must be logged in)
// We add requireAuth before the controller
router.post('/hold', requireAuth, seatController.holdSeat);
router.post('/book', requireAuth, seatController.bookSeat);
router.post('/release', requireAuth, seatController.releaseSeat)
router.post('/reset', requireAuth, seatController.resetEvent);

module.exports = router;