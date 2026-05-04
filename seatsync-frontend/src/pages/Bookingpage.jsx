import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react'; 
import emailjs from '@emailjs/browser';
import { Info, AlertCircle, Clock } from 'lucide-react';

// Components
import TicketPicker from '../components/TicketPicker';
import Modal from '../components/Modal'; 
import TicketForm from '../components/TicketForm';
import GeneratedTicket from '../components/GeneratedTicket';
import '../App.css';
import { API_URL } from '../config';

const socket = io(API_URL);

const BookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useClerk(); 

  // --- 1. STATE MANAGEMENT ---
  const [eventDetails, setEventDetails] = useState(null);
  const [seats, setSeats] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [selectedTickets, setSelectedTickets] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isBooking, setIsBooking] = useState(false); 
  const [ticketData, setTicketData] = useState(null); 

  // --- 2. DATA LOADING & SOCKETS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const eventRes = await axios.get(`${API_URL}/api/events/${eventId}`);
        if (eventRes.data.data) setEventDetails(eventRes.data.data);

        const seatsRes = await axios.get(`${API_URL}/api/seats/event/${eventId}/public`);
        
        const formattedSeats = Object.entries(seatsRes.data.data).flatMap(([tierName, count]) => 
          Array(count).fill({ row: tierName })
        );
        
        setSeats(formattedSeats);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load event data");
        navigate('/events');
      }
    };
    loadData();

    socket.on('tickets_purchased', (data) => {
      if (data.eventId === eventId) {
        axios.get(`${API_URL}/api/seats/event/${eventId}/public`).then(res => {
            const formattedSeats = Object.entries(res.data.data).flatMap(([tierName, count]) => 
                Array(count).fill({ row: tierName })
            );
            setSeats(formattedSeats);
        });
      }
    });

    return () => socket.off('tickets_purchased');
  }, [eventId, navigate]);

  // --- 3. HELPER CALCULATIONS ---
  const soldCounts = seats.reduce((acc, seat) => {
    acc[seat.row] = (acc[seat.row] || 0) + 1;
    return acc;
  }, {});

  const totalHumanOccupancy = seats.reduce((sum, seat) => {
    const multiplier = seat.row.toLowerCase().includes('group') ? 3 : 1;
    return sum + multiplier;
  }, 0);

  const isSoldOut = totalHumanOccupancy >= (eventDetails?.maxCapacity || 100);
  const isExpired = eventDetails ? new Date(eventDetails.date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) : false;

  const handleQuantityChange = (tierId, delta) => {
    if (!isSignedIn) {
      return openSignIn({
        mode: 'modal',
        afterSignInUrl: window.location.href
      });
    }
    
    if (isSoldOut || isExpired) return; 
    
    const tier = eventDetails.tiers.find(t => t.id === tierId);
    if (!tier) return;

    const available = tier.capacity - (soldCounts[tier.name] || 0);

    setSelectedTickets(prev => {
      const currentQty = prev[tierId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty > available) {
        toast.error(`Only ${available} tickets left!`);
        return prev;
      }
      if (newQty > 10) return prev;
      return { ...prev, [tierId]: newQty };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalPrice = eventDetails?.tiers?.reduce((acc, tier) => {
    return acc + (tier.price * (selectedTickets[tier.id] || 0));
  }, 0) || 0;

  // --- 4. SUBMISSION LOGIC ---
  const handleBookingSubmit = async (formData) => {
    if (totalTickets === 0) return toast.error("Please select at least one ticket");

    setIsBooking(true);
    const toastId = toast.loading("Initiating M-Pesa payment...");

    try {
      const token = await getToken();

      const mpesaRes = await axios.post(`${API_URL}/api/v1/mpesa/stkpush`, 
        { 
          phone: formData.phone, 
          amount: totalPrice,
          userId: user.id, 
          customerName: formData.fullName,
          customerEmail: formData.email,
          eventId,
          tickets: selectedTickets,
          acceptedTerms: formData.acceptedTerms
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const checkoutRequestID = mpesaRes.data.CheckoutRequestID;
      toast.loading("Please enter your M-Pesa PIN on your phone...", { id: toastId });

      const startTime = Date.now();
      const timeoutLimit = 60000; 

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API_URL}/api/v1/mpesa/status/${checkoutRequestID}`);
          const currentStatus = statusRes.data.status;

          if (currentStatus === 'success') {
            clearInterval(pollInterval);
            toast.success("Payment Confirmed!", { id: toastId });

            const ticketSummary = Object.entries(selectedTickets)
              .filter(([_, qty]) => qty > 0)
              .map(([tierId, qty]) => {
                const tier = eventDetails.tiers.find(t => t.id === tierId);
                return `${qty}x ${tier.name}`;
              })
              .join(', ');

            emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
              {
                to_name: formData.fullName,
                to_email: formData.email,
                event_title: eventDetails.title,
                event_date: new Date(eventDetails.date).toLocaleDateString('en-KE', { 
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                }),
                location: eventDetails.location,
                ticket_details: ticketSummary,
                total_price: totalPrice.toLocaleString(),
                order_id: checkoutRequestID.slice(-8).toUpperCase()
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            ).catch(e => console.error("Email failed:", e));

            setTicketData({ 
              ...formData, 
              movie: eventDetails.title, 
              price: totalPrice, 
              quantity: totalTickets,
              row: Object.keys(selectedTickets).map(id => eventDetails.tiers.find(t => t.id === id).name).join(', '),
              date: new Date(eventDetails.date).toLocaleDateString(),
              mpesaReceipt: statusRes.data.mpesaReceipt 
            });

            setIsBooking(false);

          } else if (currentStatus === 'failed' || currentStatus === 'expired') {
            clearInterval(pollInterval);
            setIsBooking(false);
            const errorMessage = currentStatus === 'expired' ? "Payment timed out" : "Payment failed or was cancelled";
            toast.error(errorMessage, { id: toastId });
          }

          if (Date.now() - startTime > timeoutLimit) {
            clearInterval(pollInterval);
            if (isBooking) {
              setIsBooking(false);
              toast.error("Payment session timed out. Try again.", { id: toastId });
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);

    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed", { id: toastId });
      setIsBooking(false);
    }
  };

  if (loading) return <div className="text-white p-20 text-center animate-pulse">Loading event...</div>;

  return (
    <div className="container p-4 min-h-screen">
      <div className="text-center mt-10 mb-6">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{eventDetails?.title}</h1>
        <p className="text-neutral-500 mt-2 font-bold text-sm uppercase tracking-widest">
          📍 {eventDetails?.location} • 📅 {new Date(eventDetails?.date).toLocaleDateString()}
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-6">
        {isExpired ? (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-500">
            <Clock size={20} />
            <p className="text-sm font-bold uppercase tracking-tight">This event has already ended</p>
          </div>
        ) : isSoldOut ? (
          <div className="bg-orange-500/10 border border-orange-500/50 p-4 rounded-2xl flex items-center gap-3 text-orange-500">
            <AlertCircle size={20} />
            <p className="text-sm font-bold uppercase tracking-tight">This event is fully booked</p>
          </div>
        ) : null}
      </div>

      <div className="max-w-2xl mx-auto mb-10 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3 text-orange-500">
          <Info size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest">Event Description</h2>
        </div>
        <p className="text-neutral-300 text-sm leading-relaxed italic">
          {eventDetails?.description || "No description provided for this event."}
        </p>
      </div>
      
      <div className={(isSoldOut || isExpired) ? "opacity-40 pointer-events-none grayscale" : ""}>
        <TicketPicker 
          key={eventDetails?._id || 'picker'} 
          tiers={eventDetails?.tiers || []} 
          selectedTickets={selectedTickets}
          onQuantityChange={handleQuantityChange}
          loading={loading}
          soldCounts={soldCounts}
        />
      </div>

      {totalTickets > 0 && !ticketData && !isSoldOut && !isExpired && (
        <div className="checkout-bar">
          <div className="price-summary">
            <p>{totalTickets} tickets selected</p>
            <h3>KES {totalPrice.toLocaleString()}</h3>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn-pay"
          >
            Get Tickets
          </button>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen || !!ticketData} 
        onClose={() => { setIsModalOpen(false); setTicketData(null); setIsBooking(false); }}
      >
        {ticketData ? (
           <GeneratedTicket key="success-ticket" data={ticketData} />
        ) : (
           <TicketForm 
             key="booking-form"
             movieTitle={eventDetails?.title}
             price={totalPrice}
             tiers={eventDetails?.tiers}
             selectedTickets={selectedTickets}
             onSubmit={handleBookingSubmit}
             loading={isBooking}
           />
        )}
      </Modal>
    </div>
  );
};

export default BookingPage;