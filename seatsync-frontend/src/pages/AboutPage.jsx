import React from 'react';

// 1. IMPORT YOUR IMAGE AT THE TOP
import bgImage from '../assets/front.webp'; 

const AboutPage = () => {
  return (
    // 2. MAIN WRAPPER: Handles the Background Image
    <div 
      style={{ 
        // Use a linear gradient to darken the image (0.7 opacity) so text pops
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // Makes it cover the full screen height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* 3. YOUR EXISTING CONTENT */}
      <div className="container" style={{ maxWidth: '800px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#6b96f5ff' }}>
          About <span style={{ color: "#d9dbe0ff" }}>🌀Cinema </span> plus+
        </h1>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px', lineHeight: '1.8', backdropFilter: 'blur(5px)' }}>
          <p style={{ marginBottom: '20px' }}>
            <strong><span style={{ color: "#d9dbe0ff" }}>🌀Cinema </span> plus+</strong> is a modern, multi-purpose venue provider offering premium spaces for cinema screenings, tech meetups, corporate gatherings, product launches, workshops, and private events.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Our <strong>Mission</strong> is to create immersive, flexible, and high-quality environments that bring people together for learning, entertainment, and innovation.

            We combine cutting-edge audiovisual systems, comfortable seating layouts, and dynamic room configurations to ensure every event—small or large—feels unforgettable.
          </p>
          
          <strong>Currently, Cinema Plus+ is hosting:</strong>

          <h3 style={{ marginTop: '20px', color: '#fff' }}>🎤 Tech Conference 2025</h3>
          <h4 style={{ color: '#d9dbe0ff' }}>The ultimate meetup for MERN developers.</h4>
          
          <ul style={{ marginLeft: '20px', marginTop: '10px', color: '#a9b1d6' }}>
            <li>📅 Date: December 15, 2025</li>
            <li>📍 Venue: Nairobi <span style={{ color: "#d9dbe0ff" }}>🌀Cinema </span> plus+ Hub</li>
            <li>🎟 Total Seats: 50</li>
            <li>👨‍💻 Focus: Modern MERN techniques, insights, networking, and hands-on knowledge sharing.</li>
            <li>💻 Registration: <a href="/book" target="_blank" rel="noopener noreferrer" style={{ color: '#7aa2f7' }}>Book Ticket Now</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;