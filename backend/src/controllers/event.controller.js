const eventService = require('../services/event.service');

exports.getEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};