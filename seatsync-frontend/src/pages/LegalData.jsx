import { ChevronLeft, Lock, Eye, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Privacy <span className="text-orange-500">Policy</span></h1>
          <p className="text-neutral-500 text-sm uppercase font-bold tracking-widest">Cinema Plus+ Data Protection</p>
        </header>

        <div className="space-y-10 text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="text-orange-500" size={20} /> 1. Authentication Data
            </h2>
            <p>
              We use Clerk for secure user authentication. Cinema Plus+ does not store your passwords on our servers. When you log in, we only access the necessary identifiers (User ID and Email) provided by Clerk to manage your account permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="text-orange-500" size={20} /> 2. Transactional Information
            </h2>
            <p>
              When you purchase a ticket, we collect the customer's full name and email. This data is strictly used for ticket generation, delivery, and refund processing in the event of a cancellation.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="text-orange-500" size={20} /> 3. Data Disclosure
            </h2>
            <p className="text-sm">
              We only share your ticket information (Name and Email) with the specific Organizer of the event you are attending for check-in purposes. We never sell your personal data to third-party advertisers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;