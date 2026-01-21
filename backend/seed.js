const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const Event = require('./src/models/Events'); 
const Seat = require('./src/models/Seat'); 

const seedTiersData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB. Preparing to clean and seed 20 events...");

    // 🚀 CRITICAL: Clear all old data to remove Duplicate Key conflicts
    await Event.deleteMany({});
    await Seat.deleteMany({}); 

    const eventTemplates = [
      { title: "Nairobi Tech Week", category: "Conference", location: "Sarit Expo Centre" },
      { title: "Afro-Jazz Night", category: "Concert", location: "Alliance Française" },
      { title: "Champions League Screening", category: "Sports", location: "Winning Post" },
      { title: "The Lion King", category: "Theater", location: "Kenya National Theatre" },
      { title: "Startup Pitch Night", category: "Conference", location: "Nairobi Garage" },
      { title: "Gospel Explosion", category: "Concert", location: "CITAM Karen" },
      { title: "Safari Rally Kenya", category: "Sports", location: "Naivasha" },
      { title: "Cooking with Chef Ali", category: "Workshop", location: "Lavington" },
      { title: "Nairobi Fashion Week", category: "Fashion", location: "The Alchemist" },
      { title: "Data Science Boot Camp", category: "Workshop", location: "iHub" },
      { title: "Sol Fest 2026", category: "Concert", location: "KICC" },
      { title: "Premier League Derby", category: "Sports", location: "K1 Klub House" },
      { title: "Comedy Night Live", category: "Theater", location: "Two Rivers Mall" },
      { title: "Investment 101", category: "Conference", location: "Strathmore Uni" },
      { title: "Digital Art Expo", category: "Arts", location: "National Museum" },
      { title: "Rugby 7s Series", category: "Sports", location: "RFUEA Grounds" },
      { title: "Python for Beginners", category: "Workshop", location: "Moringa School" },
      { title: "Rooftop Yoga Session", category: "Health", location: "Westlands" },
      { title: "Salsa Dance Night", category: "Arts", location: "Village Market" },
      { title: "Startup Expo 2026", category: "Business", location: "Kenyatta Uni" }
    ];

    const eventsWithTiers = eventTemplates.map((template, index) => {
      const tiers = [
        { 
          id: `reg-${index}`, 
          name: "REGULAR", 
          price: 500 + (Math.floor(Math.random() * 3) * 500), 
          capacity: 100, 
          color: "#f97316" // Default Orange
        },
        { 
          id: `vip-${index}`, 
          name: "VIP", 
          price: 3000 + (Math.floor(Math.random() * 2) * 1000), 
          capacity: 50, 
          color: "#ffd700" // Gold
        }
      ];

      const basePrice = Math.min(...tiers.map(t => t.price));

      return {
        ...template,
        description: `Join us for ${template.title}. A premier ${template.category.toLowerCase()} experience at ${template.location}.`,
        organizer: "Pattin Tours & Events",
        organizerIdentifier: "12pattin@gmail.com", // 🚀 Maps to your Organizer Dashboard
        thumbnail: `https://picsum.photos/seed/${index + 100}/800/600`,
        date: new Date(2026, 0, index + 20, 18, 0),
        status: 'ON-SALE',
        maxCapacity: 150,
        tiers,
        basePrice
      };
    });

    await Event.insertMany(eventsWithTiers);
    console.log(`🚀 Successfully seeded 20 events with unique identifiers!`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedTiersData();