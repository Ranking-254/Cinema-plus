import { Mail, MessageSquare, LifeBuoy, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-white transition mb-8 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Back
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Help & <span className="text-orange-500">Support</span></h1>
          <p className="text-neutral-500 text-sm uppercase font-bold tracking-widest">Organizer & Attendee Assistance</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-orange-500/50 transition cursor-pointer">
            <Mail className="text-orange-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-sm text-neutral-500">Contact us regarding payouts or event cancellations.</p>
            <p className="mt-4 text-orange-500 font-mono text-xs">support@cinemaplus.co.ke</p>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-orange-500/50 transition cursor-pointer">
            <MessageSquare className="text-orange-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Live Chat</h3>
            <p className="text-sm text-neutral-500">Real-time assistance for organizers during live events.</p>
            <p className="mt-4 text-orange-500 font-mono text-xs">Available 24/7</p>
          </div>
        </div>

        <section className="p-8 bg-neutral-900/50 border border-white/5 rounded-3xl">
          <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h4 className="text-orange-500 font-bold text-sm mb-1 italic">When do I receive my payout?</h4>
              <p className="text-sm text-neutral-400">Payouts are settled 24-48 hours after an event is successfully marked as 'COMPLETED' in your dashboard.</p>
            </div>
            <div>
              <h4 className="text-orange-500 font-bold text-sm mb-1 italic">How do you handle ticket fraud?</h4>
              <p className="text-sm text-neutral-400">Our Scanner Mode uses unique hash validation. Once a ticket is scanned, it is marked as 'USED' in real-time across our network.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;