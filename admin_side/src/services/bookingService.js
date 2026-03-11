// src/services/bookingService.js
import { reactive, computed } from 'vue'
import { adminClient } from './api'

const API_BASE_URL = 'http://localhost:3001/api/v1'

const apiClient = adminClient

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
  guestQuantity: backendBooking.guestQuantity,
  roomId: backendBooking.roomId, // ✅ CRITICAL: Preserve roomId
    roomName: backendBooking.roomName, // ✅ CRITICAL: Preserve roomName  guests: backendBooking.guestQuantity,
  bookingDate: backendBooking.bookingDate || backendBooking.checkIn || null,
  reservationType: backendBooking.reservationType,
  status: backendBooking.status || 'Confirmed',
  bookedOn: backendBooking.createdAt,
  request: backendBooking.request || '',
  notes: backendBooking.notes || '',
  paymentType: backendBooking.paymentType, 
  paymentMethod: backendBooking.paymentMethod,
  totalAmount: backendBooking.totalAmount,
  phoneNumber: backendBooking.phoneNumber,
  email: backendBooking.email,
  referenceNumber: backendBooking.referenceNumber,
  downpayment: backendBooking.downpayment,
  remainingBalance: backendBooking.remainingBalance,
  roomQuantity: backendBooking.roomQuantity
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
      console.log('Raw API response:', response)
      console.log('Response data:', response.data)
      
      // Handle different response structures
      let bookingsData = []
      
      if (response.data && response.data.data) {
        bookingsData = response.data.data
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data
      } else if (response.data && Array.isArray(response.data.reservations)) {
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
      const response = await apiClient.get(`/getReservation/${id}`)
      return transformBooking(response.data.data || response.data)
    } catch (error) {
      console.error('Get booking error:', error)
      throw error
    }
  },

  // ✅ FIXED: Admin reservation creation with proper balance calculation
// In bookingService.js - update createReservationWithPayment method

async createReservationWithPayment(reservationData) {
  try {
    console.log('📦 Step 1: Creating reservation with data:', reservationData)
    
    // ✅ Ensure paymentMethod is capitalized correctly
    const transformedData = {
      ...reservationData,
      paymentMethod: reservationData.paymentMethod === 'Gcash' || reservationData.paymentMethod === 'GCash' 
        ? 'GCash' 
        : 'Cash',
      // Make sure roomQuantity is included
      roomQuantity: reservationData.roomQuantity || 1
    }
    
    console.log('🔄 Sending to backend:', transformedData)
    
    // Step 1: Create reservation
    const reservationResponse = await adminClient.post('/createReservation', transformedData)
    
    console.log('✅ Step 1 complete - Reservation response:', reservationResponse.data)
    
    if (!reservationResponse.data.success) {
      throw new Error(reservationResponse.data.message || 'Failed to create reservation')
    }
    
    const reservationId = reservationResponse.data.reservationId || reservationResponse.data.data?.reservationId
    console.log('📋 Reservation ID created:', reservationId)
    
    // Step 2: Create payment ONLY for GCash payments
    let paymentResponse = null
    
    if (reservationData.paymentMethod === 'Gcash' || reservationData.paymentMethod === 'GCash') {
      console.log('💰 GCash payment detected - creating payment record')
      
      const isDownpayment = reservationData.paymentType === 'Downpayment'
      const totalAmount = reservationData.totalAmount
      const amount = isDownpayment ? reservationData.downpayment : totalAmount
      const balance = isDownpayment ? reservationData.remainingBalance : 0
      
      console.log('💰 Payment calculation:')
      console.log(`   Total: ₱${totalAmount}`)
      console.log(`   Payment Type: ${isDownpayment ? 'Downpayment' : 'Full Payment'}`)
      console.log(`   Amount Paying: ₱${amount}`)
      console.log(`   Balance After Payment: ₱${balance}`)
      
      // Include quantity in room name for display
      const roomDisplay = reservationData.roomQuantity > 1 
        ? `${reservationData.roomName} x${reservationData.roomQuantity}`
        : reservationData.roomName
      
      const paymentPayload = {
        guestName: reservationData.fullName,
        email: reservationData.email,
        phoneNumber: reservationData.phoneNumber,
        roomName: roomDisplay,
        amount: amount,
        balance: balance,
        paymentMethod: 'GCash',
        referenceNumber: reservationData.referenceNumber || reservationData.rfrncNumber || '',
        paymentType: isDownpayment ? 'Downpayment' : 'Full Payment',
        status: 'Paid',
        notes: reservationData.request || reservationData.notes || ''
      }
      
      console.log('💰 Sending payment payload:', paymentPayload)
      
      paymentResponse = await adminClient.post(`/admin/createPayment/${reservationId}`, paymentPayload)
      console.log('✅ Step 2 complete - Payment response:', paymentResponse.data)
    } else {
      console.log('💵 Cash payment detected - no payment record created')
    }
    
    return {
      success: true,
      reservation: reservationResponse.data.data,
      payment: paymentResponse?.data?.data || null,
      reservationId: reservationId,
      paymentMethod: reservationData.paymentMethod,
      paymentType: reservationData.paymentType
    }
    
  } catch (error) {
    console.error('❌ Error in createReservationWithPayment:')
    console.error('Error message:', error.message)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    throw error
  }
},

  async updateBookingStatus(id, status) {
    try {
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

  async updateBookingNotes(id, notes) {
    try {
      console.log(`Saving notes for booking #${id}:`, notes);
      
      const response = await apiClient.patch(`/updateNotes/${id}`, { notes });
      
      console.log('Notes update response:', response.data);
      
      const booking = state.bookings.find(b => b.id === id);
      if (booking) {
        booking.notes = notes;
        booking.request = notes;
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update notes error:', error);
      console.error('Error details:', error.response?.data);
      return { success: false, error: error.message };
    }
  },

  async deleteBooking(id) {
    try {
        console.log(`🗑️ Soft deleting booking #${id}...`);
        
        const response = await adminClient.delete(`/admin/deleteBooking/${id}`);
        
        console.log('Delete response:', response.data);
        
        if (response.data && response.data.success) {
            state.bookings = state.bookings.filter(b => b.id !== id);
            return { success: true, message: response.data.message };
        }
        return { success: false, error: response.data?.message };
    } catch (error) {
        console.error('❌ Delete booking error:', error);
        return { 
            success: false, 
            error: error.response?.data?.message || error.message 
        };
    }
  },

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