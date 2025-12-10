import React, { useRef } from 'react'; 
import html2canvas from 'html2canvas-pro'; 
import QRCode from 'react-qr-code'; 

export default function GeneratedTicket({ data, compact = false }) {
  const ticketRef = useRef(null);

  const qrData = `TICKET-${data.seat}-${data.email || 'guest'}`;

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
      link.download = `CinemaPlus-Ticket-${data.seat || '00'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please check the console.");
    }
  };

  return (
    <div className={`flex flex-col items-center text-center animate-fade-in w-full ${compact ? '' : 'max-w-2xl px-4'}`}>
      
      {/* Header Text */}
      {!compact && (
        /* FIX: Added mb-8 to push ticket down */
        <div className="mb-7 mt-2">
            <h2 className="text-2xl md:text-5xl font-bold mb-2 leading-tight text-white">
            Enjoy the show, <br className="md:hidden"/>
            <span className="text-gradient">{data.fullName}!</span>
            </h2>
            <p className="text-base md:text-xl max-w-md mx-auto text-neutral-300">
            Your ticket for <span className="text-orange-500 font-bold">{data.movie}</span> is confirmed.
            </p>
            <p className="hidden md:block max-w-md mx-auto mt-2 text-sm text-neutral-400">
            We've emailed a copy to <span className="text-white">{data.email}</span>.
            </p>
        </div>
      )}

      {/* Ticket Container */}
      <div 
        id="ticket-visual"
        ref={ticketRef} 
        /* FIX: Added my-4 for vertical breathing room */
        className={`relative w-full ${compact ? '' : 'max-w-[500px] mx-auto'} my-5 transform hover:scale-[1.01] transition duration-500`}
      >
        <img 
          src="/assets/images/pattern-ticket.svg" 
          alt="Ticket Background" 
          className="w-full drop-shadow-2xl select-none"
        />

        <div className="absolute inset-0 p-3 md:p-6 flex items-center">
          
          {/* Left Side */}
          <div className="flex-1 flex flex-col justify-between h-full text-left">
             <div className="flex items-start gap-3">
               <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center font-bold text-lg md:text-2xl shrink-0 border border-neutral-500 bg-orange-500 text-black">
                  {data.movie ? data.movie[0] : 'M'}
               </div>
               
               <div className="min-w-0 flex flex-col justify-center">
                 {/* FONT SIZE FIX: 
                     1. Changed text-[15px] -> text-sm (Smaller on mobile)
                     2. Changed md:text-l -> md:text-xl (Corrected typo for desktop)
                 */}
                 <h3 className="font-bold text-[11px] md:text-xl tracking-wide uppercase leading-tight text-white truncate pr-2">
                   {data.movie}
                 </h3>
                 <p className="text-xs md:text-sm text-neutral-400 mt-1">
                   {data.date} / <span className="text-neutral-500">Cinema Plus</span>
                 </p>
               </div>
             </div>

             <div className="flex flex-col gap-2 mt-0.5 md:mt-4">
                <div className="flex items-center gap-3">
                   <img src={data.avatarPreview} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-neutral-600 bg-neutral-800" alt="User" />
                   <div className="min-w-0">
                     <p className="text-sm md:text-lg font-medium text-white truncate">{data.fullName}</p>
                     <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <img src="/assets/images/icon-github.svg" alt="" className="w-3 h-3 opacity-60" /> 
                        <span className="truncate max-w-[120px]">{data.github}</span>
                     </div>
                   </div>
                </div>
                
                <div className="mt-1">
                     <span className="inline-flex items-center px-2 py-1 rounded bg-black/40 border border-orange-500/20 text-[10px] md:text-xs font-mono text-orange-400">
                       ADMIT ONE • ${data.price}
                     </span>
                </div>
             </div>
          </div>

          {/* Right Side */}
          <div className="w-[80px] md:w-[100px] flex flex-col items-center justify-center h-full ml-2 border-l border-white/10 border-dashed gap-3 md:gap-4">             
             <div className="rotate-90 text-center whitespace-nowrap">
                <span className="block text-[10px] md:text-xs tracking-widest uppercase mb-1 text-neutral-500">SEAT</span>
                <span className="block text-xl md:text-2xl font-mono font-bold text-white">{data.seat}</span>
             </div>

             <div className="bg-white p-1 md:p-1.5 rounded-md shadow-sm opacity-90">
                 <QRCode 
                    value={qrData} 
                    size={compact ? 48 : 56} 
                    className="w-full h-auto"
                 />
             </div>

          </div>
        </div>
      </div>

      {/* Button */}
      <button 
        onClick={handleDownload}
        /* FIX: Increased top margin to mt-8 */
        className={`
            ${compact 
                ? 'mt-4 py-2 px-6 text-sm bg-neutral-800 border-neutral-700 text-neutral-300 w-full md:w-auto md:px-10 md:hover:bg-neutral-700' 
                : 'mt-8 py-3 px-8 text-base bg-white text-black shadow-lg shadow-orange-500/20 w-full md:w-auto'}
            font-bold rounded-lg border flex items-center justify-center gap-2 transition hover:bg-opacity-90
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        {compact ? "Save" : "Download Ticket"}
      </button>

    </div>
  );
}