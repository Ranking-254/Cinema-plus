import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import bgImage from '../assets/event.webp';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events`);
        
        // 🚀 SORTING LOGIC: Newest first
        const sortedEvents = res.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setEvents(sortedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="text-white text-center p-20 animate-pulse">Loading Events...</div>;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(10, 11, 15, 0.85), rgba(10, 11, 15, 0.95)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: '60px 20px',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <h1 className="text-white text-4xl md:text-5xl font-black text-center mb-12 tracking-tight">
        Now Showing & <span style={{ color: '#ff0055' }}>Upcoming</span>
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {events.map((event) => {
          // 🚀 STATUS CALCULATIONS
          // Check if the event date is in the past
          const isExpired = new Date(event.date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
          
          // Placeholder for Sold Out logic (Requires backend 'soldCount' or 'isSoldOut' field)
          const isSoldOut = event.isSoldOut || false; 

          return (
            <div
              key={event._id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: '0.4s all cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'flex',
                flexDirection: 'column',
                opacity: (isExpired || isSoldOut) ? 0.6 : 1,
                filter: (isExpired || isSoldOut) ? 'grayscale(0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isExpired && !isSoldOut) {
                  e.currentTarget.style.transform = 'translateY(-12px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              {/* Event Poster */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img 
                    src={event.thumbnail} 
                    alt={event.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  
                  {/* Status Badges */}
                  {isExpired ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Ended</span>
                    </div>
                  ) : isSoldOut ? (
                    <div className="absolute inset-0 bg-orange-600/40 flex items-center justify-center">
                      <span className="bg-white text-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Sold Out</span>
                    </div>
                  ) : (
                    <div style={{ 
                        position: 'absolute', 
                        top: '15px', 
                        right: '15px',
                        background: '#ff0055', 
                        fontSize: '0.75rem', 
                        padding: '5px 12px', 
                        borderRadius: '100px',
                        fontWeight: '800',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(255, 0, 85, 0.3)'
                    }}>
                        {event.category}
                    </div>
                  )}
              </div>

              <div style={{ padding: '25px', color: 'white' }}>
                {event.organizer && (
                  <p style={{ 
                      fontSize: '0.75rem', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1.5px', 
                      color: '#a9b1d6',
                      marginBottom: '8px',
                      fontWeight: '600'
                  }}>
                    Organized by <span style={{ color: '#7aa2f7' }}>{event.organizer}</span>
                  </p>
                )}
                
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '15px', lineHeight: '1.2' }}>
                  {event.title}
                </h2>
                
                <div style={{ fontSize: '0.9rem', color: '#a9b1d6', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📅 {new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📍 {event.location}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
                      🎟 Starting at KES {event.basePrice?.toLocaleString()}
                  </p>
                </div>

                {isExpired || isSoldOut ? (
                  <button 
                    disabled 
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '14px',
                      color: '#565f89',
                      borderRadius: '14px',
                      textAlign: 'center',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'not-allowed',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {isExpired ? "Event Closed" : "Fully Booked"}
                  </button>
                ) : (
                  <Link
                    to={`/book/${event._id}`}
                    style={{
                      display: 'block',
                      background: 'linear-gradient(45deg, #007bff, #00d4ff)',
                      padding: '14px',
                      color: 'white',
                      borderRadius: '14px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      transition: '0.3s',
                      boxShadow: '0 4px 15px rgba(0, 123, 255, 0.2)'
                    }}
                  >
                    Purchase Ticket →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Events;