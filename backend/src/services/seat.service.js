const Seat = require('../models/Seat');
const Event = require('../models/Events');

// 1. CREATE BULK BOOKINGS (The Core Engine) 🚀
// Added acceptedTerms to the arguments list
exports.createBulkBookings = async (eventId, userId, tickets, customerDetails, acceptedTerms) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const newTickets = [];

  for (const [tierId, quantity] of Object.entries(tickets)) {
    if (quantity <= 0) continue;

    const tier = event.tiers.find(t => t.id === tierId);
    
    if (tier) {
      const rowIdentifier = tier.name.trim().toUpperCase();

      // 🚀 Inventory Check
      const soldCount = await Seat.countDocuments({ event: eventId, row: rowIdentifier });
      
      if (soldCount + quantity > tier.capacity) {
        throw new Error(`Sorry, not enough tickets left for ${tier.name}. Only ${tier.capacity - soldCount} remaining.`);
      }

      // 🚀 SEQUENCING: Find the highest existing ticket number
      const lastSeat = await Seat.findOne({ event: eventId, row: rowIdentifier })
                                 .sort({ number: -1 });
      
      let lastNumber = lastSeat ? lastSeat.number : 0;

      for (let i = 0; i < quantity; i++) {
        newTickets.push({
          event: eventId,
          userId: userId,
          row: rowIdentifier, 
          number: lastNumber + i + 1, 
          price: tier.price,
          status: 'SOLD',
          customerName: customerDetails.fullName,
          customerEmail: customerDetails.email,
          // 🚀 NEW LEGAL FIELDS
          tosAccepted: acceptedTerms,
          acceptedAt: new Date(),
          tosVersion: "1.0" // Matches your current policy version
        });
      }
    }
  }

  // Save the new tickets
  const bookingResults = await Seat.insertMany(newTickets);

  // 🚀 Automatic Sold Out Check
  const allSoldSeats = await Seat.find({ event: eventId });
  
  const totalHumanOccupancy = allSoldSeats.reduce((sum, seat) => {
    const multiplier = seat.row.toLowerCase().includes('group') ? 3 : 1;
    return sum + multiplier;
  }, 0);

  if (totalHumanOccupancy >= event.maxCapacity) {
    await Event.findByIdAndUpdate(eventId, { isSoldOut: true });
    console.log(`[Status Update] ${event.title} is now SOLD OUT.`);
  }

  return bookingResults;
};

// 2. GET USER TICKETS ✅
exports.getUserTickets = async (userId) => {
  return await Seat.find({ userId: userId, status: 'SOLD' })
                   .populate('event')
                   .sort({ createdAt: -1 });
};

// 3. GET SALES STATS
exports.getSeatsByEventId = async (eventId) => {
  return await Seat.find({ event: eventId });
};

// 4. RESET ALL BOOKINGS
exports.resetAllBookings = async () => {
  await Event.updateMany({}, { isSoldOut: false });
  return await Seat.deleteMany({});
};