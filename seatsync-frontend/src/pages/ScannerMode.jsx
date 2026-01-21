import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Camera, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';

const ScannerMode = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [lastScanned, setLastScanned] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    async function onScanSuccess(decodedText) {
      try {
        // 1. Parse the JSON from the QR code we built earlier
        const ticketData = JSON.parse(decodedText);
        const ticketId = ticketData.id; 

        if (ticketId === lastScanned) return; // Prevent double scans

        const token = await getToken();
        const res = await axios.patch(`${API_URL}/api/seats/check-in/${ticketId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const admissionCount = res.data.details.admissionCount;
        setLastScanned(ticketId);
        
        // Success Audio Feedback
        new Audio('/assets/sounds/success.mp3').play().catch(() => {});
        
        toast.success(`VALID: Admitting ${admissionCount} guest(s)!`, {
          duration: 4000,
          icon: '✅',
        });
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Invalid or Duplicate Ticket");
      }
    }

    scanner.render(onScanSuccess);
    return () => scanner.clear();
  }, [eventId, getToken, lastScanned]);

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => navigate(`/admin/analytics/${eventId}`)}
          className="flex items-center gap-2 text-neutral-500 mb-8"
        >
          <ChevronLeft size={20} /> Back to Stats
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Gate Scanner</h1>
          <p className="text-orange-500 text-xs font-bold tracking-widest uppercase mt-1">Nairobi Tech Week Entry</p>
        </header>

        {/*  THE CAMERA VIEWFINDER */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-white/10 bg-neutral-900 shadow-2xl shadow-orange-500/10">
          <div id="reader" className="w-full"></div>
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40"></div>
        </div>

        <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-3xl text-center">
          <div className="flex justify-center mb-4 text-orange-500">
            <Camera size={32} className="animate-pulse" />
          </div>
          <p className="text-sm text-neutral-400">Position the QR code within the square to admit guests.</p>
        </div>
      </div>
    </div>
  );
};

export default ScannerMode;