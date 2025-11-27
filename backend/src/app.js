const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// IMPORT ROUTES
const seatRoutes = require('./routes/seat.route'); //importing the seat routes
const eventRoutes = require('./routes/event.route');//importing the event routes

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// USE ROUTES
app.use('/api/seats', seatRoutes); //mounting the seat routes/midddleware
app.use('/api/events', eventRoutes)//mounting the event routes/midddleware

app.get('/', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'SeatSync API is running 🚀',
        timestamp: new Date()
    });
});

module.exports = app;