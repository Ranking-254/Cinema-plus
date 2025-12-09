import React from 'react';
import { motion } from 'framer-motion';

const events = [
  {
    id: 1,
    title: "Avengers: Endgame Premiere",
    date: "April 2019",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
    category: "Premiere"
  },
  {
    id: 2,
    title: "Cinema Under the Stars",
    date: "July 2023",
    image: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd8?q=80&w=1000&auto=format&fit=crop",
    category: "Outdoor"
  },
  {
    id: 3,
    title: "Oppenheimer IMAX Experience",
    date: "Aug 2023",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop",
    category: "IMAX"
  },
  {
    id: 4,
    title: "Classic Horror Marathon",
    date: "Oct 2022",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=1000&auto=format&fit=crop",
    category: "Special Event"
  },
  {
    id: 5,
    title: "Dune: Part Two Early Access",
    date: "Feb 2024",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop",
    category: "Premiere"
  },
  {
    id: 6,
    title: "Kids Animation Festival",
    date: "Dec 2023",
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=1000&auto=format&fit=crop",
    category: "Family"
  }
];

const GalleryPage = () => {
  return (
    <div className="min-h-screen bg-[#0f1014] text-white p-8 pt-24">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
          Past Events
        </h1>
        <p className="text-gray-400 text-lg">
          Relive the magic of our biggest nights at Cinema Plus.
        </p>
      </div>

      {/* GALLERY GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative overflow-hidden rounded-2xl bg-[#1a1b26] border border-gray-800 shadow-xl"
          >
            {/* Image */}
            <div className="h-64 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Overlay Content */}
            <div className="p-6 relative z-10">
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-400/10 rounded-full mb-3">
                {event.category}
              </span>
              <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                {event.title}
              </h3>
              <p className="text-gray-500 text-sm">Hosted: {event.date}</p>
            </div>

            {/* Neon Glow on Hover */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/50 rounded-2xl transition-colors duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;