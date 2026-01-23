import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Zap, ShieldCheck, Smartphone, Ticket, ArrowRight, Play, MapPin, Calendar, Star, TrendingUp, Users } from 'lucide-react';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

const LandingPage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events`);
        setFeaturedEvents(res.data.data.slice(0, 3));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white selection:bg-orange-500/30">
      
      {/* --- HERO: High Impact --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-orange-500 mb-6 animate-fade-in">
            <TrendingUp size={14} /> Now Streaming: Premium Experiences
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8 uppercase">
            Don't just watch. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-600 to-red-500">
              Be There.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-neutral-400 text-lg md:text-xl mb-10 leading-relaxed font-medium">
            Kenya's most advanced real-time seat reservation engine. 
            Instant M-Pesa payouts, zero double-bookings, 100% immersion.
            You can create and manage your event bookings all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/events" className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-black italic uppercase rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20">
              Get Tickets <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              <Link to="/how-it-works" className="flex items-center gap-2">
              <Play size={18} fill="currentColor" /> See How it Works
                </Link>
            </button>

          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2 font-black italic text-xl">IMAX</div>
             <div className="flex items-center gap-2 font-black italic text-xl">ANGARI</div>
             <div className="flex items-center gap-2 font-black italic text-xl">CENTURY</div>
          </div>
        </div>
      </section>

      {/* --- FEATURED: Realistic Ticket Cards --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Live <span className="text-orange-500">Events</span></h2>
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Hand-picked cinema experiences</p>
          </div>
          <Link to="/events" className="text-orange-500 font-bold hover:underline">View Calendar →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loadingEvents ? (
             [1, 2, 3].map(i => <div key={i} className="h-[450px] bg-white/5 rounded-3xl animate-pulse" />)
          ) : (
            featuredEvents.map(event => (
              <div key={event._id} className="group bg-[#16171d] border border-white/5 rounded-[32px] overflow-hidden hover:border-orange-500/30 transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500 border border-white/10">
                    {event.category || 'Special'}
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold leading-tight group-hover:text-orange-500 transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-1 text-orange-500 font-black">
                       <Star size={14} fill="currentColor" /> 4.9
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
                      <MapPin size={16} className="text-orange-500" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
                      <Calendar size={16} className="text-orange-500" /> {new Date(event.date).toDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-600 uppercase">Starting From</p>
                      <p className="text-xl font-black italic">KES {event.basePrice?.toLocaleString()}</p>
                    </div>
                    <Link to={`/book/${event._id}`} className="px-6 py-3 bg-white text-black font-black italic uppercase text-xs rounded-xl hover:bg-orange-500 hover:text-white transition-all">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- WHY US: Modern Bento Grid --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 p-10 rounded-[40px] flex flex-col justify-end min-h-[300px] group overflow-hidden relative">
            <Ticket size={180} className="absolute -top-10 -right-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <h3 className="text-3xl font-black italic uppercase leading-none mb-2 text-black">Smart <br /> Ticketing</h3>
            <p className="text-black/70 font-bold max-w-xs">QR-based entry system with instant email delivery.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all">
            <Zap className="text-orange-500 mb-6" size={32} />
            <h4 className="text-xl font-bold mb-2">Real-Time Sync</h4>
            <p className="text-neutral-500 text-sm font-medium">Socket-driven seat reservation engine.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all">
            <Users className="text-orange-500 mb-6" size={32} />
            <h4 className="text-xl font-bold mb-2">Social Booking</h4>
            <p className="text-neutral-500 text-sm font-medium">See which sections are trending in live-time.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;