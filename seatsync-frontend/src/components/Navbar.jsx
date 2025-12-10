import { useState } from 'react'; // Added useState
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const location = useLocation();
  
  const ADMIN_ID = "user_361z8x8l7bdaJlqKO9rP5LbCZYB"; 

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  // Common styles for links to avoid repetition
  const getLinkClasses = (path) => {
    const baseClasses = "text-sm font-medium transition-colors hover:text-orange-400";
    return isActive(path) ? `${baseClasses} text-white` : `${baseClasses} text-gray-400`;
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Book Tickets", path: "/book" }, // Or "/" depending on your routes
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "My Tickets", path: "/my-tickets" },
     { name: "About", path: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#1a1b26]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-2 group text-decoration-none">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🌀 Cinema <span className="text-[#7aa2f7]">plus+</span>
             </h2>
          </Link>

          {/* 2. DESKTOP LINKS (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className={getLinkClasses(link.path)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin Link (Conditional) */}
            {user?.id === ADMIN_ID && (
              <Link to="/admin" className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* 3. AUTH BUTTONS (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* 4. MOBILE MENU BUTTON (Visible only on Mobile) */}
          <div className="md:hidden flex items-center gap-4">
            {/* Show UserButton on mobile header too so they can sign out */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-300 hover:text-white transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-[#1a1b26] border-b border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setIsOpen(false)} // Close menu on click
                className={`block px-3 py-3 text-base font-medium rounded-md hover:bg-white/5 ${
                  isActive(link.path) ? 'text-white bg-white/5' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user?.id === ADMIN_ID && (
              <Link 
                to="/admin" 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-base font-medium text-red-500 hover:bg-white/5 rounded-md"
              >
                Admin Panel
              </Link>
            )}

            {/* Mobile Sign In Button */}
            <SignedOut>
              <div className="pt-4 px-3">
                <SignInButton mode="modal">
                  <button className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;