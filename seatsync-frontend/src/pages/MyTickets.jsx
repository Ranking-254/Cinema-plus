import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react'; // Added useUser for real avatar
import GeneratedTicket from '../components/GeneratedTicket';
import { API_URL } from '../config';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser(); // Get user data for the ticket visual

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await axios.get(`${API_URL}/api/seats/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTickets(response.data.data);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isSignedIn, getToken]);

  if (loading) return <div className="text-white text-center pt-24 animate-pulse">Loading tickets...</div>;

  if (!isSignedIn) return (
    <div className="text-white text-center pt-32 px-4">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-gray-400">You need to be logged in to view your tickets.</p>
    </div>
  );

  return (
    // FIX 1: Reduced mobile padding (px-4) so tickets have full width
    <div className="min-h-screen bg-[#0f1014] px-4 md:px-8 pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">My Tickets</h1>
        <p className="text-gray-400 text-center mb-10">See you at the movies</p>
        
        {tickets.length === 0 ? (
          <p className="text-gray-400 text-center py-10">You haven't booked any tickets yet.</p>
        ) : (
          // FIX 2: Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop)
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                // FIX 3: Removed h-[250px]. Use h-auto so content fits.
                // Added flex to center the ticket in its column
                className="relative w-full h-auto flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-300"
              >
                 {/* FIX 4: Pass 'compact={true}' 
                    This tells GeneratedTicket to hide the "Enjoy the show" header 
                    so the list looks clean.
                 */}
                 <GeneratedTicket 
                    compact={true} 
                    data={{
                      movie: "Avengers: Secret Wars", 
                      seat: `${ticket.row}${ticket.number}`,
                      price: ticket.price,
                      date: "Dec 10, 2025",
                      // Use real data from Clerk if available
                      fullName: user?.fullName || "Guest User",
                      email: user?.primaryEmailAddress?.emailAddress,
                      avatarPreview: user?.imageUrl || "/assets/images/image-avatar.jpg",
                      github: user?.username ? `@${user.username}` : "@cinema_fan"
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