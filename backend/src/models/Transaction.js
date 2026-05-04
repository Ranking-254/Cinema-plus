const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    // 1. CLERK USER IDENTIFICATION
    userId: { 
        type: String, 
        required: true,
        index: true // Makes lookups for "My Billing History" lightning fast
    },
    customerName: { type: String },
    customerEmail: { type: String },

    // 2. TRANSACTION DETAILS
    phoneNumber: { 
        type: String, 
        required: true 
    }, // Format: 2547XXXXXXXX
    amount: { 
        type: Number, 
        required: true 
    },
    
    // 3. M-PESA HANDSHAKE (Crucial for linking Callback to User)
    checkoutRequestID: { 
        type: String, 
        required: true, 
        unique: true 
    },
    merchantRequestID: { type: String },
    
    // 4. STATUS TRACKING
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    
    // 5. POST-PAYMENT DATA (Filled by Safaricom Callback)
    paymentReference: { type: String }, // M-Pesa Receipt Number (e.g., RHK45...)
    resultDesc: { type: String },      // Description like "The service was accepted" or "Request cancelled"
    rawCallbackData: { type: Object }  // Optional: keeps the whole JSON for audit trails
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);