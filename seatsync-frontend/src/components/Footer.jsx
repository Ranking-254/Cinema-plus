import { Link } from 'react-router-dom'; // <--- 1. Import Link

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.column}>
          <h3>🌀 Cinema <span style={{ color: "#7aa2f7" }}>plus+</span>
          </h3>
          <p>The future of live event booking.</p>
        </div>
        
        <div style={styles.column}>
          <h4>Links</h4>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/about" style={styles.link}>About</Link>
          <Link to="/book" style={styles.link}>Book Now</Link>
          <Link to="/events" style={styles.link}>Events</Link>
        </div>

        <div style={styles.column}>
          <h4>Contact</h4>
          <a
            href="mailto:cinemaplus.help@gmail.com"
            style={styles.contactLink}
            onMouseEnter={(e) => (e.target.style.color = '#7aa2f7')}
            onMouseLeave={(e) => (e.target.style.color = '#a9b1d6')}
          >
            support@cinemaplus+.com
          </a>

          <a
            href="tel:+254716700151"
            style={styles.contactLink}
            onMouseEnter={(e) => (e.target.style.color = '#7aa2f7')}
            onMouseLeave={(e) => (e.target.style.color = '#a9b1d6')}
          >
            +254 716700151
          </a>

        </div>
      </div>
      <div style={styles.copy}>
        &copy; {new Date().getFullYear()} 🌀 Cinema <span style={{ color: "#7aa2f7" }}>plus+</span>. All rights reserved.
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#16161e',
    color: '#a9b1d6',
    padding: '40px 20px',
    borderTop: '1px solid #2a2b3d',
    marginTop: 'auto'
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    textAlign: 'left'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  link: {
    color: '#7aa2f7',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer'
  },
  contactLink: {
    color: '#a9b1d6',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer'
  },
  copy: {
    textAlign: 'center',
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #2a2b3d',
    fontSize: '0.9rem'
  }
};

export default Footer;