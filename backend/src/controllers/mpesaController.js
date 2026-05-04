const axios = require('axios');
const Transaction = require('../models/Transaction');

const initiateSTKPush = async (req, res) => {
    try {
        const { phone, amount, userId, customerName, customerEmail } = req.body;

        // Validation check
        if (!phone || !amount || !userId) {
            return res.status(400).json({ message: "Phone, Amount, and UserID are required" });
        }

        // 1. Format: 2547XXXXXXXX
        const formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;

        // 2. Generate Timestamp (YYYYMMDDHHmmss) - More robust version
        const date = new Date();
        const timestamp = 
            date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        // 3. Generate Password
        const password = Buffer.from(
            process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
        ).toString('base64');

        // 4. Hit Daraja
        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: formattedPhone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: formattedPhone,
                CallBackURL: process.env.MPESA_CALLBACK_URL,
                AccountReference: "Cinemaplus SaaS",
                TransactionDesc: "Subscription Payment"
            },
            {
                headers: { Authorization: `Bearer ${req.token}` }
            }
        );

        // 5. Save to DB only if Safaricom accepted the request
        if (response.data.ResponseCode === "0") {
            const newTransaction = new Transaction({
                userId,
                customerName,
                customerEmail,
                phoneNumber: formattedPhone,
                amount,
                checkoutRequestID: response.data.CheckoutRequestID,
                merchantRequestID: response.data.MerchantRequestID,
                status: 'pending'
            });

            await newTransaction.save();
            return res.status(200).json(response.data);
        } else {
            return res.status(400).json(response.data);
        }

    } catch (error) {
        console.error("STK Push Error:", error.response?.data || error.message);
        res.status(500).json({ 
            message: "M-Pesa initiation failed", 
            error: error.response?.data?.errorMessage || error.message 
        });
    }
};
const handleCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const result = Body.stkCallback;
        const checkoutRequestID = result.CheckoutRequestID;
        const resultCode = result.ResultCode;
        const resultDesc = result.ResultDesc;

        const transaction = await Transaction.findOne({ checkoutRequestID });

        if (!transaction) {
            console.error("Transaction not found:", checkoutRequestID);
            return res.status(404).send("Transaction not found");
        }

        if (resultCode === 0) {
            // SUCCESS: We overwrite ANY previous status (pending, failed, or expired)
            const mpesaReceipt = result.CallbackMetadata.Item.find(
                (item) => item.Name === "MpesaReceiptNumber"
            ).Value;

            transaction.status = "success";
            transaction.paymentReference = mpesaReceipt;
            transaction.resultDesc = "Payment successful (Late Callback Handled)";
            
            console.log(`✅ SUCCESS: Transaction ${checkoutRequestID} updated to success.`);
            
            // 🚀 Here you would trigger your ticket generation / seat booking logic
            // Example: await finalizeBooking(transaction.userId, transaction.eventId);

        } else {
            // FAILURE: Only update to failed if it wasn't already marked as success
            if (transaction.status !== 'success') {
                transaction.status = "failed";
                transaction.resultDesc = resultDesc;
                console.log(`❌ FAILED: Transaction ${checkoutRequestID} set to failed.`);
            }
        }

        await transaction.save();
        res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// Add this to mpesaController.js
const checkStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;
        const transaction = await Transaction.findOne({ checkoutRequestID });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // --- BACKEND TIMEOUT LOGIC ---
        const now = new Date();
        const createdTime = new Date(transaction.createdAt);
        const diffInMinutes = (now - createdTime) / (1000 * 60);

        if (transaction.status === 'pending' && diffInMinutes > 3) {
            transaction.status = 'expired';
            transaction.resultDesc = "Request timed out on backend";
            await transaction.save();
            console.log(`⏲️ Transaction ${checkoutRequestID} marked as expired.`);
        }

        res.status(200).json({ 
            status: transaction.status,
            mpesaReceipt: transaction.paymentReference 
        });
    } catch (error) {
        res.status(500).json({ message: "Error checking status" });
    }
};
// Remember to add to exports!

// Update your module.exports
module.exports = { initiateSTKPush, handleCallback, checkStatus };