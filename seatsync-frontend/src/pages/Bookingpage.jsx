import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/clerk-react'; 
import SeatMap from '../components/SeatMap'; // Path updated to ../
import '../App.css'; // Path updated to ../

const EVENT_ID = '6927492381eed11ec27fe623'; // Your Event ID
const socket = io('http://localhost:5000');

const BookingPage = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser(); 

  // 1. Fetch Seats & Listen for Updates
  useEffect(() => {
    fetchSeats();

    // Listen for single seat updates
    socket.on('seat_updated', (updatedSeat) => {
      setSeats((currentSeats) => 
        currentSeats.map((seat) => 
          seat._id === updatedSeat._id ? updatedSeat : seat
        )
      );
    });

    // ⚡ NEW: Listen for Admin Reset
    socket.on('events_reset', (freshSeats) => {
      toast("Event was reset by Admin!", { icon: '⚠️' });
      setSeats(freshSeats);
    });

    return () => {
      socket.off('seat_updated');
      socket.off('events_reset');
    };
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/seats/event/${EVENT_ID}`);
      setSeats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching seats:", error);
      toast.error("Failed to load map");
      setLoading(false);
    }
  };

  // 2. Logic: Find the seat *I* am currently holding
  const myHeldSeat = seats.find(
    (seat) => seat.status === 'HELD' && seat.userId === user?.id
  );

  // 3. Handle HOLD
  const handleSeatClick = async (seat) => {
    if (!isSignedIn) return toast.error("Please sign in first");
    if (myHeldSeat) return toast.error("You can only hold one seat at a time!");

    try {
      const token = await getToken();
      await axios.post('http://localhost:5000/api/seats/hold', 
        { seatId: seat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Seat Held! You have 10 minutes to pay.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Hold failed");
    }
  };

  // 4. Handle BOOK (Pay)
  const handlePayClick = async () => {
    if (!myHeldSeat) return;

    const toastId = toast.loading("Processing payment...");

    try {
      const token = await getToken();
      await axios.post('http://localhost:5000/api/seats/book', 
        { seatId: myHeldSeat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.dismiss(toastId);
      toast.success("Payment Successful! Ticket Sent to Email.");
      
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Payment Failed. Timer may have expired.");
    }
  };

  // 5. Handle CANCEL (Release)
  const handleCancelClick = async () => {
    if (!myHeldSeat) return;

    try {
      const token = await getToken();
      await axios.post('http://localhost:5000/api/seats/release', 
        { seatId: myHeldSeat._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Seat released.");
    } catch (error) {
      console.error("Release failed", error);
      toast.error("Could not release seat.");
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

      {/* Checkout Bar */}
      {myHeldSeat && (
        <div className="checkout-bar">
          <div>
             <h3>Complete your booking</h3>
             <p>Seat: <strong>{myHeldSeat.row}{myHeldSeat.number}</strong> | Price: <strong>${myHeldSeat.price}</strong></p>
             <small>Time remaining: 10:00</small>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-cancel" 
                onClick={handleCancelClick}
                style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button className="btn-pay" onClick={handlePayClick}>
                Pay Now 💳
              </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingPage;