// src/services/bookingService.js
import { reactive, computed } from 'vue'
import axios from 'axios'

// Use absolute URL temporarily to test
const API_BASE_URL = 'http://localhost:3001/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const state = reactive({
  bookings: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  roomFilter: ''
})

// Helper to transform backend data to frontend format
const transformBooking = (backendBooking) => ({
  id: backendBooking.reservationId || backendBooking._id,
  guest: backendBooking.fullName,
  room: backendBooking.roomName,
  guests: backendBooking.guestQuantity,
  checkIn: backendBooking.checkIn,
  checkOut: backendBooking.checkOut,
  status: backendBooking.status || 'Pending',
  bookedOn: backendBooking.createdAt,
  // Map both fields correctly
  request: backendBooking.request || '', // Guest special request
  notes: backendBooking.notes || '',     // Admin notes
  paymentMethod: backendBooking.paymentMethod,
  totalAmount: backendBooking.totalAmount,
  phoneNumber: backendBooking.phoneNumber,
  email: backendBooking.email,
  referenceNumber: backendBooking.referenceNumber,
  downpayment: backendBooking.downpayment,
  remainingBalance: backendBooking.remainingBalance,
  totalNights: backendBooking.totalNights
})

// Computed properties
const totalBookings = computed(() => state.bookings.length)

const totalGuests = computed(() => {
  return state.bookings.reduce((sum, booking) => sum + (booking.guests || 0), 0)
})

const upcomingBookings = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  return state.bookings.filter(booking => {
    const checkIn = new Date(booking.checkIn)
    return checkIn >= today && checkIn <= sevenDaysLater
  })
})

const filteredBookings = computed(() => {
  let filtered = [...state.bookings]

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase()
    filtered = filtered.filter(booking => 
      booking.guest?.toLowerCase().includes(query) ||
      booking.room?.toLowerCase().includes(query) ||
      booking.id?.toString().includes(query)
    )
  }

  if (state.roomFilter) {
    filtered = filtered.filter(booking => booking.room === state.roomFilter)
  }

  return filtered.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
})

const roomTypes = computed(() => {
  const rooms = state.bookings.map(b => b.room)
  return [...new Set(rooms)].sort()
})

const bookingsService = {
  get bookings() { return state.bookings },
  get isLoading() { return state.isLoading },
  get error() { return state.error },
  get searchQuery() { return state.searchQuery },
  get roomFilter() { return state.roomFilter },
  get totalBookings() { return totalBookings.value },
  get totalGuests() { return totalGuests.value },
  get upcomingBookings() { return upcomingBookings.value },
  get filteredBookings() { return filteredBookings.value },
  get roomTypes() { return roomTypes.value },

async fetchBookings() {
  state.isLoading = true
  state.error = null

  try {
    const response = await apiClient.get('/getAllReservations')
    console.log('Raw API response:', response) // Debug log
    console.log('Response data:', response.data) // Debug log
    
    // Handle different response structures
    let bookingsData = []
    
    if (response.data && response.data.data) {
      // If response is { success: true, data: [...] }
      bookingsData = response.data.data
    } else if (Array.isArray(response.data)) {
      // If response is directly an array
      bookingsData = response.data
    } else if (response.data && Array.isArray(response.data.reservations)) {
      // If response is { reservations: [...] }
      bookingsData = response.data.reservations
    }
    
    console.log('Bookings data extracted:', bookingsData)
    
    state.bookings = Array.isArray(bookingsData) 
      ? bookingsData.map(transformBooking)
      : []
    
    console.log('✅ Bookings loaded:', state.bookings.length)
    console.log('First booking sample:', state.bookings[0])
    
    return true
  } catch (error) {
    console.error('❌ Fetch bookings error:', error)
    console.error('Error response:', error.response?.data)
    state.error = error.response?.data?.message || 'Failed to fetch bookings'
    return false
  } finally {
    state.isLoading = false
  }
},

  async getBooking(id) {
    try {
      // ✅ Use the correct endpoint
      const response = await apiClient.get(`/getReservation/${id}`)
      return transformBooking(response.data.data || response.data)
    } catch (error) {
      console.error('Get booking error:', error)
      throw error
    }
  },

  async updateBookingStatus(id, status) {
    try {
      // ✅ Use the correct endpoint
      const response = await apiClient.patch(`/updateStatus/${id}`, { status })
      
      const booking = state.bookings.find(b => b.id === id)
      if (booking) {
        booking.status = status
      }
      
      console.log(`✅ Booking #${id} status updated to: ${status}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Update status error:', error)
      return { success: false, error: error.message }
    }
  },

  // In your bookingService.js, add this method:

async updateBookingNotes(id, notes) {
  try {
    console.log(`Saving notes for booking #${id}:`, notes);
    
    // Send as JSON object with notes property
    const response = await apiClient.patch(`/updateNotes/${id}`, { notes });
    
    console.log('Notes update response:', response.data);
    
    // Update local state
    const booking = state.bookings.find(b => b.id === id);
    if (booking) {
      booking.notes = notes; // Save to both fields
      booking.request = notes; // In case your backend uses 'request' field
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Update notes error:', error);
    console.error('Error details:', error.response?.data);
    return { success: false, error: error.message };
  }
}
,

  setSearchQuery(query) {
    state.searchQuery = query
  },

  setRoomFilter(room) {
    state.roomFilter = room
  },

  clearFilters() {
    state.searchQuery = ''
    state.roomFilter = ''
  },

  reset() {
    state.bookings = []
    state.isLoading = false
    state.error = null
    state.searchQuery = ''
    state.roomFilter = ''
  }
}

export default bookingsService