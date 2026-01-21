import React from 'react';
import { ShieldCheck, Zap, Users, Code2, Globe, Ticket, Cpu, Layers } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: "Uptime", value: "99.9%" },
    { label: "Security", value: "Enterprise" },
    { label: "Processing", value: "Real-time" },
    { label: "Platform", value: "Cloud-Native" }
  ];

  const features = [
    {
      icon: <ShieldCheck className="text-orange-500" size={24} />,
      title: "Secure Infrastructure",
      description: "Built with Clerk authentication and role-based access control to ensure every transaction and piece of data is protected."
    },
    {
      icon: <Zap className="text-blue-500" size={24} />,
      title: "Lightning Performance",
      description: "Leveraging the MERN stack and Vercel edge deployment for sub-second page loads and instant ticket generation."
    },
    {
      icon: <Users className="text-purple-500" size={24} />,
      title: "Marketplace Focused",
      description: "Designed to empower independent organizers with professional-grade analytics and guest management tools."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HERO SECTION */}
        <section className="text-center mb-20 animate-fade-in">
          <h2 className="text-orange-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">The Future of Events</h2>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6">
            Redefining the <span className="text-blue-500 underline decoration-white/10">Experience.</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Tick8 is Kenya's premier real-time seat reservation engine. We bridge the gap between world-class organizers and passionate audiences through cutting-edge technology.
          </p>
        </section>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center backdrop-blur-sm">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* MISSION & VISION */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 p-10 rounded-[3rem]">
            <h3 className="text-2xl font-black italic mb-4 uppercase">Our Mission</h3>
            <p className="text-gray-400 leading-relaxed">
              To provide a seamless, transparent, and high-performance ticketing ecosystem where technology serves the art of gathering. We eliminate double-bookings and manual errors through real-time socket synchronization.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem]">
            <h3 className="text-2xl font-black italic mb-4 uppercase">The Vision</h3>
            <p className="text-gray-400 leading-relaxed">
              To become the standard for event infrastructure in East Africa, moving beyond just "tickets" to providing full-stack marketplace intelligence for every event organizer.
            </p>
          </div>
        </div>

        {/* TECH STACK SECTION */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-white/10"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500">Engineered With</h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex flex-col items-center gap-2">
                <Code2 size={32} />
                <span className="text-[10px] font-bold">REACT.JS</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <Cpu size={32} />
                <span className="text-[10px] font-bold">NODE.JS</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <Layers size={32} />
                <span className="text-[10px] font-bold">MONGODB</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <Globe size={32} />
                <span className="text-[10px] font-bold">SOCKET.IO</span>
             </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group p-8 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all">
              <div className="mb-6 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h4 className="text-lg font-bold mb-3 italic uppercase">{feature.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CALL TO ACTION */}
        <footer className="mt-20 pt-10 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm mb-6">Experience the next generation of event management.</p>
          <button 
            onClick={() => window.location.href = '/events'}
            className="bg-white text-black px-10 py-4 rounded-full font-black italic uppercase text-sm hover:bg-orange-500 hover:text-white transition-all active:scale-95"
          >
            Explore Events
          </button>
        </footer>

      </div>
    </div>
  );
};

export default AboutPage;