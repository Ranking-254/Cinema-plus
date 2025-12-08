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

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
          Enjoy the show, <span className="text-gradient block mt-2">{data.fullName}!</span>
        </h2>
        <p className="text-xl max-w-md mx-auto text-neutral-300">
          Your ticket for <span className="text-orange-400 font-bold">{data.movie}</span> is confirmed.
        </p>
        <p className="max-w-md mx-auto mt-2 text-sm text-neutral-400">
          We've emailed a copy to <span className="text-white">{data.email}</span>.
        </p>
      </div>

      {/* TICKET */}
      <div
        id="ticket-visual"
        ref={ticketRef}
        className="relative w-full max-w-[600px] mx-auto hover:scale-[1.02] transition duration-500"
      >
        <img
          src="/assets/images/pattern-ticket.svg"
          alt="Ticket Background"
          className="w-full drop-shadow-2xl"
        />

        {/* Updated spacing + alignment */}
        <div
          className="absolute inset-0 px-6 py-6 md:px-10 md:py-9 flex justify-between items-center backdrop-blur-[2px]"
        >

          {/* LEFT SIDE */}
          <div className="flex-1 flex flex-col gap-6 h-full text-left">

            {/* Movie Title */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl"
                style={{ border: '1px solid #737373', backgroundColor: '#f97316', color: '#000' }}
              >
                {data.movie ? data.movie[0] : 'M'}
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-2xl tracking-wide uppercase leading-none text-white">
                  {data.movie}
                </h3>
                <p className="text-sm flex items-center gap-2 text-neutral-300">
                  <span>{data.date}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-500"></span>
                  <span>Cinema Plus</span>
                </p>
              </div>
            </div>

            {/* USER */}
            <div className="flex items-center gap-4">
              <img
                src={data.avatarPreview}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border border-neutral-600"
                alt="User avatar"
              />
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-lg font-medium truncate leading-tight text-white">
                  {data.fullName}
                </p>

                <div className="flex items-center gap-3 text-sm text-neutral-400 mb-1">
                  <div className="flex items-center gap-1">
                    <img src="/assets/images/icon-github.svg" alt="" className="w-4 h-4 opacity-70" />
                    <span className="truncate max-w-[120px]">{data.github}</span>
                  </div>
                </div>

                {/* Price */}
                <div
                  className="inline-block text-xs px-2 py-1 rounded"
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

          {/* RIGHT SIDE - SEAT */}
          <div className="w-[22%] flex items-center justify-center h-full pl-4 ml-4 border-l border-white/10">
            <div className="rotate-90 text-center">
              <span className="block text-[10px] tracking-[0.25em] uppercase mb-2 text-neutral-500">SEAT</span>
              <span className="block text-3xl font-mono font-bold tracking-widest text-white whitespace-nowrap">
                {data.seat}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="mt-8 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-8 rounded-lg border border-neutral-600 flex items-center gap-2 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Download Ticket
      </button>
    </div>
  );
}
