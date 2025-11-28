import { Link } from 'react-router-dom';
import bgImage from '../assets/event.webp';

const Events = () => {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          background: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '16px',
          backdropFilter: 'blur(8px)',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
          🎤 Tech Conference 2025
        </h1>

        <p style={{ fontSize: '1.2rem', marginBottom: '25px', lineHeight: '1.6' }}>
          <strong>The ultimate meetup for MERN developers.</strong><br />
          Join top minds for a day of modern MERN techniques, insights, networking, 
          and hands-on knowledge sharing.
        </p>

        <div style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
          <p>📅 <strong>Date:</strong> December 15, 2025</p>
          <p>📍 <strong>Venue:</strong> Nairobi – 🌀Cinema Plus+ Hub</p>
          <p>🎟 <strong>Total Seats:</strong> 50</p>
          <p>👨‍💻 <strong>Focus:</strong> MERN Stack, modern web trends, advanced tools & dev networking</p>
        </div>

        <Link
          to="/book"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            background: '#ff0055',
            padding: '12px 25px',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: '0.3s'
          }}
        >
          Book a Seat →
        </Link>
      </div>
    </div>
  );
};

export default Events;
