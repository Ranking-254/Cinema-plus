import React, { useRef, useState } from 'react'; 
import html2canvas from 'html2canvas-pro'; 
import QRCode from 'react-qr-code'; 

export default function GeneratedTicket({ data, compact = false }) {
  const ticketRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // 🚀 Standardized QR Data for Organizer Scanning
  const qrData = JSON.stringify({
    id: data.order_id || 'TEMP-' + Math.random().toString(36).substr(2, 5),
    name: data.fullName,
    movie: data.movie,
    qty: data.quantity || 1
  });

  const handleDownload = async () => {
    if (!ticketRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 3, // High-res for clear QR scanning
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `CinemaPlus-${data.fullName}-${data.movie}.png`;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex flex-col items-center text-center animate-fade-in w-full ${compact ? '' : 'max-w-2xl px-4'}`}>
      
      {/* 🚀 Header Section */}
      {!compact && (
        <div className="mb-8 mt-2">
            <h2 className="text-3xl md:text-5xl font-black italic mb-2 leading-tight text-white uppercase tracking-tighter">
              SEE YOU AT THE <span className="text-orange-500">SHOW!</span>
            </h2>
            <p className="text-sm md:text-base max-w-md mx-auto text-neutral-400 font-medium">
              Hey <span className="text-white">{data.fullName}</span>, your spot for <span className="text-white border-b border-orange-500/50">{data.movie}</span> is locked in.
            </p>
        </div>
      )}

      {/* 🚀 Ticket Visual Container */}
      <div 
        id="ticket-visual"
        ref={ticketRef} 
        className={`relative w-full ${compact ? '' : 'max-w-[500px] mx-auto'} my-5 shadow-2xl rounded-xl overflow-hidden bg-transparent`}
      >
        {/* Background Asset */}
        <img 
          src="/assets/images/pattern-ticket.svg" 
          alt="Ticket Pattern" 
          className="w-full h-auto block select-none"
        />

        <div className="absolute inset-0 p-4 md:p-6 flex items-center">
          
          {/* Left Side: Info */}
          <div className="flex-1 flex flex-col justify-between h-full text-left">
             <div className="flex items-start gap-3">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-black text-xl md:text-3xl shrink-0 bg-orange-500 text-black italic border-2 border-white/20">
                  {data.movie ? data.movie[0] : 'C'}
               </div>
               
               <div className="min-w-0">
                 <h3 className="font-black text-sm md:text-xl tracking-tighter uppercase leading-none text-white truncate">
                   {data.movie}
                 </h3>
                 <p className="text-[9px] md:text-xs font-bold text-neutral-500 mt-1 uppercase tracking-widest">
                   {data.date} • CINEMA PLUS+
                 </p>
               </div>
             </div>

             <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-black/30 p-2 rounded-xl border border-white/5">
                   <img src={data.avatarPreview} className="w-10 h-10 rounded-lg object-cover border border-white/10 bg-neutral-800" alt="User Avatar" />
                   <div className="min-w-0">
                     <p className="text-xs md:text-sm font-bold text-white truncate uppercase italic">{data.fullName}</p>
                     <p className="text-[9px] text-neutral-500 font-mono truncate">{data.email}</p>
                   </div>
                </div>
                
                {/* 🚀 DYNAMIC ADMISSION LABEL */}
                <div>
                     <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-[9px] md:text-xs font-black text-orange-500 uppercase tracking-widest">
                        {data.row?.toLowerCase().includes('group') 
                          ? `ADMIT GROUP (${data.quantity || 3})` 
                          : data.quantity > 1 
                            ? `ADMIT ${data.quantity} PEOPLE` 
                            : "ADMIT ONE"} 
                        • KES {data.price?.toLocaleString()}
                     </span>
                </div>
             </div>
          </div>

          {/* Right Side: QR & Seat */}
          <div className="w-[85px] md:w-[110px] flex flex-col items-center justify-center h-full ml-2 border-l-2 border-white/10 border-dashed gap-4">             
             <div className="rotate-90 text-center">
                <span className="block text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase mb-1 text-neutral-600">SEAT</span>
                <span className="block text-xl md:text-3xl font-black text-white italic tracking-tighter">
                    {data.seat || 'GEN'}
                </span>
             </div>

             <div className="bg-white p-1 rounded-lg shadow-xl">
                 <QRCode 
                    value={qrData} 
                    size={64} 
                    level="H"
                    className="w-full h-auto"
                 />
             </div>
          </div>
        </div>
      </div>

      {/* 🚀 Download Action */}
      <button 
        onClick={handleDownload}
        disabled={isExporting}
        className={`
            ${compact 
                ? 'mt-4 py-2 px-6 text-sm bg-neutral-800 border-neutral-700 text-neutral-300' 
                : 'mt-10 py-4 px-10 text-base bg-white text-black hover:bg-orange-500 hover:text-white'}
            font-black uppercase italic rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 w-full md:w-auto active:scale-95 disabled:opacity-50 no-print shadow-xl
        `}
      >
        <svg className={`w-5 h-5 ${isExporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isExporting ? "PREPARING..." : compact ? "SAVE IMAGE" : "DOWNLOAD PNG TICKET"}
      </button>

    </div>
  );
}