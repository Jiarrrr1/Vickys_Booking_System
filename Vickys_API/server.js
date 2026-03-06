const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

require('./config/database_config')
require('dotenv').config();

// Routes
const ReservationRoutes = require('./routes/reservationRoutes')
const FeedbackRoutes = require('./routes/feedbackRoutes')
const AdminRoutes = require('./routes/adminRoutes')
const PaymentRoutes = require('./routes/paymentRoutes')
const DeletedItemsRoutes = require('./routes/deletedItemRoutes');

// ✅ VERIFY ROUTES ARE LOADED
console.log('📦 Loading routes...');
console.log('   ReservationRoutes:', !!ReservationRoutes);
console.log('   FeedbackRoutes:', !!FeedbackRoutes);
console.log('   AdminRoutes:', !!AdminRoutes);
console.log('   PaymentRoutes:', !!PaymentRoutes);
console.log('   DeletedItemsRoutes:', !!DeletedItemsRoutes);  // Should be true

// Middleware

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MOUNT ROUTES IN CORRECT ORDER
app.use('/api/v1', ReservationRoutes);
app.use('/api/v1', FeedbackRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/admin', PaymentRoutes);

// In server.js - keep only this line for deleted items
app.use('/api/v1/admin/deleted', DeletedItemsRoutes);

console.log('✅ Routes mounted:');
console.log('   /api/v1 - ReservationRoutes');
console.log('   /api/v1 - FeedbackRoutes');
console.log('   /api/v1/admin - AdminRoutes');
console.log('   /api/v1/admin - PaymentRoutes');
console.log('   /api/v1/admin/deleted - DeletedItemsRoutes');

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
    console.log(`🗑️  Trash endpoint: http://localhost:${PORT}/api/v1/admin/deleted`);
});