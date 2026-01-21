import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react'; // 🚀 Added useClerk
import GeneratedTicket from '../components/GeneratedTicket';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';
import { Lock } from 'lucide-react'; // Added an icon for better UI

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useClerk(); // 🚀 Hook for the modal

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setError(false);
        const token = await getToken();
        const response = await axios.get(`${API_URL}/api/seats/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTickets(response.data.data);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
        setError(true);
        toast.error("Could not load your tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isSignedIn, getToken]);

  // 🚀 UPDATED: Professional Sign In Prompt instead of Access Denied
  if (!isSignedIn && !loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1014] text-white px-4">
      <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] flex flex-col items-center max-w-sm w-full text-center backdrop-blur-xl">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Private Collection</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Your tickets are protected. Please sign in to view your bookings and upcoming experiences.
        </p>
        <button 
          onClick={() => openSignIn({ mode: 'modal' })}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          Sign In Now
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1014]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-blue-500 font-bold tracking-widest animate-pulse">FETCHING TICKETS...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1014] px-4 md:px-8 pt-28 pb-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase italic tracking-tighter">
            My <span className="text-blue-500">Collection</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-[0.2em] uppercase text-xs">
            Your upcoming experiences await
          </p>
        </header>
        
        {error ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl py-20 text-center">
            <p className="text-red-400">Something went wrong. Please try again later.</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-900/30 border border-gray-800/50 rounded-3xl py-32 text-center backdrop-blur-sm">
            <div className="mb-4 flex justify-center text-gray-700">
               <svg size={64} className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
               </svg>
            </div>
            <p className="text-gray-500 font-medium">You haven't booked any tickets yet.</p>
            <button 
              onClick={() => window.location.href = '/events'}
              className="mt-6 text-blue-500 hover:text-blue-400 font-bold text-sm uppercase tracking-widest transition-colors"
            >
              Explore Events →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
            {tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                className="w-full transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 ease-out"
              >
                <GeneratedTicket 
                  compact={true} 
                  data={{
                    id: ticket._id.slice(-6).toUpperCase(),
                    movie: ticket.event?.title || "Special Event", 
                    seat: `${ticket.row} #${ticket.number}`, 
                    price: `KES ${ticket.price.toLocaleString()}`,
                    date: ticket.event?.date 
                      ? new Date(ticket.event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) 
                      : "Date TBD",
                    fullName: user?.fullName || "Guest",
                    email: user?.primaryEmailAddress?.emailAddress,
                    avatarPreview: user?.imageUrl || "/assets/images/image-avatar.jpg"
                  }} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;