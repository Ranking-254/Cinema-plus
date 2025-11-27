import { Link } from 'react-router-dom';
import bgImage from '../assets/back.webp'; 


const LandingPage = () => {
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

    

    <div className="container" style={{ textAlign: 'center', paddingBottom: '60px' }}>
      
      {/* Hero Section */}
      <section style={{ margin: '60px 0' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', background: 'linear-gradient(to right, #7aa2f7, #bb9af7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Experience the Future <br /> of Cinema
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#a9b1d6', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Book your seats in real-time. No double bookings, no waiting. 
          Just you and the big screen.
        </p>
        
        <Link to="/book">
          <button className="btn-pay" style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
            Get Tickets 🎟️
          </button>
        </Link>
      </section>

      {/* Features Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '80px' }}>
        <div style={cardStyle}>
          <h2>⚡ Real-Time</h2>
          <p>See seats vanish instantly as others book them.</p>
        </div>
        <div style={cardStyle}>
          <h2>🔒 Secure</h2>
          <p>Powered by Clerk Auth and encrypted payments.</p>
        </div>
        <div style={cardStyle}>
          <h2>📱 Mobile First</h2>
          <p>Book from your phone, tablet, or desktop.</p>
        </div>
      </section>

    </div>

    </div>
  );
};

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.1)'
};

export default LandingPage;