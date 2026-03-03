// mock-backend-server.js
/**
 * DUMMY BACKEND API SERVER FOR DEBUGGING
 * 
 * This is a simple Express server that mimics your real backend API.
 * Use this for frontend development and testing while your real backend is being built.
 * 
 * TO RUN THIS SERVER:
 * 1. npm install express cors
 * 2. node mock-backend-server.js
 * 3. Server will run on http://localhost:5000
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

// ============================================
// DUMMY DATA
// ============================================

// Mock users for authentication
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',  // In real app, this would be hashed!
    name: 'Admin User',
    email: 'admin@vickysresort.com',
    role: 'Administrator'
  },
  {
    id: 2,
    username: 'staff',
    password: 'staff123',
    name: 'Staff Member',
    email: 'staff@vickysresort.com',
    role: 'Staff'
  }
];

// Mock bookings data
const MOCK_BOOKINGS = [
  { id: 1, guest: 'Maria Santos', room: 'Deluxe Suite', guests: 2, checkIn: '2026-01-20', checkOut: '2026-01-22', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-15' },
  { id: 2, guest: 'Juan Dela Cruz', room: 'Garden View', guests: 4, checkIn: '2026-01-21', checkOut: '2026-01-23', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-13' },
  { id: 3, guest: 'Anna Reyes', room: 'Standard Room', guests: 2, checkIn: '2026-02-19', checkOut: '2026-02-21', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-30' },
  { id: 4, guest: 'Carlos Mendoza', room: 'Family Suite', guests: 5, checkIn: '2026-02-22', checkOut: '2026-02-25', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-10' },
  { id: 5, guest: 'Isabel Garcia', room: 'Poolside Cabin', guests: 3, checkIn: '2026-03-04', checkOut: '2026-03-13', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-28' },
  { id: 6, guest: 'Roberto Aquino', room: 'Mountain View', guests: 2, checkIn: '2026-03-18', checkOut: '2026-03-21', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-05' },
  { id: 7, guest: 'Elena Torres', room: 'Deluxe Suite', guests: 2, checkIn: '2026-03-25', checkOut: '2026-03-28', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-10' },
  { id: 8, guest: 'Miguel Ramos', room: 'Standard Room', guests: 3, checkIn: '2026-03-28', checkOut: '2026-03-30', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-17' },
  { id: 9, guest: 'Sofia Valdez', room: 'Garden View', guests: 2, checkIn: '2026-04-05', checkOut: '2026-04-08', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-14' },
  { id: 10, guest: 'Daniel Cruz', room: 'Family Suite', guests: 6, checkIn: '2026-04-12', checkOut: '2026-04-15', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-16' }
];

// Mock payments data
const MOCK_PAYMENTS = [
  { id: '#1001', guest: 'Maria Santos', room: 'Deluxe Suite', amt: 7000, method: 'GCash', date: 'Jan 18, 2026', status: 'Paid' },
  { id: '#1002', guest: 'Juan Dela Cruz', room: 'Garden View', amt: 8400, method: 'GCash', date: 'Jan 19, 2026', status: 'Paid' },
  { id: '#1003', guest: 'Anna Reyes', room: 'Standard Room', amt: 5000, method: 'GCash', date: 'Jan 17, 2026', status: 'Paid' },
  { id: '#1004', guest: 'Carlos Mendoza', room: 'Family Suite', amt: 16500, method: 'GCash', date: 'Jan 20, 2026', status: 'Paid' },
  { id: '#1005', guest: 'Isabel Garcia', room: 'Poolside Cabin', amt: 11400, method: 'GCash', date: 'Jan 16, 2026', status: 'Paid' },
  { id: '#1006', guest: 'Roberto Aquino', room: 'Mountain View', amt: 9600, method: 'GCash', date: 'Jan 21, 2026', status: 'Paid' },
  { id: '#1007', guest: 'Elena Torres', room: 'Deluxe Suite', amt: 10500, method: 'GCash', date: 'Jan 23, 2026', status: 'Paid' },
  { id: '#1008', guest: 'Miguel Ramos', room: 'Standard Room', amt: 5000, method: 'GCash', date: 'Jan 22, 2026', status: 'Paid' },
  { id: '#1009', guest: 'Sofia Valdez', room: 'Garden View', amt: 12600, method: 'GCash', date: 'Jan 25, 2026', status: 'Paid' },
  { id: '#1010', guest: 'Daniel Cruz', room: 'Family Suite', amt: 16500, method: 'GCash', date: 'Jan 24, 2026', status: 'Paid' }
];

// Helper function to generate JWT-like token (not secure, just for demo)
function generateToken(userId) {
  return `mock-token-${userId}-${Date.now()}`;
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /api/auth/login
 * Login endpoint - returns token and user info
 */
app.post('/api/auth/login', (req, res) => {
  console.log('📥 Login request:', req.body);
  
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  // Find user
  const user = MOCK_USERS.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  // Check password (in real app, use bcrypt.compare)
  if (user.password !== password) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  // Generate token
  const token = generateToken(user.id);

  // Return success response
  res.json({
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

  console.log('✅ Login successful for:', user.username);
});

/**
 * POST /api/auth/logout
 * Logout endpoint
 */
app.post('/api/auth/logout', (req, res) => {
  console.log('📤 Logout request');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
app.get('/api/auth/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // In a real app, you'd verify the token
  // For demo, just return a mock user
  res.json({
    id: 1,
    name: 'Admin User',
    email: 'admin@vickysresort.com',
    role: 'Administrator'
  });
});

// ============================================
// BOOKINGS ENDPOINTS
// ============================================

/**
 * GET /api/bookings
 * Get all bookings
 */
app.get('/api/bookings', (req, res) => {
  console.log('📥 Get all bookings');
  res.json(MOCK_BOOKINGS);
});

/**
 * GET /api/bookings/:id
 * Get single booking by ID
 */
app.get('/api/bookings/:id', (req, res) => {
  const booking = MOCK_BOOKINGS.find(b => b.id === parseInt(req.params.id));
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  res.json(booking);
});

/**
 * POST /api/bookings
 * Create new booking
 */
app.post('/api/bookings', (req, res) => {
  console.log('📥 Create booking:', req.body);
  
  const newBooking = {
    id: MOCK_BOOKINGS.length + 1,
    ...req.body,
    bookedOn: new Date().toISOString().split('T')[0]
  };
  
  MOCK_BOOKINGS.push(newBooking);
  
  res.status(201).json(newBooking);
  console.log('✅ Booking created:', newBooking.id);
});

/**
 * PUT /api/bookings/:id
 * Update booking
 */
app.put('/api/bookings/:id', (req, res) => {
  const index = MOCK_BOOKINGS.findIndex(b => b.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  MOCK_BOOKINGS[index] = {
    ...MOCK_BOOKINGS[index],
    ...req.body
  };
  
  res.json(MOCK_BOOKINGS[index]);
  console.log('✅ Booking updated:', req.params.id);
});

/**
 * DELETE /api/bookings/:id
 * Delete booking
 */
app.delete('/api/bookings/:id', (req, res) => {
  const index = MOCK_BOOKINGS.findIndex(b => b.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  MOCK_BOOKINGS.splice(index, 1);
  
  res.json({ message: 'Booking deleted successfully' });
  console.log('✅ Booking deleted:', req.params.id);
});

// ============================================
// PAYMENTS ENDPOINTS
// ============================================

/**
 * GET /api/payments
 * Get all payments
 */
app.get('/api/payments', (req, res) => {
  console.log('📥 Get all payments');
  res.json(MOCK_PAYMENTS);
});

/**
 * GET /api/payments/:id
 * Get single payment
 */
app.get('/api/payments/:id', (req, res) => {
  const payment = MOCK_PAYMENTS.find(p => p.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  
  res.json(payment);
});

/**
 * POST /api/payments
 * Create new payment
 */
app.post('/api/payments', (req, res) => {
  console.log('📥 Create payment:', req.body);
  
  const newPayment = {
    id: `#${1000 + MOCK_PAYMENTS.length + 1}`,
    ...req.body
  };
  
  MOCK_PAYMENTS.push(newPayment);
  
  res.status(201).json(newPayment);
  console.log('✅ Payment created:', newPayment.id);
});

// ============================================
// REVENUE ENDPOINTS
// ============================================

/**
 * GET /api/revenue/summary
 * Get revenue summary
 */
app.get('/api/revenue/summary', (req, res) => {
  console.log('📥 Get revenue summary');
  
  const totalRevenue = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amt, 0);
  
  res.json({
    totalRevenue,
    thisMonth: 125000,
    thisYear: 1450000,
    totalBookings: MOCK_BOOKINGS.length,
    paidTransactions: MOCK_PAYMENTS.length
  });
});

/**
 * GET /api/revenue/monthly
 * Get monthly revenue
 */
app.get('/api/revenue/monthly', (req, res) => {
  const { year, month } = req.query;
  
  res.json({
    year: parseInt(year) || 2026,
    month: parseInt(month) || 1,
    revenue: 145000,
    bookings: 24,
    averagePerBooking: 6042
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🏨 DUMMY BACKEND API SERVER RUNNING     ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log('🔐 Test Credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('   (or use username: staff, password: staff123)');
  console.log('');
  console.log('📚 Available Endpoints:');
  console.log('   POST   /api/auth/login');
  console.log('   POST   /api/auth/logout');
  console.log('   GET    /api/auth/profile');
  console.log('   GET    /api/bookings');
  console.log('   POST   /api/bookings');
  console.log('   GET    /api/payments');
  console.log('   POST   /api/payments');
  console.log('   GET    /api/revenue/summary');
  console.log('');
  console.log('✅ Ready to accept requests!');
  console.log('');
});