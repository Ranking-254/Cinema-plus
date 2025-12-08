import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react'; 
import SeatMap from '../components/SeatMap';
import Modal from '../components/Modal'; // Make sure you created this file!
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
  const [ticketData, setTicketData] = useState(null); // Stores the final ticket to show
  const [isBooking, setIsBooking] = useState(false); // Loading state for payment

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
      setTicketData(null); // Reset local ticket state if admin resets
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
    
    // If we already have a ticket shown, clear it to start over
    if (ticketData) setTicketData(null);
    
    if (myHeldSeat) return toast.error("You can only hold one seat at a time!");

    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/seats/hold`, 
        { seatId: seat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Note: We don't need to manually open the modal.
      // The socket will update 'seats', 'myHeldSeat' will become true, 
      // and the Modal below will automatically appear.
      toast.success("Seat Held! Complete the form to book.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Hold failed");
    }
  };

  // 5. Handle FORM SUBMIT (Book the seat)
  const handleBookingSubmit = async (formData) => {
    if (!myHeldSeat) return;

    setIsBooking(true);
    const toastId = toast.loading("Processing payment...");

    try {
      const token = await getToken();
      
      // Call your backend to finalize the booking
      await axios.post(`${API_URL}/api/seats/book`, 
        { 
          // 1. The Seat ID (for the database)
          seatId: myHeldSeat._id,
          
          // 2. The User Details (for the Email!) 📧
          email: formData.email, 
          fullName: formData.fullName,
          
          // 3. Ticket Details
          movie: "Avengers: Secret Wars", 
          price: myHeldSeat.price 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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
  // This is called if they close the modal or click cancel
  const handleCancelClick = async () => {
    // 1. FIRST check if we are just viewing a ticket. 
    // If yes, close it and stop here. We don't need to release anything.
    if (ticketData) {
        setTicketData(null); 
        return;
    }

    // 2. NOW check if we hold a seat.
    // If we don't hold a seat, we can't release one, so we stop.
    if (!myHeldSeat) return;

    // 3. If we made it here, release the held seat.
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

      {/* --- THE NEW MODAL SYSTEM --- */}
      {/* Open Modal if I am holding a seat OR if I have a generated ticket to show */}
      <Modal isOpen={!!myHeldSeat || !!ticketData} onClose={handleCancelClick}>
        
        {/* VIEW 1: SHOW THE TICKET (Success State) */}
        {ticketData ? (
           <GeneratedTicket data={ticketData} />
        ) : (
           /* VIEW 2: SHOW THE FORM (Booking State) */
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