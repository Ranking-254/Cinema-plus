import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react'; // 🚀 Added this
import { API_URL } from '../config';

const OrganizerDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken } = useAuth(); //

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/api/events/my-events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyEvents(res.data.data);
      } catch (err) {
        console.error("Error fetching your events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [getToken]);

  if (loading) return <div className="p-20 text-center text-white italic">Loading Your Events...</div>;

  return (
    <div className="p-8 bg-[#0f1014] min-h-screen text-white pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black italic mb-8 tracking-tighter uppercase">Organizer Portal</h1>
        
        {myEvents.length === 0 ? (
          <div className="bg-white/5 p-12 rounded-3xl border border-dashed border-white/10 text-center">
            <p className="text-neutral-500 italic">No events assigned to your email yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map(event => (
              <div key={event._id} className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all group">
                <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">{event.title}</h3>
                <p className="text-neutral-500 text-sm mb-6 font-mono uppercase">
                  {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                
                <div className="flex items-center justify-between">
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full ${event.payoutStatus === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                    {event.payoutStatus || 'PENDING'}
                  </span>
                  
                  <button 
                    onClick={() => navigate(`/admin/analytics/${event._id}`)}
                    className="bg-white text-black px-5 py-2 rounded-xl font-black italic text-xs uppercase hover:bg-orange-500 hover:text-white transition-all"
                  >
                    Manage Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default OrganizerDashboard;