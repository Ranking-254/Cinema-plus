const Event = require('../models/Events');

exports.getAllEvents = async () => {
  return await Event.find();
};