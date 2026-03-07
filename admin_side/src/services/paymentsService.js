// src/services/paymentsService.js
import { reactive, computed, toRefs } from 'vue'
import { paymentsAPI } from './api'

// ==========================================
// LOCALSTORAGE CACHE
// ==========================================
const CACHE_KEY = 'payments_cache'

// Load from cache on startup
try {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    state.payments = JSON.parse(cached)
    console.log('📦 Loaded', state.payments.length, 'payments from cache')
  }
} catch (e) {
  console.log('No cache found')
}

// Create a reactive state
const state = reactive({
  payments: [],
  isLoading: false,
  error: null,
  searchQuery: ''
})



class PaymentsService {
  constructor() {
    // Expose reactive state
    this.state = state
  }

  // Add this method inside the PaymentsService class
saveToCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state.payments))
    console.log('✅ Payments cached')
  } catch (e) {
    console.error('Failed to save to cache')
  }
}

  // ==========================================
  // API CALLS
  // ==========================================

  async fetchPayments(params = {}) {
    state.isLoading = true
    state.error = null

    try {
      const response = await paymentsAPI.getAll(params)
      
      if (response.data.success) {        
        if (!Array.isArray(response.data.data)) {
          console.error('Payments data is not an array:', response.data.data)
          state.payments = []
          return { success: true, data: [] }
        }
        
        // Transform each payment
        const transformed = response.data.data.map(p => this.transformPayment(p))
        console.log('Transformed payments:', transformed)
        
        // Update reactive state
        state.payments = transformed
        this.saveToCache() // <-- ADD THIS

        console.log('State payments updated:', state.payments.length)
      } else {
        console.error('API returned success: false', response.data.message)
        state.payments = []
      }
      
      return { success: true, data: state.payments }
    } catch (error) {
      state.error = error.response?.data?.message || 'Failed to fetch payments'
      console.error('Fetch payments error:', error)
      return { success: false, error: state.error }
    } finally {
      state.isLoading = false
    }
  }

  // GET /admin/getPayment/:id
  async getPaymentById(id) {
    state.isLoading = true
    state.error = null

    try {
      const response = await paymentsAPI.getById(id)
      
      if (response.data.success) {
        return { success: true, data: this.transformPayment(response.data.data) }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      state.error = error.response?.data?.message || 'Failed to fetch payment'
      return { success: false, error: state.error }
    } finally {
      state.isLoading = false
    }
  }

  // GET /admin/getPaymentsByReservation/:reservationId
  async getPaymentsByBooking(bookingId) {
    try {
      const response = await paymentsAPI.getByBooking(bookingId)
      
      if (response.data.success) {
        return { success: true, data: this.transformPayments(response.data.data || []) }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      console.error('Get payments by booking error:', error)
      return { success: false, error: error.message }
    }
  }

  // POST /admin/createPayment/:id
  async createPayment(paymentData) {
    state.isLoading = true
    state.error = null

    try {
      const reservationId = paymentData.reservationId
      const response = await paymentsAPI.create(reservationId, paymentData)
      
      if (response.data.success) {
        const newPayment = this.transformPayment(response.data.data)
        state.payments.unshift(newPayment)
this.saveToCache() // <-- ADD THIS
        return { success: true, data: newPayment }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      state.error = error.response?.data?.message || 'Failed to create payment'
      return { success: false, error: state.error }
    } finally {
      state.isLoading = false
    }
  }

  // PATCH /admin/updatePaymentStatus/:id
  async updatePaymentStatus(id, status) {
    try {
      console.log(`Updating payment ${id} status to:`, status)
      const response = await paymentsAPI.updateStatus(id, status)
      console.log('Update status response:', response.data)
      
      if (response.data.success) {
        // Update local state
        const index = state.payments.findIndex(p => p.paymentId === id)
        if (index !== -1) {
          state.payments[index].status = status
          this.saveToCache() // <-- ADD THIS

          Object.assign(state.payments[index], this.transformPayment(response.data.data))
        }
        return { success: true, data: response.data.data }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      console.error('Update status error:', error)
      return { success: false, error: error.message }
    }
  }

  // PUT /admin/updatePayment/:id
  async updatePayment(id, paymentData) {
    try {
      console.log(`Updating payment ${id} with:`, paymentData)
      const response = await paymentsAPI.update(id, paymentData)
      console.log('Update payment response:', response.data)
      
      if (response.data.success) {
        // Update local state
        const index = state.payments.findIndex(p => p.paymentId === id)
        if (index !== -1) {
          state.payments[index] = this.transformPayment(response.data.data)
          this.saveToCache() // <-- ADD THIS
        }
        return { success: true, data: response.data.data }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      console.error('Update payment error:', error)
      return { success: false, error: error.message }
    }
  }

  // DELETE /admin/deletePayment/:id
  async deletePayment(id) {
    try {
      const response = await paymentsAPI.delete(id)
      
      if (response.data.success) {
        // Remove from local state
        state.payments = state.payments.filter(p => p.paymentId !== id)
        this.saveToCache() // <-- ADD THIS
        return { success: true, message: response.data.message }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      console.error('Delete payment error:', error)
      return { success: false, error: error.message }
    }
  }

  // GET /admin/getPaymentStats
  async getPaymentStats() {
    try {
      const response = await paymentsAPI.getStats()
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      console.error('Get payment stats error:', error)
      return { success: false, error: error.message }
    }
  }

  // GET /admin/getPaymentsByDateRange
  async getPaymentsByDateRange(startDate, endDate) {
    try {
      const response = await paymentsAPI.getByDateRange({ startDate, endDate })
      
      if (response.data.success) {
        return { success: true, data: this.transformPayments(response.data.data || []) }
      }
      return { success: false, error: response.data.message }
    } catch (error) {
      console.error('Get payments by date range error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==========================================
  // TRANSFORM BACKEND DATA TO FRONTEND FORMAT
  // ==========================================

  transformPayment(backendPayment) {
    if (!backendPayment) return null
        
    return {
      paymentId: backendPayment.paymentId,
      bookingId: backendPayment.reservationId,
      guest: backendPayment.guestName,
      email: backendPayment.email,
      phone: backendPayment.phoneNumber,
      room: backendPayment.roomName,
      amt: backendPayment.amount,
      balance: backendPayment.balance,
      method: backendPayment.paymentMethod,
      referenceNumber: backendPayment.referenceNumber,
      paymentType: backendPayment.paymentType,
      status: backendPayment.status,
      date: backendPayment.paymentDate,
      notes: backendPayment.notes,
      createdAt: backendPayment.createdAt,
      updatedAt: backendPayment.updatedAt
    }
  }

  transformPayments(backendPayments) {
    return (backendPayments || []).map(p => this.transformPayment(p))
  }

  // ==========================================
  // LOCAL FILTERING & COMPUTED PROPERTIES
  // ==========================================

  setSearchQuery(query) {
    state.searchQuery = query
  }

  get payments() {
    return state.payments
  }

  get isLoading() {
    return state.isLoading
  }

  get error() {
    return state.error
  }

  get searchQuery() {
    return state.searchQuery
  }

  get filteredPayments() {
    if (!state.searchQuery) return state.payments

    const query = state.searchQuery.toLowerCase()
    return state.payments.filter(payment => 
      payment.guest?.toLowerCase().includes(query) ||
      payment.paymentId?.toLowerCase().includes(query) ||
      payment.bookingId?.toLowerCase().includes(query) ||
      payment.referenceNumber?.toLowerCase().includes(query)
    )
  }

  get totalRevenue() {
    return state.payments.reduce((sum, payment) => sum + (payment.amt || 0), 0)
  }

  get paidCount() {
    return state.payments.filter(p => p.status === 'Paid').length
  }

  get pendingCount() {
    return state.payments.filter(p => p.status === 'Pending').length
  }

  get failedCount() {
    return state.payments.filter(p => p.status === 'Failed').length
  }

  get totalDownpayments() {
    return state.payments
      .filter(p => p.paymentType === 'Downpayment')
      .reduce((sum, p) => sum + (p.amt || 0), 0)
  }

  get totalPayments() {
    return state.payments.length
  }


  getPaymentsByYear(year) {
    return state.payments.filter(payment => {
      const paymentYear = new Date(payment.date).getFullYear()
      return paymentYear === year
    })
  }

  getPaymentsByMonth(year, month) {
    return state.payments.filter(payment => {
      const paymentDate = new Date(payment.date)
      return paymentDate.getFullYear() === year && paymentDate.getMonth() === month
    })
  }

  // ==========================================
  // STATE GETTERS
  // ==========================================

  getLoadingState() {
    return state.isLoading
  }

  getError() {
    return state.error
  }

  reset() {
    state.payments = []
    state.isLoading = false
    state.error = null
    state.searchQuery = ''
  }
}

// Create and export a singleton instance
const paymentsService = new PaymentsService()
export default paymentsService