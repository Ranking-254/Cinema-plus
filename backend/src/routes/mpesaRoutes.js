const express = require('express');
const router = express.Router();
const { initiateSTKPush, handleCallback, checkStatus } = require('../controllers/mpesaController');
const { generateToken } = require('../middleware/mpesaAuth');

// 1. Trigger the prompt (Protected by Safaricom Auth)
router.post('/stkpush', generateToken, initiateSTKPush);

// 2. The listener for Safaricom (Must be PUBLIC)
router.post('/callback', handleCallback);

// 3. The status checker for your Frontend (Public or Clerk-Protected)
router.get('/status/:checkoutRequestID', checkStatus);

module.exports = router;