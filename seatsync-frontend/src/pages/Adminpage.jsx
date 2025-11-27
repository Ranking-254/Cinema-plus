import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // LOGIC: Reset the theater
  const handleReset = async () => {
    // 1. Safety Confirm
    if(!confirm("⚠️ ARE YOU SURE? This will kick everyone out and reset all seats to Green.")) return;
    
    setLoading(true);
    const toastId = toast.loading("Resetting theater...");

    try {
      const token = await getToken();
      
      // 2. Call the Backend
      await axios.post('http://localhost:5000/api/seats/reset', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("THEATER RESET!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Reset failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{textAlign: 'center', paddingTop: '100px'}}>
      <h1>👮‍♂️ Admin Dashboard</h1>
      <p style={{color: '#888'}}>Control the event settings here.</p>
      
      <div style={{marginTop: '60px'}}>
        <button 
          onClick={handleReset} 
          disabled={loading}
          style={{
            backgroundColor: loading ? '#555' : '#ff4444', 
            color: 'white', 
            padding: '20px 40px', 
            fontSize: '1.2rem', 
            border: 'none', 
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 30px rgba(255, 68, 68, 0.3)'
          }}
        >
          {loading ? "Processing..." : "⚠️ RESET ALL SEATS"}
        </button>
      </div>

      <div style={{marginTop: '40px'}}>
         {/* Link to go back home */}
         <Link to="/" style={{color: '#7aa2f7', textDecoration: 'none'}}>← Back to Booking</Link>
      </div>
    </div>
  );
};

export default AdminPage;