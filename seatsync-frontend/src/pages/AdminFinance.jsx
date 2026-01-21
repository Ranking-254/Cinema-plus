import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Banknote, TrendingUp, Landmark, CalendarCheck } from 'lucide-react';
import { API_URL } from '../config';

const AdminFinance = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/events/admin/global-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    };
    fetchGlobalStats();
  }, []);

  if (!stats) return <div className="p-20 text-center text-white italic">Loading Finance...</div>;

  return (
    <div className="min-h-screen bg-[#0f1014] text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <p className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">Super Admin Console</p>
          <h1 className="text-4xl font-black italic tracking-tight">PLATFORM REVENUE HUB</h1>
        </header>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FinanceCard 
            icon={<TrendingUp size={24} />} 
            label="Lifetime Gross" 
            value={`KES ${stats.totalGross.toLocaleString()}`} 
            color="#10b981" 
          />
          <FinanceCard 
            icon={<Landmark size={24} />} 
            label="Total Platform Profit (10%)" 
            value={`KES ${stats.platformProfit.toLocaleString()}`} 
            color="#f97316" 
          />
          <FinanceCard 
            icon={<CalendarCheck size={24} />} 
            label="Total Tickets Sold" 
            value={stats.totalTicketsSold} 
            color="#7aa2f7" 
          />
        </div>

        {/* Event Payout Tracker */}
        <section className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h3 className="font-black italic uppercase">Event Settlement Tracker</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-neutral-500">
                <th className="p-6">Event Title</th>
                <th className="p-6">Gross Revenue</th>
                <th className="p-6">Commission</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.eventSummaries.map((event, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="p-6 font-bold">{event.title}</td>
                  <td className="p-6">KES {event.revenue.toLocaleString()}</td>
                  <td className="p-6 text-orange-500 font-mono">KES {(event.revenue * 0.1).toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${event.payoutStatus === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {event.payoutStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

const FinanceCard = ({ icon, label, value, color }) => (
  <div className="bg-neutral-900/80 border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
    <div style={{ backgroundColor: `${color}10`, color: color }} className="p-4 rounded-2xl w-fit mb-6">
      {icon}
    </div>
    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

export default AdminFinance;