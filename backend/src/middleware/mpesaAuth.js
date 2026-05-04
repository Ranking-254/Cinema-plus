const axios = require('axios');

const generateToken = async (req, res, next) => {
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const consumer = process.env.MPESA_CONSUMER_KEY;
    
    // Authorization header requires Base64 of "key:secret"
    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        req.token = response.data.access_token;
        next();
    } catch (err) {
        console.error("M-Pesa Token Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to generate M-Pesa token" });
    }
};

module.exports = { generateToken };