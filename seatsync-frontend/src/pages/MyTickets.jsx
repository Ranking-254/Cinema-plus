import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_URL } from '../config';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isSignedIn) return;
      
      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/api/seats/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(res.data.data);
      } catch (err) {
        console.error("Failed to fetch tickets", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isSignedIn]);

  if (loading) return <div className="text-white text-center mt-20">Loading your wallet...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">My Ticket Wallet</h1>
        <p className="text-neutral-400 mb-10">See all your upcoming and past shows.</p>

        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-neutral-800">
             <p className="text-xl text-neutral-500">You haven't booked any tickets yet.</p>
             <a href="/book" className="inline-block mt-4 text-orange-500 hover:text-orange-400 font-bold">
               Go to Cinema &rarr;
             </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                className="relative bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden hover:border-orange-500/50 transition group"
              >
                {/* Visual "Stub" Effect (Left Border) */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-500"></div>

                <div className="p-6 pl-8 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Avengers: Secret Wars</h3>
                    <p className="text-neutral-400 text-sm">Oct 25, 2025 • Cinema Plus</p>
                    
                    <div className="mt-4 flex items-center gap-3">
                       <span className="bg-neutral-900 text-neutral-300 px-3 py-1 rounded text-xs border border-neutral-700">
                         {user?.fullName || "Guest"}
                       </span>
                       <span className="text-green-400 text-xs flex items-center gap-1">
                         ● Confirmed
                       </span>
                    </div>
                  </div>

                  <div className="text-right">
                     <span className="block text-neutral-500 text-xs uppercase tracking-widest mb-1">SEAT</span>
                     <span className="block text-4xl font-mono font-bold text-orange-500">
                       {ticket.row}{ticket.number}
                     </span>
                     <span className="block text-neutral-500 text-xs mt-1">${ticket.price}</span>
                  </div>
                </div>

                {/* Optional: "Download" Action Area */}
                <div className="bg-black/20 p-3 text-center border-t border-white/5">
                   <span className="text-xs text-neutral-500 group-hover:text-white transition">
                      View details to download
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}