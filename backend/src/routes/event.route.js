const express = require('express');
const eventController = require('../controllers/event.controller');

const router = express.Router();

router.get('/', eventController.getEvents);

module.exports = router;