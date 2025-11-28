import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer
import BookingPage from './pages/Bookingpage';
import AdminPage from './pages/Adminpage';
import LandingPage from './pages/LandingPage'; // Import Landing
import AboutPage from './pages/AboutPage';     // Import About
import Events from './pages/Events';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Layout wrapper to push footer to bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <Navbar />
        <Toaster position="top-center" reverseOrder={false} />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/events" element={<Events />} />
        </Routes>

        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;