# 🏨 Vicky's Resort - Admin Dashboard

Vue 3 admin dashboard for managing bookings, payments, and revenue at Vicky's Resort.

## 🚀 Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management library
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── assets/
│   │   └── css/
│   │       ├── base.css          # Shared base styles
│   │       └── main.css          # Component styles
│   ├── components/               # Reusable Vue components
│   │   ├── Sidebar.vue          # Navigation sidebar
│   │   ├── Header.vue           # Top header bar
│   │   └── StatCard.vue         # Statistics card
│   ├── data/
│   │   └── reservations.js      # Sample data (for dev)
│   ├── layouts/
│   │   └── DashboardLayout.vue  # Main layout wrapper
│   ├── router/
│   │   └── index.js             # Vue Router configuration
│   ├── services/
│   │   └── api.js               # Axios API configuration
│   ├── stores/
│   │   ├── auth.js              # Authentication store
│   │   ├── bookings.js          # Bookings store
│   │   └── payments.js          # Payments store
│   ├── views/
│   │   ├── LoginView.vue        # Login page
│   │   ├── DashboardView.vue    # Dashboard home
│   │   ├── BookingsView.vue     # Bookings management
│   │   ├── PaymentsView.vue     # Payments tracking
│   │   └── RevenueView.vue      # Revenue analytics
│   ├── App.vue                  # Root component
│   └── main.js                  # App entry point
├── .env.example                  # Environment variables template
├── index.html                    # HTML entry point
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── PINIA_GUIDE.md               # Pinia usage guide
└── README.md                     # This file
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your backend API URL:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run at: `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## 🔐 Authentication

The app includes a login system that integrates with your backend API.

### Login Flow

1. User enters credentials on `/login`
2. App sends POST request to `/api/auth/login`
3. Backend returns JWT token and user data
4. Token is stored in localStorage
5. User is redirected to `/dashboard`

### Required Backend Endpoints

```
POST   /api/auth/login          - Login with credentials
POST   /api/auth/logout         - Logout user
GET    /api/auth/profile        - Get current user
```

### Example Login API Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@vickysresort.com",
    "role": "admin"
  }
}
```

## 📡 API Integration

All API calls are centralized in `src/services/api.js`.

### Available API Methods

#### Authentication
```javascript
import { authAPI } from '@/services/api'

// Login
await authAPI.login({ username, password })

// Get profile
await authAPI.getProfile()

// Logout
await authAPI.logout()
```

#### Bookings
```javascript
import { bookingsAPI } from '@/services/api'

// Get all bookings
await bookingsAPI.getAll()

// Get by ID
await bookingsAPI.getById(id)

// Create booking
await bookingsAPI.create(data)

// Update booking
await bookingsAPI.update(id, data)

// Delete booking
await bookingsAPI.delete(id)
```

#### Payments
```javascript
import { paymentsAPI } from '@/services/api'

// Get all payments
await paymentsAPI.getAll()

// Get by booking ID
await paymentsAPI.getByBooking(bookingId)

// Create payment
await paymentsAPI.create(data)
```

## 🗄️ State Management (Pinia)

For a complete guide on Pinia, see **[PINIA_GUIDE.md](./PINIA_GUIDE.md)**.

### Quick Example

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'

// Initialize stores
const authStore = useAuthStore()
const bookingsStore = useBookingsStore()

// Access state
console.log(authStore.user)
console.log(bookingsStore.bookings)

// Call actions
await bookingsStore.fetchBookings()
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    Welcome {{ authStore.userName }}!
    <p>Total Bookings: {{ bookingsStore.totalBookings }}</p>
  </div>
</template>
```

## 🎨 Styling

Styles are split into two files:

- **base.css** - Reset, design tokens, app shell, sidebar, header
- **main.css** - Component-specific styles (cards, tables, buttons)

### CSS Variables (Design Tokens)

All colors and spacing are defined as CSS variables in `base.css`:

```css
:root {
  --sand: #f5f2ee;
  --forest: #222222;
  --amber: #c97c28;
  --blue: #2563a8;
  /* ... more tokens */
}
```

To change the theme, just update these variables!

## 🔑 Key Features

### ✅ Authentication
- Login/logout
- JWT token management
- Protected routes
- Auto-redirect on unauthorized access

### 📊 Dashboard
- Key metrics overview
- Recent bookings table
- Statistics cards

### 📅 Bookings Management
- View all bookings
- Search and filter
- Create/edit/delete bookings
- Date conflict detection

### 💳 Payments Tracking
- All payment records
- Revenue statistics
- Payment status management

### 💰 Revenue Analytics
- Monthly/yearly reports
- Revenue charts
- Export functionality

## 🚦 Routing

The app uses Vue Router with authentication guards:

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/login` | LoginView | No |
| `/` | DashboardView | Yes |
| `/bookings` | BookingsView | Yes |
| `/payments` | PaymentsView | Yes |
| `/revenue` | RevenueView | Yes |

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

## 🔧 Development Tips

### Hot Module Replacement
Vite provides instant HMR. Save any file and see changes immediately.

### Vue DevTools
Install [Vue DevTools](https://devtools.vuejs.org/) for debugging:
- Inspect components
- View Pinia stores
- Monitor router navigation

### API Development
For frontend development without a backend, use the sample data in `src/data/reservations.js`.

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 is busy, edit `vite.config.js`:
```javascript
server: {
  port: 3002  // Change to any available port
}
```

### API Connection Issues
1. Check `.env` file has correct `VITE_API_URL`
2. Ensure backend is running
3. Check browser console for CORS errors

### Authentication Not Working
1. Verify backend `/api/auth/login` endpoint
2. Check token is being returned
3. Inspect localStorage in DevTools

## 📚 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Axios Documentation](https://axios-http.com/)

## 📝 Backend API Requirements

Your backend should provide these endpoints:

```
Authentication:
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/profile

Bookings:
  GET    /api/bookings
  GET    /api/bookings/:id
  POST   /api/bookings
  PUT    /api/bookings/:id
  DELETE /api/bookings/:id

Payments:
  GET    /api/payments
  GET    /api/payments/:id
  POST   /api/payments

Revenue:
  GET    /api/revenue/summary
  GET    /api/revenue/monthly
  GET    /api/revenue/yearly
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private - Vicky's Resort Management System

---

**Need Help?** Check [PINIA_GUIDE.md](./PINIA_GUIDE.md) for state management help!