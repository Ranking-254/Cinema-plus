const express = require('express');
const eventController = require('../controllers/event.controller');
const requireAuth = require('../middleware/auth.middleware'); // Your custom middleware
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const router = express.Router();

// --- 1. Specific / Static Routes (Priority) ---
router.get('/my-events', ClerkExpressRequireAuth(), eventController.getMyEvents);

router.get(
    '/admin/global-stats', 
    ClerkExpressRequireAuth(), 
    eventController.getGlobalAdminStats
);

// --- 2. Action / PATCH Routes ---
router.patch(
    '/:eventId/payout', 
    ClerkExpressRequireAuth(), 
    eventController.updatePayoutStatus
);

// 🚀 FIX 1: Ensure requireAuth is passed correctly. 
// If your custom middleware is a standard function, don't use () here.
// Also verify eventController.cancelEvent is exported in the controller.
router.patch('/:eventId/cancel', requireAuth, eventController.cancelEvent);
router.get('/check-permission', ClerkExpressRequireAuth(), eventController.checkOrganizerStatus);

// --- 3. Public GET Routes ---
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// --- 4. Protected Admin Routes ---
// 🚀 FIX 2: Consistency check. Ensure requireAuth is not undefined.
router.post('/', requireAuth, eventController.createEvent);
router.put('/:id', requireAuth, eventController.updateEvent);
router.delete('/:id', requireAuth, eventController.deleteEvent);

module.exports = router;