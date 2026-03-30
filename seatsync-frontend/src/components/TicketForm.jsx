import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { User, Mail, Phone, UploadCloud, Info, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function TicketForm({ onSubmit, selectedTickets = {}, tiers = [], movieTitle, price, loading }) {
  const { user } = useUser();
  const [formData, setFormData] = useState({ 
    fullName: user?.fullName || '', 
    email: user?.primaryEmailAddress?.emailAddress || '', 
    phone: '' 
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.imageUrl || null);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // NEW STATE
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || ''
      }));
      setAvatarPreview(user.imageUrl);
    }
  }, [user]);

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: "Image must be under 1MB" }));
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, avatar: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!avatarPreview) newErrors.avatar = "Profile photo is required.";
    
    // NEW VALIDATION: Ensure checkbox is ticked
    if (!acceptedTerms) newErrors.terms = "You must agree to the terms to proceed.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      // Pass the acceptance status to your parent component/backend
      onSubmit({ ...formData, avatarPreview, acceptedTerms });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6 bg-[#1a1b26] p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl">
      
      {/* 1. SECURE BOOKING HEADER */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-white font-black text-xl leading-tight">{movieTitle}</h3>
            <p className="text-neutral-500 text-xs mt-1 flex items-center gap-1">
              <ShieldCheck size={14} className="text-green-500" /> Secure Checkout
            </p>
          </div>
          <div className="text-right">
             <p className="text-orange-500 font-bold text-xl">KES {price?.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
          {tiers?.map(tier => {
            const qty = selectedTickets[tier.id];
            if (!qty) return null;
            return (
              <span key={tier.id} className="bg-white/5 text-neutral-300 text-[10px] px-3 py-1 rounded-full border border-white/10 font-bold">
                {qty}x {tier.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. PHOTO UPLOAD */}
      <div className="flex flex-col items-center gap-4 py-2">
        <div 
          onClick={() => fileInputRef.current.click()}
          className="relative group w-24 h-24 rounded-full border-2 border-dashed border-neutral-700 hover:border-orange-500 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
        >
          <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" accept="image/*" />
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <UploadCloud className="text-neutral-600 group-hover:text-orange-500 transition-colors" size={32} />
          )}
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-bold">Attendee Photo</p>
          <p className="text-neutral-500 text-[10px]">Used for ticket verification</p>
          {errors.avatar && <p className="text-red-500 text-[10px] mt-1">{errors.avatar}</p>}
        </div>
      </div>

      {/* 3. INPUT FIELDS */}
      <div className="space-y-4 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-neutral-400 text-xs font-bold uppercase ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-orange-500 outline-none transition"
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-[10px]">{errors.fullName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400 text-xs font-bold uppercase ml-1">Phone Number*</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-orange-500 outline-none transition"
                placeholder="+254700000000..."
              />
            </div>
            {errors.phone && <p className="text-red-500 text-[10px]">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-neutral-400 text-xs font-bold uppercase ml-1">Email Address*</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-orange-500 outline-none transition"
              placeholder="name@email.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
        </div>
      </div>

      {/* UPDATED: TERMS OF SERVICE BOX WITH CHECKBOX */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl text-left transition-all ${errors.terms ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5 border border-transparent'}`}>
        <div className="pt-0.5">
          <input 
            type="checkbox" 
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (errors.terms) setErrors(prev => ({ ...prev, terms: null }));
            }}
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 transition cursor-pointer"
          />
        </div>
        <label htmlFor="terms" className="cursor-pointer select-none group">
          <p className="text-[11px] text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
            By checking this box, you agree to receive your digital ticket via email. Tickets are <span className="text-orange-400 font-bold">non-refundable</span> once generated. Ensure your photo is clear for event entry.
          </p>
          {errors.terms && (
            <div className="flex items-center gap-1 mt-1.5 text-red-500 font-bold text-[9px] uppercase tracking-wider">
              <AlertCircle size={10} /> {errors.terms}
            </div>
          )}
        </label>
      </div>

      {/* 4. PAYMENT BUTTON */}
      <button 
        type="submit" 
        disabled={loading} 
        className={`
          w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-[0.98]
          ${loading 
            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' 
            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'}
        `}
      >
        {loading ? "PROCESSING..." : `PAY KES ${price?.toLocaleString()}`}
      </button>
    </form>
  );
}