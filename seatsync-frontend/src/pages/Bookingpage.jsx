import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react'; 
// 👇 1. Import EmailJS
import emailjs from '@emailjs/browser';

import SeatMap from '../components/SeatMap';
import Modal from '../components/Modal'; 
import TicketForm from '../components/TicketForm';
import GeneratedTicket from '../components/GeneratedTicket';
import '../App.css';
import { API_URL } from '../config';

// Initialize socket connection
const socket = io(API_URL);

const BookingPage = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentEventId, setCurrentEventId] = useState(null);
  
  // New State for the Ticket Logic
  const [ticketData, setTicketData] = useState(null); 
  const [isBooking, setIsBooking] = useState(false); 

  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser(); 

  // 1. INITIALIZATION: Find the Event ID first
  useEffect(() => {
    const fetchEventId = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events`);
        
        if (response.data.data && response.data.data.length > 0) {
          setCurrentEventId(response.data.data[0]._id);
        } else {
          toast.error("No events found in database!");
          setLoading(false);
        }
      } catch (error) {
        console.error("Initialization Error:", error);
        toast.error("Failed to connect to server");
        setLoading(false);
      }
    };

    fetchEventId();
  }, []);

  // 2. FETCH SEATS: Runs only after we have an Event ID
  useEffect(() => {
    if (!currentEventId) return; 

    const fetchSeats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/seats/event/${currentEventId}`);
        setSeats(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching seats:", error);
        toast.error("Failed to load map");
        setLoading(false);
      }
    };

    fetchSeats();

    // Socket Listeners
    socket.on('seat_updated', (updatedSeat) => {
      setSeats((currentSeats) => 
        currentSeats.map((seat) => 
          seat._id === updatedSeat._id ? updatedSeat : seat
        )
      );
    });

    socket.on('events_reset', (freshSeats) => {
      toast("Event was reset by Admin!", { icon: '⚠️' });
      setSeats(freshSeats);
      setTicketData(null); 
    });

    return () => {
      socket.off('seat_updated');
      socket.off('events_reset');
    };
  }, [currentEventId]);

  // 3. Logic: Find the seat *I* am currently holding
  const myHeldSeat = seats.find(
    (seat) => seat.status === 'HELD' && seat.userId === user?.id
  );

  // 4. Handle CLICK (Hold the seat)
  const handleSeatClick = async (seat) => {
    if (!isSignedIn) return toast.error("Please sign in first");
    
    if (ticketData) setTicketData(null);
    
    if (myHeldSeat) return toast.error("You can only hold one seat at a time!");

    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/seats/hold`, 
        { seatId: seat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Seat Held! Complete the form to book.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Hold failed");
    }
  };

  // 5. Handle FORM SUBMIT (Book the seat + Send Email)
  const handleBookingSubmit = async (formData) => {
    if (!myHeldSeat) return;

    setIsBooking(true);
    const toastId = toast.loading("Processing payment...");

    try {
      const token = await getToken();
      
      // A. Call Backend (Save to DB Only)
      // We removed the backend email logic, so this just marks it "SOLD"
      await axios.post(`${API_URL}/api/seats/book`, 
        { 
          seatId: myHeldSeat._id,
          // We still send these just in case you want to save them in DB later
          email: formData.email, 
          fullName: formData.fullName,
          movie: "Avengers: Secret Wars", 
          price: myHeldSeat.price 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // B. Send Email via EmailJS (Frontend) 🚀
      try {
        const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        const emailParams = {
            to_name: formData.fullName,
            to_email: formData.email, // Ensure your EmailJS template uses {{to_email}}
            movie: "Avengers: Secret Wars",
            seat: `${myHeldSeat.row}${myHeldSeat.number}`,
            price: myHeldSeat.price
        };

        // Send email without blocking the UI (fire and forget)
        await emailjs.send(serviceID, templateID, emailParams, publicKey);
        console.log("✅ Email sent successfully via EmailJS!");
        
      } catch (emailError) {
        console.error("❌ EmailJS Failed:", emailError);
        // We don't stop the booking if email fails, just log it
      }

      // C. Success UI
      toast.dismiss(toastId);
      toast.success("Booking Successful!");

      // Save local state to show the ticket on screen
      setTicketData({
        ...formData, 
        seat: `${myHeldSeat.row}${myHeldSeat.number}`,
        price: myHeldSeat.price,
        movie: "Avengers: Secret Wars", 
        date: "Oct 25, 2025" 
      });

    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Payment Failed. Timer may have expired.");
      console.error(error);
    } finally {
      setIsBooking(false);
    }
  };

  // 6. Handle CANCEL (Release)
  const handleCancelClick = async () => {
    if (ticketData) {
        setTicketData(null); 
        return;
    }

    if (!myHeldSeat) return;

    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/seats/release`, 
        { seatId: myHeldSeat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Seat released.");
    } catch (error) {
      console.error("Release failed", error);
    }
  };

  return (
    <>
      <div className="container">
        <SeatMap 
          seats={seats} 
          loading={loading} 
          onSeatClick={handleSeatClick} 
        />
      </div>

      <Modal isOpen={!!myHeldSeat || !!ticketData} onClose={handleCancelClick}>
        
        {ticketData ? (
           <GeneratedTicket data={ticketData} />
        ) : (
           myHeldSeat && (
             <TicketForm 
               selectedSeat={`${myHeldSeat.row}${myHeldSeat.number}`}
               price={myHeldSeat.price}
               movieTitle="Avengers: Secret Wars"
               onSubmit={handleBookingSubmit}
               loading={isBooking}
             />
           )
        )}

      </Modal>
    </>
  );
};

export default BookingPage;