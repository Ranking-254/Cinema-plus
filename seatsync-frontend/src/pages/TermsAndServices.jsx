import { ChevronLeft, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Back
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Terms of <span className="text-orange-500">Service</span></h1>
          <p className="text-neutral-500 text-sm uppercase font-bold tracking-widest">Last Updated: January 2026</p>
        </header>

        <div className="space-y-10 text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-orange-500" size={20} /> 1. Marketplace Model
            </h2>
            <p>
              Cinema Plus+ acts strictly as a third-party marketplace platform. We provide the technology for Organizers to list events and for Attendees to purchase tickets. Cinema Plus+ does not organize, host, or manage the actual events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={20} /> 2. Cancellations & Refunds
            </h2>
            <p>
              Event organizers reserve the right to cancel or postpone events. In the event of a cancellation, Cinema Plus+ will initiate a "Refund Pending" status for all ticket holders. Refunds are processed back to the original payment method, subject to the organizer's specific refund policy.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="text-orange-500" size={20} /> 3. Liability Limitation
            </h2>
            <p className="text-sm">
              Cinema Plus+ shall not be held liable for any loss, injury, or damage resulting from event attendance or cancellation. Our liability is limited strictly to the service fee collected during the transaction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;