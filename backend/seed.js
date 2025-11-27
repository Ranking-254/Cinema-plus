require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const Seat = require('./src/models/Seat');

const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB for seeding...');

    // 1. CLEAR EXISTING DATA
    // We wipe the slate clean so we don't get duplicates if we run this twice.
    await Event.deleteMany({});
    await Seat.deleteMany({});
    console.log('🧹 Old data cleared.');

    // 2. CREATE AN EVENT
    const myEvent = await Event.create({
      title: 'Tech Conference 2025',
      description: 'The ultimate meetup for MERN developers.',
      date: new Date('2025-12-15'),
      venue: 'Nairobi Innovation Hub',
      totalSeats: 50
    });
    console.log(`🎉 Created Event: ${myEvent.title}`);

    // 3. GENERATE SEATS LOOP
    // We will create 5 rows (A, B, C, D, E) with 10 seats each.
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsToInsert = [];

    rows.forEach(row => {
      for (let i = 1; i <= 10; i++) {
        seatsToInsert.push({
          event: myEvent._id,
          row: row,
          number: i,
          price: row === 'A' ? 5000 : 2500, // Front row is more expensive
          status: 'AVAILABLE'
        });
      }
    });

    // 4. BULK INSERT
    // Using insertMany is much faster than saving one by one.
    await Seat.insertMany(seatsToInsert);
    console.log(`💺 Successfully created ${seatsToInsert.length} seats.`);

    console.log('✨ Database seeding complete!');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();