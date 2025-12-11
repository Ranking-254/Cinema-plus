import { useState, useRef, useEffect } from 'react';

// Updated props to include movie details
export default function TicketForm({ onSubmit, selectedSeat, movieTitle, price }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', github: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

 

  const validateFile = (file) => {
    if (!file) return "Please upload an image.";
    if (file.size > 500 * 1024) return "File too large. Please upload a photo under 500KB.";
    if (!['image/jpeg', 'image/png'].includes(file.type)) return "Invalid format. Use JPG or PNG.";
    return null;
  };

  const handleFileChange = (file) => {
    setErrors(prev => ({ ...prev, avatar: null }));
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, avatar: error }));
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address.";

    if (!formData.github.trim()) newErrors.github = "GitHub username is required.";
    
    if (!avatar) newErrors.avatar = "Please upload an avatar.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onSubmit({ ...formData, avatarPreview });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6 pb-4">
      
      {/* --- NEW SECTION: Booking Summary --- */}
      {selectedSeat && (
        <div className="bg-orange-500/10 border border-orange-500/50 p-4 rounded-lg text-center animate-fade-in">
           <h3 className="text-white font-bold text-xl mb-1">{movieTitle}</h3>
           <div className="flex items-center justify-center gap-4 text-orange-400 font-mono text-sm">
             <span className="bg-orange-500/20 px-2 py-1 rounded">SEAT: {selectedSeat}</span>
             <span>•</span>
             <span>TOTAL: KES{price}</span>
           </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-3">
        <label className="block text-neutral-300 mb-2">Upload Avatar</label>
        <div 
          className={`
            group relative flex flex-col items-center justify-center 
            p-4 h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-neutral-900
            bg-white/5 backdrop-blur-sm
            ${errors.avatar ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-500 hover:bg-neutral-700/50'}
          `}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current.click()}
          tabIndex="0"
          role="button"
          aria-label="Upload avatar image"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileChange(e.target.files[0])} 
            className="hidden" 
            accept="image/png, image/jpeg" 
          />
          
          <div className="p-2 bg-neutral-700 rounded-lg border border-neutral-500 mb-2 shadow-lg">
             {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-8 h-8 rounded object-cover" />
             ) : (
                <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
             )}
          </div>
          <p className="text-neutral-300">Drag and drop or click to upload</p>
        </div>
        
        <p className="text-neutral-500 text-xs flex items-center gap-1">
          <span className="w-4 h-4 inline-flex items-center justify-center bg-neutral-700 rounded-full text-[10px] text-neutral-300">i</span>
          Upload your photo (JPG or PNG, max size: 500KB).
        </p>
        
        {errors.avatar && (
          <p className="text-orange-500 text-sm mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errors.avatar}
          </p>
        )}
      </div>

      {/* Input Fields */}
      <div className="space-y-5">
        
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-neutral-300 mb-2">Full Name</label>
          <input 
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full bg-white/10 border rounded-lg p-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-orange-500 transition
              ${errors.fullName ? 'border-orange-500' : 'border-neutral-500'}`}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && <p className="text-orange-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-neutral-300 mb-2">Email Address</label>
          <input 
            type="email"
            id="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full bg-white/10 border rounded-lg p-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-orange-500 transition
              ${errors.email ? 'border-orange-500' : 'border-neutral-500'}`}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-orange-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* GitHub */}
        <div>
          <label htmlFor="github" className="block text-neutral-300 mb-2">GitHub Username</label>
          <input 
            type="text"
            id="github"
            name="github"
            placeholder="@yourusername"
            value={formData.github}
            onChange={handleChange}
            className={`w-full bg-white/10 border rounded-lg p-3 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-orange-500 transition
              ${errors.github ? 'border-orange-500' : 'border-neutral-500'}`}
            aria-invalid={!!errors.github}
          />
          {errors.github && <p className="text-orange-500 text-sm mt-1">{errors.github}</p>}
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-orange-500 text-neutral-900 font-extrabold text-lg py-4 rounded-lg hover:bg-orange-700 transition shadow-[0_4px_0_hsl(7,71%,60%)] hover:shadow-none hover:translate-y-[4px] active:translate-y-[4px]"
      >
        {/* Dynamic Button Text */}
        {selectedSeat ? `Pay & Generate Ticket (KES ${price})` : "Generate My Ticket"}
      </button>
    </form>
  );
}