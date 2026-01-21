import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit3, Save, X, RotateCcw, Upload, User, List, Settings2, Users, BarChart3, ShieldCheck, AlertTriangle } from 'lucide-react'; 
import { API_URL } from '../config';

const AdminPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const fileInputRef = useRef(null);

  // 🚀 NEW STATE FOR CANCELLATION FEATURE
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelEventId, setCancelEventId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refundData, setRefundData] = useState(null);

  const tierTemplate = { id: '', name: '', price: 0, capacity: 0, color: '#f97316' };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizer: '', 
    organizerIdentifier: '', 
    thumbnail: '',
    category: 'Concert',
    location: '',
    date: '',
    maxCapacity: 100, 
    tiers: [{ ...tierTemplate, id: 'reg-1' }]
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      setEvents(res.data.data);
    } catch (err) {
      toast.error("Failed to load events");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadToast = toast.loading("Uploading image...");
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const token = await getToken();
      const res = await axios.post(`${API_URL}/api/upload`, uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      setFormData({ ...formData, thumbnail: res.data.imageUrl });
      toast.success("Image uploaded!", { id: uploadToast });
    } catch (err) {
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...formData.tiers];
    updatedTiers[index][field] = field === 'name' ? value.toUpperCase() : value;
    setFormData({ ...formData, tiers: updatedTiers });
  };

  const addTierField = () => {
    setFormData({ 
      ...formData, 
      tiers: [...formData.tiers, { ...tierTemplate, id: `tier-${Date.now()}` }] 
    });
  };

  const removeTierField = (index) => {
    const updatedTiers = formData.tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, tiers: updatedTiers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isEditing ? "Updating event..." : "Creating event...");

    try {
      const token = await getToken();
      const basePrice = Math.min(...formData.tiers.map(t => t.price));
      const payload = { ...formData, basePrice };

      if (isEditing) {
        await axios.put(`${API_URL}/api/events/${currentEventId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Event updated!", { id: toastId });
      } else {
        await axios.post(`${API_URL}/api/events`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Event created!", { id: toastId });
      }
      
      resetForm();
      fetchEvents();
    } catch (err) {
      toast.error("Operation failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // 🚀 UPDATED CANCEL LOGIC
  const handleCancelEvent = async () => {
    if (!cancelReason) return toast.error("Please provide a reason");
    setLoading(true);
    const toastId = toast.loading("Processing cancellation...");

    try {
      const token = await getToken();
      const res = await axios.patch(`${API_URL}/api/events/${cancelEventId}/cancel`, 
        { reason: cancelReason }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setRefundData(res.data.refundList);
      toast.success("Event Cancelled", { id: toastId });
      fetchEvents();
    } catch (err) {
      toast.error("Cancellation failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event permanently? This bypasses the refund workflow.")) return;
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEditInit = (event) => {
    setIsEditing(true);
    setCurrentEventId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      organizer: event.organizer || '',
      organizerIdentifier: event.organizerIdentifier || '',
      thumbnail: event.thumbnail,
      category: event.category,
      location: event.location,
      date: new Date(event.date).toISOString().split('T')[0],
      maxCapacity: event.maxCapacity || 100, 
      tiers: event.tiers
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setIsCustomCategory(false);
    setCurrentEventId(null);
    setFormData({
      title: '',
      description: '',
      organizer: '', 
      organizerIdentifier: '',
      thumbnail: '',
      category: 'Concert',
      location: '',
      date: '',
      maxCapacity: 100, 
      tiers: [{ ...tierTemplate, id: 'reg-1' }]
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-orange-500">ADMIN <span className="text-white">DASHBOARD</span></h1>
            <p className="text-neutral-500 uppercase text-xs tracking-widest font-bold">Event Management System</p>
          </div>
          <button onClick={() => resetForm()} className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition">
            <RotateCcw size={20} />
          </button>
        </header>

        {/* --- EVENT FORM --- */}
        <section className="bg-neutral-900/50 border border-white/5 p-8 rounded-3xl mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            {isEditing ? <Edit3 className="text-orange-500" /> : <Plus className="text-green-500" />}
            {isEditing ? "Update Event" : "Create New Event"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Event Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-orange-500 outline-none" placeholder="e.g. Sauti Sol Concert" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Organizer / Host Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16}/>
                   <input required value={formData.organizer} onChange={e => setFormData({...formData, organizer: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl focus:border-orange-500 outline-none" placeholder="e.g. Cinema Plus+ Events" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase flex items-center gap-2">
                  <ShieldCheck size={14} /> Organizer Permission (Clerk ID or Email)
                </label>
                <input 
                  required 
                  value={formData.organizerIdentifier} 
                  onChange={e => setFormData({...formData, organizerIdentifier: e.target.value})} 
                  className="w-full bg-orange-500/5 border border-orange-500/20 p-3 rounded-xl focus:border-orange-500 outline-none font-mono text-sm" 
                  placeholder="Enter Organizer's Clerk ID or Email Address" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Category</label>
                        <button 
                            type="button" 
                            onClick={() => setIsCustomCategory(!isCustomCategory)}
                            className="text-[10px] text-orange-500 font-bold hover:underline flex items-center gap-1"
                        >
                            {isCustomCategory ? <><List size={10}/> Choose from List</> : <><Settings2 size={10}/> Custom Category</>}
                        </button>
                    </div>
                    {isCustomCategory ? (
                        <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-orange-500/50 p-3 rounded-xl focus:border-orange-500 outline-none" placeholder="Type custom category..." />
                    ) : (
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none">
                            {['Movie', 'Concert', 'Theater', 'Sports', 'Conference', 'Workshop'].map(cat => (
                                <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase">Max Venue Capacity</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16}/>
                      <input type="number" required value={formData.maxCapacity} onChange={e => setFormData({...formData, maxCapacity: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl focus:border-orange-500 outline-none" placeholder="e.g. 100" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase">Image URL or Upload</label>
                    <div className="flex gap-2">
                        <input required value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-orange-500" placeholder="Paste image URL..." />
                        <button type="button" onClick={() => fileInputRef.current.click()} className="bg-neutral-800 p-3 rounded-xl hover:bg-neutral-700 border border-white/5"><Upload size={18} /> Upload</button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Location</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none" placeholder="Venue name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase">Event Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Description</label>
              <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none" placeholder="Describe the event experience..." />
            </div>

            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400">Ticket Tiers</h3>
                <button type="button" onClick={addTierField} className="text-xs bg-orange-500 text-black px-3 py-1 rounded-full font-bold hover:bg-orange-400 transition">Add Tier +</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.tiers.map((tier, index) => (
                  <div key={index} className="p-5 bg-white/5 rounded-3xl border border-white/5 relative group">
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Tier Name (e.g. VIP)</label>
                      <input 
                        placeholder="ENTER NAME..." 
                        className="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none uppercase font-black text-orange-500 placeholder:text-neutral-700" 
                        value={tier.name} 
                        onChange={e => handleTierChange(index, 'name', e.target.value)} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Price (KES)</label>
                        <input type="number" placeholder="0" className="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none font-mono" value={tier.price} onChange={e => handleTierChange(index, 'price', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Capacity</label>
                        <input type="number" placeholder="0" className="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none font-mono" value={tier.capacity} onChange={e => handleTierChange(index, 'capacity', Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">Tier Color</label>
                        <input 
                          type="color" 
                          value={tier.color || '#f97316'} 
                          onChange={e => handleTierChange(index, 'color', e.target.value)}
                          className="w-6 h-6 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                        />
                      </div>
                      <button type="button" onClick={() => removeTierField(index)} className="text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-orange-500 py-4 rounded-2xl font-black text-black hover:bg-orange-400 transition-all flex justify-center items-center gap-2">
              {loading ? "Processing..." : isEditing ? <><Save size={20}/> UPDATE EVENT</> : <><Plus size={20}/> CREATE EVENT</>}
            </button>
          </form>
        </section>

        {/* 🚀 REFUND / CANCELLATION MODAL */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1a1b1e] border border-white/10 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertTriangle size={32} />
                <h3 className="text-2xl font-black italic">CANCEL EVENT?</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-6">
                This will invalidate all sold tickets. Affected customers will be flagged for refunds.
              </p>
              
              <textarea 
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-500 mb-6 text-sm"
                placeholder="Reason for cancellation (e.g. Technical issues)..."
                rows="3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />

              {refundData && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <p className="text-[10px] font-bold text-orange-500 uppercase mb-2">Affected Customer Emails:</p>
                  <div className="max-h-24 overflow-y-auto text-[10px] font-mono text-neutral-500 break-all">
                    {refundData.join(', ')}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowCancelModal(false); setRefundData(null); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 font-bold hover:bg-white/10 transition"
                >
                  Close
                </button>
                {!refundData && (
                  <button 
                    onClick={handleCancelEvent}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-red-600 font-black italic hover:bg-red-500 transition"
                  >
                    CONFIRM CANCEL
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- EVENT LIST --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold mb-6 uppercase tracking-widest text-neutral-500">Live Events ({events.length})</h2>
          {events.map(event => (
            <div key={event._id} className={`bg-neutral-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-orange-500/30 transition ${event.status === 'CANCELLED' ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex items-center gap-4 flex-1">
                <img src={event.thumbnail} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{event.title}</h4>
                    {event.status === 'CANCELLED' && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold">CANCELLED</span>}
                    {event.organizer && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-neutral-400">by {event.organizer}</span>}
                  </div>
                  <p className="text-xs text-neutral-500">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/admin/analytics/${event._id}`)} 
                  className="p-3 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition"
                  title="View Analytics"
                >
                  <BarChart3 size={18}/>
                </button>
                <button onClick={() => handleEditInit(event)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition"><Edit3 size={18}/></button>
                
                {/* 🚀 TOGGLE MODAL INSTEAD OF DIRECT DELETE */}
                <button 
                  onClick={() => { setCancelEventId(event._id); setShowCancelModal(true); }} 
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                  title="Cancel & Refund Workflow"
                >
                  <AlertTriangle size={18}/>
                </button>

                <button onClick={() => handleDelete(event._id)} className="p-3 bg-neutral-800 text-neutral-500 rounded-xl hover:bg-red-600 hover:text-white transition" title="Hard Delete (Bypass Workflow)"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;