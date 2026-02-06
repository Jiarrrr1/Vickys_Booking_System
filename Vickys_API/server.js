const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Make sure you have this line
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

require('./config/database_config')
require('dotenv').config();

// Routes
const ReservationRoutes = require('./routes/reservationRoutes')
const FeedbackRoutes = require('./routes/feedbackRoutes')

// Middleware

// CORS Configuration - UPDATED
app.use(cors({
  origin: true, // Add all your frontend ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests explicitly
// app.options('*', cors()); // Enable preflight for all routes

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1', ReservationRoutes)
app.use('/api/v1', FeedbackRoutes)


// Test route
app.get('/api/v1', (req, res) => {
    res.send('Server is Running!');
}); 

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString() 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// Start server
const PORT = process.env.PORT ;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
