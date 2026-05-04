const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const Event = require('./src/models/Events'); 
const Seat = require('./src/models/Seat'); 

const seedTiersData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB. Preparing to clean and seed 50 events...");

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
      { title: "Startup Expo 2026", category: "Business", location: "Kenyatta Uni" },
      // --- New Kenyan Events ---
      { title: "Koroga Festival", category: "Concert", location: "Tatu City" },
      { title: "Nanyuki Self-Drive Tour", category: "Travel", location: "Mount Kenya Resort" },
      { title: "Lamu Cultural Festival", category: "Arts", location: "Lamu Island" },
      { title: "Rhumba Night with Musa", category: "Concert", location: "Carnivore Simba Saloon" },
      { title: "Kenya vs Uganda World Cup Qualifier", category: "Sports", location: "Kasarani Stadium" },
      { title: "Nyama Choma Festival", category: "Food", location: "Ngong Racecourse" },
      { title: "Mombasa Seafood Expo", category: "Food", location: "Mama Ngina Waterfront" },
      { title: "Kilifi New Year Eve", category: "Concert", location: "Beneath The Baobabs" },
      { title: "Art & Wine Pairing", category: "Lifestyle", location: "Gigiri" },
      { title: "Blockchain Nairobi Meetup", category: "Conference", location: "Antler East Africa" },
      { title: "Maasai Mara Photography Trip", category: "Workshop", location: "Sekanani Gate" },
      { title: "Diani Beach Rugby", category: "Sports", location: "Diani Beach" },
      { title: "Nairobi Film Festival", category: "Arts", location: "Prestige Cinema" },
      { title: "Coding for Kids", category: "Workshop", location: "Sote Hub" },
      { title: "Kisumu Fish Festival", category: "Food", location: "Dunga Hill Camp" },
      { title: "Eldoret City Marathon", category: "Sports", location: "Eldoret Town" },
      { title: "Tech Women Summit", category: "Conference", location: "Microsoft ADC" },
      { title: "Mugithi Night Live", category: "Concert", location: "Thika Road" },
      { title: "Jazz on the Lake", category: "Concert", location: "Naivasha" },
      { title: "Sustainable Farming Workshop", category: "Workshop", location: "Limuru" },
      { title: "Nairobi Street Food Tour", category: "Food", location: "CBD" },
      { title: "Hiking the Ngong Hills", category: "Health", location: "Ngong Hills" },
      { title: "Cryptocurrency Mastery", category: "Workshop", location: "United States International Uni" },
      { title: "Kenyan Authors Book Fair", category: "Arts", location: "McMillan Memorial Library" },
      { title: "Mombasa Night Run", category: "Sports", location: "Mombasa Island" },
      { title: "African Startup Summit", category: "Business", location: "Radisson Blu" },
      { title: "Spoken Word Poetry Night", category: "Arts", location: "The Elephant" },
      { title: "Safari Half Marathon", category: "Sports", location: "Hell’s Gate National Park" },
      { title: "High Tea & Networking", category: "Business", location: "Villa Rosa Kempinski" },
      { title: "Mount Kenya Climbing Expedition", category: "Travel", location: "Sirimon Gate" }
    ];

    const eventsWithTiers = eventTemplates.map((template, index) => {
      const tiers = [
        { 
          id: `reg-${index}`, 
          name: "REGULAR", 
          price: 500 + (Math.floor(Math.random() * 5) * 500), // Random prices between 500 and 2500
          capacity: 100, 
          color: "#f97316"
        },
        { 
          id: `vip-${index}`, 
          name: "VIP", 
          price: 3000 + (Math.floor(Math.random() * 5) * 1000), // Random prices between 3000 and 7000
          capacity: 50, 
          color: "#ffd700"
        }
      ];

      const basePrice = Math.min(...tiers.map(t => t.price));

      // Spreading events out: 1 event every 2 days starting from tomorrow
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + (index * 2) + 1);
      eventDate.setHours(18, 0, 0, 0);

      return {
        ...template,
        description: `Experience the best of Kenya at ${template.title}. A premier ${template.category.toLowerCase()} event taking place at ${template.location}. Organized with excellence by Pattin Tours & Events.`,
        organizer: "Pattin Tours & Events",
        organizerIdentifier: "12pattin@gmail.com",
        thumbnail: `https://picsum.photos/seed/${index + 500}/800/600`,
        date: eventDate,
        status: 'ON-SALE',
        maxCapacity: 150,
        tiers,
        basePrice
      };
    });

    await Event.insertMany(eventsWithTiers);
    console.log(`🚀 Successfully seeded 50 Kenyan events with unique identifiers!`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedTiersData();