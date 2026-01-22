import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Ticket, ClipboardCheck, Sparkles, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const navigate = useNavigate();

  // 🚀 Reveal Effect Logic
  useEffect(() => {
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: <UserPlus size={32} className="text-blue-500" />,
      title: "Join the Club",
      description: "Create your secure account in seconds with Clerk. No complex forms, just pure access.",
      stepNumber: "1"
    },
    {
      icon: <Ticket size={32} className="text-orange-500" />,
      title: "Pick Your Event",
      description: "Browse live events and use our real-time engine to reserve your perfect spot in the crowd.",
      stepNumber: "2"
    },
    {
      icon: <ClipboardCheck size={32} className="text-green-500" />,
      title: "Instant Verification",
      description: "Receive your personalized digital ticket with a unique QR code directly in your dashboard and email.",
      stepNumber: "3"
    },
    {
      icon: <Sparkles size={32} className="text-purple-500" />,
      title: "Be There.",
      description: "Show your Ticket at the gate for instant entry. Zero double-bookings. 100% immersion.",
      stepNumber: "4"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0a0b0f] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-20 reveal">
          <h2 className="text-blue-500 font-bold text-xs uppercase tracking-[0.4em] mb-4">Onboarding Process</h2>
          <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white">
            Easy and <span className="text-blue-500">Simple</span> Booking.
          </h3>
          <p className="text-gray-500 mt-4 text-sm font-medium tracking-widest uppercase">
            Get started in just four simple steps
          </p>
        </div>

        {/* The Connection Line (Desktop) */}
        <div className="relative reveal" style={{ transitionDelay: '200ms' }}>
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all duration-500">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#0a0b0f] border border-blue-500/50 flex items-center justify-center text-[10px] font-black text-blue-500">
                    {step.stepNumber}
                  </div>
                  {index < 3 && (
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden lg:block">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                        <div className="w-2 h-1 border-b-2 border-r-2 border-green-500 rotate-45 -mt-0.5"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.07] transition-all h-full backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white mb-3 italic uppercase">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🚀 HIGH-IMPACT CALL TO ACTION */}
        <div className="mt-24 text-center reveal" style={{ transitionDelay: '400ms' }}>
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-600/20 via-orange-500/20 to-blue-600/20 mb-8">
            <p className="px-6 py-2 rounded-full bg-[#0a0b0f] text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Your next memory starts here
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => navigate('/events')}
              className="group relative px-12 py-5 bg-orange-500 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(249,115,22,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="relative flex items-center gap-3 text-black font-black italic uppercase tracking-tighter text-xl">
                Find My Event
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="text-orange-500" /> 
              Instant delivery 
            </p>
          </div>
        </div>
      </div>

      {/* 🎨 Required Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}} />
    </section>
  );
};

export default HowItWorks;