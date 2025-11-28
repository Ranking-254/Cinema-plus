require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http'); // <--- 1. Import HTTP
const { Server } = require('socket.io'); // <--- 2. Import Socket.io
const app = require('./app');
const cleanupService = require('./services/cleanup.service');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 3. Create HTTP Server explicitly
const server = http.createServer(app);

// 4. Attach Socket.io to the server
const io = new Server(server, {
    cors: {
       origin: [
            "http://localhost:5173",                  // Your local machine
            "https://cinema-plus-black.vercel.app",   // Your Vercel App (Check exact URL!)
            "https://cinema-plus-git-main-ranking-254s-projects.vercel.app" // (Optional: Vercel preview URLs)
        ],
        methods: ["GET", "POST"]
        
    }
});

// 5. Global Socket Logic
io.on('connection', (socket) => {
    console.log('⚡ New Client Connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// 6. Make "io" accessible everywhere
// We attach 'io' to the 'app' object so Controllers can use it!
app.set('io', io); 

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        
        setInterval(() => {
            cleanupService.releaseExpiredHolds();
        }, 60000); 

        // 7. LISTEN with 'server', not 'app'
        server.listen(PORT, () => {
            console.log(`🚀 Server + Sockets running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Database Connection Error:', err);
        process.exit(1);
    });