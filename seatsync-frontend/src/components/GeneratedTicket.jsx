import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function GeneratedTicket({ data }) {
  const ticketRef = useRef(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        onclone: (document) => {
          const element = document.getElementById('ticket-visual');
          if (element) {
            element.style.fontFeatureSettings = '"liga" 0';
          }
        }
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `CinemaPlus-Ticket-${data.seat}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please check the console.");
    }
  };

  return (
    <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-2xl px-4">
      
      {/* Header Text */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
          Enjoy the show, <span className="text-gradient block mt-2">{data.fullName}!</span>
        </h2>
        <p className="text-xl max-w-md mx-auto" style={{ color: '#d4d4d4' }}>
          Your ticket for <span style={{ color: '#f97316', fontWeight: 'bold' }}>{data.movie}</span> is confirmed.
        </p>
        <p className="max-w-md mx-auto mt-2 text-sm" style={{ color: '#a3a3a3' }}>
          We've emailed a copy to <span className="text-white">{data.email}</span>.
        </p>
      </div>

      {/* --- TICKET CONTAINER --- */}
      <div 
        id="ticket-visual"
        ref={ticketRef} 
        className="relative w-full max-w-[600px] mx-auto transform hover:scale-[1.02] transition duration-500"
      >
        <img 
          src="/assets/images/pattern-ticket.svg" 
          alt="Ticket Background" 
          className="w-full drop-shadow-2xl"
        />

        {/* FIX 2: Adjusted padding here (px-6 py-5 instead of p-6) to give more vertical space */}
        <div className="absolute inset-0 px-6 py-5 md:px-8 md:py-7 flex items-center">
          
          {/* Left Side */}
          <div className="flex-1 flex flex-col justify-between h-full text-left py-1">
             
             {/* Movie Title & Logo */}
             <div className="flex items-start md:items-center gap-4">
               <div 
                 className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl"
                 style={{ border: '1px solid #737373', backgroundColor: '#f97316', color: '#000000' }}
               >
                  {data.movie ? data.movie[0] : 'M'}
               </div>
               <div>
                 <h3 className="font-bold text-xl md:text-2xl tracking-wide uppercase leading-none mb-1" style={{ color: '#ffffff' }}>
                   {data.movie}
                 </h3>
                 <p className="text-sm flex items-center gap-2" style={{ color: '#d4d4d4' }}>
                   <span>{data.date}</span>
                   <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#737373' }}></span>
                   <span>Cinema Plus</span>
                 </p>
               </div>
             </div>

             {/* User Info - FIX 2b: Changed mt-4 to mt-3 for tighter spacing */}
             <div className="flex items-center gap-4 mt-3">
               <img 
                 src={data.avatarPreview} 
                 className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover" 
                 alt="User avatar" 
                 style={{ border: '1px solid #737373' }}
               />
               <div className="min-w-0 flex-1 pt-1"> {/* Added pt-1 to push text down slightly */}
                 <p className="text-lg font-medium truncate leading-tight" style={{ color: '#ffffff' }}>{data.fullName}</p>
                 
                 <div className="flex items-center gap-3 text-sm mb-1" style={{ color: '#a3a3a3' }}>
                    <div className="flex items-center gap-1">
                        <img src="/assets/images/icon-github.svg" alt="" className="w-4 h-4 opacity-70" /> 
                        <span className="truncate max-w-[120px]">{data.github}</span>
                    </div>
                 </div>

                 {/* Price Badge */}
                 <div 
                   className="inline-block text-xs px-2 py-1 rounded mt-1"
                   style={{ 
                     backgroundColor: 'rgba(249, 115, 22, 0.2)', 
                     color: '#fb923c', 
                     border: '1px solid rgba(249, 115, 22, 0.3)' 
                   }}
                 >
                    ADMIT ONE • ${data.price}
                 </div>
               </div>
             </div>
          </div>

          {/* Right Side: Seat Number */}
          <div className="w-[20%] flex items-center justify-center h-full ml-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
             <div className="rotate-90 text-center">
                {/* FIX 1: Changed mb-1 to mb-3 for more space */}
                <span className="block text-xs tracking-widest uppercase mb-3" style={{ color: '#737373' }}>SEAT</span>
                <span className="block text-3xl font-mono font-bold tracking-widest whitespace-nowrap" style={{ color: '#ffffff' }}>
                  {data.seat}
                </span>
             </div>
          </div>

        </div>
      </div>

      {/* Download Button */}
      <button 
        onClick={handleDownload}
        className="mt-8 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg border border-neutral-600 flex items-center gap-2 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        Download Ticket
      </button>

    </div>
  );
}