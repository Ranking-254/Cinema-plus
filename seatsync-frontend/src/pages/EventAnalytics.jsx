import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react'; 
import { BarChart3, Users, Banknote, Ticket, ChevronLeft, Target, ShieldCheck, Search, Printer, Activity, Camera, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EventAnalytics = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser(); 
  const [data, setData] = useState({ event: null, sales: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // 🚀 SECURE: Use Environment Variable
  const ADMIN_ID = import.meta.env.VITE_SUPER_ADMIN_ID;
  const isSuperAdmin = user?.id === ADMIN_ID;

  // 🚀 SECURITY: Pro-active redirect for non-admins trying to access /admin routes
  useEffect(() => {
    // We only block if the user is loaded AND they are neither the Super Admin nor an organizer
    // Note: We wait for the 'loading' state of the analytics fetch to confirm if they own this event
    if (!loading && user && !isSuperAdmin && !data.event) {
       console.warn("Security: User does not own this event. Redirecting...");
       navigate('/organizer/dashboard');
    }
    
    // Specifically block the Super Admin routes for non-admins
    // but ONLY if it's a global admin page, not a specific event analytics page
    if (user && window.location.pathname === '/admin' && user.id !== ADMIN_ID) {
      navigate('/organizer/dashboard');
    }
  }, [user, navigate, ADMIN_ID, isSuperAdmin, loading, data.event]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!eventId || eventId === 'undefined') return;
      try {
        const token = await getToken();
        const eventRes = await axios.get(`${API_URL}/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const seatsRes = await axios.get(`${API_URL}/api/seats/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const event = eventRes.data.data;
        const soldTickets = seatsRes.data.data;

        const stats = soldTickets.reduce((acc, t) => {
          const tierName = t.row ? t.row.trim().toUpperCase() : 'UNKNOWN'; 
          if (!acc[tierName]) acc[tierName] = { count: 0, revenue: 0 };
          acc[tierName].count += 1;
          acc[tierName].revenue += t.price;
          return acc;
        }, {});

        setData({ event, sales: soldTickets, stats });
        setLoading(false);
      } catch (err) {
        console.error("Analytics Error:", err);
        if (err.response?.status === 403) {
          setError("ACCESS DENIED: Unauthorized to view these analytics.");
        } else {
          setError("Failed to load analytics data.");
        }
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [eventId, getToken]);

  const timelineData = useMemo(() => {
    const checkIns = data.sales.filter(s => s.isUsed && s.scannedAt);
    const hourlyData = {};
    checkIns.forEach(ticket => {
      const hour = new Date(ticket.scannedAt).getHours();
      const label = `${hour}:00`;
      hourlyData[label] = (hourlyData[label] || 0) + 1;
    });
    return Object.keys(hourlyData)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(hour => ({ time: hour, arrivals: hourlyData[hour] }));
  }, [data.sales]);

  const handleCheckIn = async (ticketId) => {
    try {
      const token = await getToken();
      const now = new Date();
      await axios.patch(`${API_URL}/api/seats/check-in/${ticketId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => ({
        ...prev,
        sales: prev.sales.map(s => s._id === ticketId ? { ...s, isUsed: true, scannedAt: now } : s)
      }));
      toast.success("Guest Admitted!");
    } catch (err) {
      toast.error("Check-in failed");
    }
  };

  const handleMarkAsPaid = async () => {
    const totalRev = Object.values(data.stats).reduce((a, b) => a + b.revenue, 0);
    const payoutAmount = totalRev - (totalRev * 0.10);
    if (!window.confirm(`Confirm payment of KES ${payoutAmount.toLocaleString()}?`)) return;
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/events/${eventId}/payout`, { status: 'PAID' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => ({ ...prev, event: { ...prev.event, payoutStatus: 'PAID' } }));
      toast.success("Payout marked as complete!");
    } catch (err) {
      toast.error("Failed to update payout status");
    }
  };

  // 🚀 DYNAMIC ERROR HANDLING: Redirects based on user role
  if (error) return (
    <div className="min-h-screen bg-[#0f1014] flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className="relative inline-block mb-4">
          <ShieldCheck size={64} className="text-red-500 mx-auto" />
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full -z-10" />
        </div>
        <h1 className="text-2xl font-black italic uppercase text-white mb-2">Restricted Access</h1>
        <p className="text-neutral-500 mb-8 text-sm">{error}</p>
        <button 
          onClick={() => navigate(isSuperAdmin ? '/admin' : '/organizer/dashboard')} 
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-orange-500 font-black italic uppercase text-sm transition hover:bg-white/10"
        >
          Return to {isSuperAdmin ? 'Admin Panel' : 'My Dashboard'}
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="p-20 text-center text-white animate-pulse font-black italic tracking-tighter text-2xl uppercase">Synchronizing Data...</div>;

  const totalRevenue = Object.values(data.stats).reduce((a, b) => a + b.revenue, 0);
  const platformFee = totalRevenue * 0.10;
  const netPayout = totalRevenue - platformFee;
  const checkedInCount = data.sales.filter(s => s.isUsed).length; 
  const totalHumanCount = data.sales.reduce((sum, seat) => {
    const multiplier = seat.row?.toLowerCase().includes('group') ? 3 : 1;
    return sum + multiplier;
  }, 0);

  const venueMax = data.event?.maxCapacity || 100;
  const venueFillPercentage = Math.min((totalHumanCount / venueMax) * 100, 100);

  const filteredSales = data.sales.filter(ticket => 
    ticket.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.number?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0f1014] text-white p-4 md:p-8 pt-24 printable-area">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
          <button 
            onClick={() => navigate(isSuperAdmin ? '/admin' : '/organizer/dashboard')} 
            className="flex items-center gap-2 text-neutral-500 hover:text-white transition group font-bold text-sm uppercase"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to {isSuperAdmin ? 'Admin' : 'My Events'}
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => navigate(`/admin/scanner/${eventId}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-500 text-black px-4 py-2 rounded-xl text-sm font-black italic transition hover:scale-105">
              <Camera size={18} /> Scanner
            </button>
            <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold transition hover:bg-white/10">
              <Printer size={18} className="text-orange-500" /> Export
            </button>
          </div>
        </div>

        {/* ... The rest of your existing JSX remains completely untouched ... */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <p className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">Marketplace Intelligence</p>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tight">{data.event?.title}</h1>
            <p className="text-neutral-500 mt-1 uppercase text-[10px] font-bold tracking-tighter truncate max-w-xs">ID: {eventId}</p>
          </div>
          <div className="w-full md:w-auto bg-white/5 p-5 rounded-2xl border border-white/5">
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">Gross Revenue</p>
            <h2 className="text-3xl font-black text-green-500">KES {totalRevenue.toLocaleString()}</h2>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Banknote />} label="Gross Revenue" value={`KES ${totalRevenue.toLocaleString()}`} color="#10b981" />
          <StatCard icon={<Target />} label="Service Fee" value={`KES ${platformFee.toLocaleString()}`} color="#f97316" />
          <StatCard icon={<ShieldCheck />} label="Net Payout" value={`KES ${netPayout.toLocaleString()}`} color="#7aa2f7" />
          <StatCard icon={<Users />} label="Attendance" value={`${checkedInCount} In`} color="#bb9af7" />
        </div>

        <div className="bg-neutral-900/80 border border-orange-500/20 p-6 rounded-3xl mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Target size={16} className="text-orange-500" /> Overall Occupancy
              </h3>
              <p className="text-xs text-neutral-500 mt-1">{totalHumanCount} / {venueMax} Capacity</p>
            </div>
            <span className="text-2xl font-black text-orange-500">{venueFillPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000" style={{ width: `${venueFillPercentage}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {data.event?.tiers.map((tier) => {
            const tierKey = tier.name ? tier.name.trim().toUpperCase() : '';
            const sold = data.stats[tierKey]?.count || 0;
            const tierColor = tier.color || '#f97316';
            return (
              <div key={tier.id} className="bg-neutral-900/50 border border-white/5 p-5 rounded-3xl group" style={{ borderColor: `${tierColor}40` }}>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-neutral-400 font-bold uppercase">{tier.name}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tierColor }}></div>
                </div>
                <p className="text-2xl font-black mb-1">{sold} <span className="text-xs text-neutral-500">/ {tier.capacity}</span></p>
                <p className="text-[10px] font-bold text-neutral-500 uppercase">Capacity Status: {sold >= tier.capacity ? 'FULL' : 'OK'}</p>
              </div>
            );
          })}
        </div>

        <section className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden mb-12">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
            <h3 className="text-xl font-bold italic w-full text-left uppercase">Guest List</h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input type="text" placeholder="Search name or ID..." className="w-full bg-white/5 border border-white/10 py-2 pl-10 pr-4 rounded-xl outline-none focus:border-orange-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-neutral-500 bg-white/5 font-bold">
                  <th className="p-4">T-ID</th>
                  <th className="p-4">Guest Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSales.map((ticket) => (
                  <tr key={ticket._id} className="text-sm hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-orange-500">#{ticket.number}</td>
                    <td className="p-4">
                      <p className="font-bold">{ticket.customerName}</p>
                      <p className="text-[10px] text-neutral-500">{ticket.customerEmail}</p>
                    </td>
                    <td className="p-4 uppercase text-[10px] font-bold text-neutral-400">{ticket.row}</td>
                    <td className="p-4 text-xs font-mono">
                      {ticket.isUsed ? new Date(ticket.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                    </td>
                    <td className="p-4 text-right">
                      {ticket.isUsed ? (
                        <span className="text-green-500 font-bold flex items-center justify-end gap-1 uppercase text-[10px]"><ShieldCheck size={12}/> Admitted</span>
                      ) : (
                        <button onClick={() => handleCheckIn(ticket._id)} className="bg-orange-500 text-black px-4 py-1 rounded-lg text-[10px] font-black no-print">CHECK IN</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-white/5">
            {filteredSales.map((ticket) => (
              <div key={ticket._id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono text-orange-500 mb-1">#{ticket.number}</p>
                    <h4 className="font-bold text-white leading-none">{ticket.customerName}</h4>
                    <p className="text-[10px] text-neutral-500 mt-1">{ticket.customerEmail}</p>
                  </div>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded font-bold text-neutral-400 uppercase">{ticket.row}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[10px] text-neutral-600">
                    {ticket.isUsed && `Checked in at ${new Date(ticket.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                  {ticket.isUsed ? (
                    <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold uppercase">
                      <CheckCircle2 size={14} /> Admitted
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCheckIn(ticket._id)}
                      className="w-full bg-orange-500 text-black py-3 rounded-xl text-xs font-black italic no-print active:scale-95 transition-transform"
                    >
                      CHECK IN GUEST
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {isSuperAdmin && (
          <section className="mt-8 p-6 md:p-8 bg-neutral-900/50 border border-white/10 rounded-3xl no-print">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-black italic uppercase tracking-tight">Final Settlement</h3>
                <p className="text-neutral-500 text-sm">Finalize payment for this event.</p>
              </div>
              <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                <div className="text-center md:text-right mb-4">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Owed to Organizer</p>
                  <p className="text-2xl font-black text-white">KES {netPayout.toLocaleString()}</p>
                </div>
                {data.event?.payoutStatus === 'PAID' ? (
                  <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-6 py-2 rounded-xl border border-green-500/20 font-black italic uppercase text-sm">
                    <ShieldCheck size={18} /> Payout Complete
                  </div>
                ) : (
                  <button onClick={handleMarkAsPaid} className="w-full md:w-auto bg-white text-black px-8 py-3 rounded-2xl font-black italic uppercase text-sm hover:bg-orange-500 hover:text-white transition-all">
                    Confirm & Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .printable-area { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border-bottom: 1px solid #eee !important; padding: 10px !important; }
        }
      `}} />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-3xl flex items-center gap-5">
    <div style={{ backgroundColor: `${color}20`, color: color }} className="p-4 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-black">{value}</p>
    </div>
  </div>
);

export default EventAnalytics;