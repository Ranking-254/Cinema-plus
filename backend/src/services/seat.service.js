const Seat = require('../models/Seat');
const Event = require('../models/Events');

// 1. CREATE BULK BOOKINGS (The Core Engine) 🚀
exports.createBulkBookings = async (eventId, userId, tickets, customerDetails) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const newTickets = [];

  for (const [tierId, quantity] of Object.entries(tickets)) {
    if (quantity <= 0) continue;

    const tier = event.tiers.find(t => t.id === tierId);
    
    if (tier) {
      // 🚀 THE FIX: Use tier.name instead of tier.type
      // tier.type is an enum (often "REGULAR" for multiple tiers), causing collisions.
      // tier.name (e.g., "Early Bird", "VIP") is unique to the event's tiers.
    const rowIdentifier = tier.name.trim().toUpperCase();

      // 🚀 Inventory Check: Use the unique rowIdentifier
      const soldCount = await Seat.countDocuments({ event: eventId, row: rowIdentifier });
      
      if (soldCount + quantity > tier.capacity) {
        throw new Error(`Sorry, not enough tickets left for ${tier.name}. Only ${tier.capacity - soldCount} remaining.`);
      }

      // 🚀 SEQUENCING FIX: Find the highest existing ticket number for this specific NAME
      const lastSeat = await Seat.findOne({ event: eventId, row: rowIdentifier })
                                 .sort({ number: -1 });
      
      let startNumber = lastSeat ? lastSeat.number : 0;

      for (let i = 0; i < quantity; i++) {
        newTickets.push({
          event: eventId,
          userId: userId,
          row: rowIdentifier, // Now matches the specific Tier Name
          number: startNumber + i + 1, 
          price: tier.price,
          status: 'SOLD',
          customerName: customerDetails.fullName,
          customerEmail: customerDetails.email
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