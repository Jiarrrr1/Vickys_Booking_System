const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('./config/database_config')
require('dotenv').config();
const nodemailer = require('nodemailer');

const emailSender = require('./utils/emailSender');
const app = express();

// // test-email-config.js
// async function testEmailConfig() {
//     console.log('📧 Testing Email Configuration');
//     console.log('================================');
//     console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
//     console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
//     console.log('EMAIL_USER:', process.env.EMAIL_USER);
//     console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Not set');
//     console.log('================================\n');

//     // Create transporter with simpler config
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         },
//         tls: {
//             rejectUnauthorized: false
//         }
//     });

//     try {
//         console.log('🔍 Testing connection to Gmail SMTP...');
//         await transporter.verify();
//         console.log('✅ SMTP Connection Successful!');
        
//         // Try sending a test email
//         console.log('\n📤 Attempting to send test email...');
//         const info = await transporter.sendMail({
//             from: `"Test" <${process.env.EMAIL_USER}>`,
//             to: process.env.EMAIL_USER,
//             subject: 'Test Email from Vicky\'s Resort',
//             text: 'If you receive this, email is working!',
//             html: '<h1>Email Working!</h1><p>Your email configuration is correct.</p>'
//         });
        
//         console.log('✅ Test email sent!');
//         console.log('   Message ID:', info.messageId);
//         console.log('   Check your inbox (might be in spam)');
        
//     } catch (error) {
//         console.error('❌ Email Test Failed:');
//         console.error('   Error:', error.message);
        
//         if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
//             console.log('\n💡 Connection Issue:');
//             console.log('   1. Check your internet connection');
//             console.log('   2. Your firewall/antivirus might be blocking port 587');
//             console.log('   3. Try using a different network');
//             console.log('   4. Try using port 465 with secure: true');
//         } else if (error.code === 'EAUTH') {
//             console.log('\n💡 Authentication Issue:');
//             console.log('   1. Make sure you\'re using an App Password (16 chars)');
//             console.log('   2. The password should have NO spaces');
//             console.log('   3. Your password is:', process.env.EMAIL_PASS);
//             console.log('   4. Length:', process.env.EMAIL_PASS.length);
//         }
//     }
// }

// testEmailConfig();

// Routes
const ReservationRoutes = require('./routes/reservationRoutes')
const FeedbackRoutes = require('./routes/feedbackRoutes')
const AdminRoutes = require('./routes/adminRoutes')
const PaymentRoutes = require('./routes/paymentRoutes')
const DeletedItemsRoutes = require('./routes/deletedItemRoutes');
const { verifyConnection } = require('./utils/emailSender');



// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    emailSender.verifyConnection(); 
});