const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  row: { 
    type: String, // In our tiered system, this is the Tier Name (VIP, Regular)
    required: true, 
    trim: true 
  },
  number: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'HELD', 'SOLD'], 
    default: 'AVAILABLE' 
  },
  userId: { 
    type: String, // Clerk User ID
    required: true,
    index: true 
  },
  // 🚀 Added for Market Readiness
  customerName: {
     type: String 
    },
  customerEmail: { 
    type: String 
  },
  paymentReference: {
     type: String
     }, // For M-Pesa Receipt Numbers



   // 🚀 LEGAL & COMPLIANCE: Agreement to Terms
  tosAccepted: {
    type: Boolean,
    default: false,
    required: [true, 'Terms must be accepted to issue a ticket']
  },
  tosVersion: {
    type: String,
    default: '1.0' // Update this string if you change your refund policy
  },
  acceptedAt: {
    type: Date,
    default: Date.now
  },

  isUsed: {
     type: Boolean,
      default: false
     }, // 🚀 NEW: Track if they entered the venue
  scannedAt: {
     type: Date
     }, // 🚀 NEW: For security audits

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Unique constraint to prevent double-booking the same "seat number" in a tier
seatSchema.index({ event: 1, row: 1, number: 1 }, { unique: true });
// Performance index to eliminate lag when loading event pages
seatSchema.index({ event: 1 }); 

module.exports = mongoose.models.Seat || mongoose.model('Seat', seatSchema);