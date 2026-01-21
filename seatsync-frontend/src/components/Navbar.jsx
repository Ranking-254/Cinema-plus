import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import { API_URL } from '../config';
import { Menu, X, LayoutDashboard, Ticket, Info, Image as ImageIcon, Home, Calendar, ShieldCheck, Banknote } from 'lucide-react';

const Navbar = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPermittedOrganizer, setIsPermittedOrganizer] = useState(false);
  const location = useLocation();
  
  const ADMIN_ID = import.meta.env.VITE_SUPER_ADMIN_ID;

  // 🚀 Check if user is a permitted organizer
  // Inside Navbar.jsx - Update the useEffect logic
useEffect(() => {
  const checkPermission = async () => {
    if (!user) {
      setIsPermittedOrganizer(false);
      return;
    }
    
    if (user.id === ADMIN_ID) {
      setIsPermittedOrganizer(true);
      return;
    }

    try {
      const token = await getToken();
      const clerkId = user.id;
      // 🚀 Normalize email to lowercase and trim to match DB standards
      const email = user.primaryEmailAddress?.emailAddress?.toLowerCase().trim();

      const res = await axios.get(
        `${API_URL}/api/events/check-permission?clerkId=${clerkId}&email=${email}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Only set true if the backend confirms they own an event
      setIsPermittedOrganizer(res.data.isOrganizer === true);
    } catch (err) {
      console.error("Permission check failed", err);
      setIsPermittedOrganizer(false);
    }
  };

  checkPermission();
}, [user, getToken]);

  const isActive = (path) => location.pathname === path;
  const navLinks = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Events", path: "/events", icon: <Calendar size={18} /> },
    { name: "Gallery", path: "/gallery", icon: <ImageIcon size={18} /> },
    { name: "My Tickets", path: "/my-tickets", icon: <Ticket size={18} /> },
    { name: "About", path: "/about", icon: <Info size={18} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#1a1b26]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="flex items-center gap-2 group">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🌀 Cinema <span className="text-[#7aa2f7]">plus+</span>
             </h2>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className={isActive(link.path) ? "text-white text-sm font-medium" : "text-gray-400 text-sm font-medium hover:text-orange-400"}>
                {link.name}
              </Link>
            ))}
            
            {user?.id === ADMIN_ID && (
              <div className="flex gap-4 border-l border-white/10 pl-4">
                <Link to="/admin" className="text-sm font-medium text-red-500 hover:text-red-400">Admin</Link>
                <Link to="/admin/finance" className="text-sm font-medium text-red-500 hover:text-red-400">Finance</Link>
              </div>
            )}

            {/* 🚀 ONLY SHOW IF PERMITTED */}
            {isPermittedOrganizer && (
              <Link to="/organizer/dashboard" className="text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1">
                <LayoutDashboard size={16} /> My Events
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <SignedOut><SignInButton mode="modal"><button className="px-5 py-2 rounded-full bg-blue-600 text-sm text-white">Sign In</button></SignInButton></SignedOut>
            <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-300 hover:text-white bg-white/5 rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-[#1a1b26] border-b border-white/10 pb-8">
          <div className="px-4 pt-2 space-y-1 flex flex-col">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-300 font-medium rounded-xl hover:bg-white/5">
                {link.icon} {link.name}
              </Link>
            ))}

            {/* 🚀 ONLY SHOW IF PERMITTED ON MOBILE */}
            {isPermittedOrganizer && (
               <div className="pt-4 border-t border-white/5 mt-2">
                <p className="px-3 py-2 text-[10px] font-bold text-orange-500/50 uppercase">Authorized Organizer</p>
                <Link to="/organizer/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-orange-500 bg-orange-500/10 rounded-xl">
                  <LayoutDashboard size={18} /> Manage My Events
                </Link>
               </div>
            )}

            {user?.id === ADMIN_ID && (
              <div className="pt-4 space-y-2">
                <p className="px-3 py-2 text-[10px] font-bold text-red-500/50 uppercase">Super Admin</p>
                <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-red-500 bg-red-500/10 rounded-xl"><ShieldCheck size={18} /> Admin</Link>
                <Link to="/admin/finance" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-red-500 bg-red-500/10 rounded-xl"><Banknote size={18} /> Finance</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;