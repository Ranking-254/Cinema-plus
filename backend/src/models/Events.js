const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  organizer: { 
    type: String 
  },

  thumbnail: { 
    type: String, 
    required: true // URL for the event poster
  },
  category: { 
    type: String, 
    enum: ['Movie', 'Concert', 'Theater', 'Sports'], 
    default: 'Movie' 
  },
  location: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  // We can set a base price for seats if they aren't individually priced
  basePrice: { 
    type: Number, 
    default: 0 
  },

  category: { 
  type: String, 
  default: 'Movie' 
},


 tiers: [
    { 
      id: { type: String, required: true }, 
      name: { type: String, required: true }, 
      price: { type: Number, required: true }, 
      description: String, 
      type: { 
        type: String, 
        enum: ['VIP', 'VVIP', 'REGULAR', 'EARLY', 'GROUP', 'COUPLE'], 
        default: 'REGULAR' 
      }, 
      isSoldOut: { type: Boolean, default: false } 
    }
  ],
  maxCapacity: { 
    type: Number, 
    required: true, 
    default: 100 // Your fallback if not specified
  },
  isSoldOut: { 
    type: Boolean,
     default: false
   },

   organizerClerkId: { 
    type: String,
     },
     organizerEmail: {
       type: String
       },
       organizerIdentifier: {
         type: String 
        },
     payoutStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID'], 
    default: 'PENDING' 
  },
  paidAt: { type: Date },

  status: { 
  type: String, 
  enum: ['ON-SALE', 'CANCELLED', 'COMPLETED'], 
  default: 'ON-SALE' 
},
cancellationReason: { type: String },
cancelledAt: { type: Date }
  
}, { timestamps: true });

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);