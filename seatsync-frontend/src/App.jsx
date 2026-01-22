import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import BookingPage from './pages/Bookingpage';
import AdminPage from './pages/Adminpage';
import EventAnalytics from './pages/EventAnalytics';
import ScannerMode from './pages/ScannerMode';
import AdminFinance from './pages/AdminFinance'; 
import OrganizerDashboard from './pages/OrganizerDashboard';
import LandingPage from './pages/LandingPage'; 
import AboutPage from './pages/AboutPage';     
import Events from './pages/Events';
import GalleryPage from './pages/Gallery';
import SupportPage from './pages/SupportPage'; // 🚀 Added Support
import './App.css';
import './index.css'
import InstallButton from './components/InstallButton';
import MyTickets from './pages/MyTickets';
import TermsOfService from './pages/TermsAndServices';
import PrivacyPolicy from './pages/LegalData';
import HowItWorks from './pages/HowItWorks';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <Navbar />
        <Toaster position="top-center" reverseOrder={false} />
        <InstallButton /> 

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/book/:eventId" element={<BookingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/analytics/:eventId" element={<EventAnalytics />} />
            <Route path="/admin/scanner/:eventId" element={<ScannerMode />} />
            <Route path="/admin/finance" element={<AdminFinance />} />
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />

            {/* 🚀 LEGAL & SUPPORT ROUTES (Fixed placement) */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/support" element={<SupportPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;