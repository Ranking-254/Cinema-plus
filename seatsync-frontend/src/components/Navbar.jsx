import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user } = useUser();
  const ADMIN_ID = "user_361z8x8l7bdaJlqKO9rP5LbCZYB"; // REPLACE WITH YOUR ID

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginRight: '30px' }}>
          <h2>🌀 Cinema <span style={{ color: "#7aa2f7" }}>plus+</span>
          </h2>
        </Link>
        
        {/* NEW NAVIGATION LINKS */}
        <div className="nav-links" style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/book" style={styles.link}>Book Tickets</Link>
          <Link to="/about" style={styles.link}>About</Link>
          <Link to="/events" style={styles.link}>Events</Link>
          <Link to="/my-tickets" className="hover:text-orange-500 transition">
  My Tickets
</Link>
          
          {user?.id === ADMIN_ID && (
            <Link to="/admin" style={{ ...styles.link, color: '#ff4444' }}>Admin</Link>
          )}
        </div>
      </div>
      
      <div style={styles.auth}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-primary">Sign In</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'rgba(26, 27, 38, 0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { display: 'flex', alignItems: 'center' },
  links: { display: 'flex', gap: '20px' },
  link: { textDecoration: 'none', color: '#a9b1d6', fontWeight: '500', fontSize: '0.95rem' },
  auth: { display: 'flex', gap: '10px' }
};

export default Navbar;