// src/services/paymentsService.js
import { paymentsAPI } from './api'

class PaymentsService {
  constructor() {
    this.payments = []
    this.isLoading = false
    this.error = null
    this.searchQuery = ''
  }

  // ==========================================
  // API CALLS
  // ==========================================

  async fetchPayments(params = {}) {
    this.isLoading = true
    this.error = null

    try {
      const response = await paymentsAPI.getAll(params)
      this.payments = response.data
      return { success: true, data: this.payments }
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to fetch payments'
      console.error('Fetch payments error:', error)
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async getPaymentById(id) {
    this.isLoading = true
    this.error = null

    try {
      const response = await paymentsAPI.getById(id)
      return { success: true, data: response.data }
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to fetch payment'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async getPaymentsByBooking(bookingId) {
    try {
      const response = await paymentsAPI.getByBooking(bookingId)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async createPayment(paymentData) {
    this.isLoading = true
    this.error = null

    try {
      const response = await paymentsAPI.create(paymentData)
      this.payments.push(response.data)
      return { success: true, data: response.data }
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to create payment'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async updatePaymentStatus(id, status) {
    try {
      const response = await paymentsAPI.updateStatus(id, status)
      const index = this.payments.findIndex(p => p.id === id)
      if (index !== -1) {
        this.payments[index].status = status
      }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Update status error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==========================================
  // LOCAL FILTERING & COMPUTED PROPERTIES
  // ==========================================

  setSearchQuery(query) {
    this.searchQuery = query
  }

  get filteredPayments() {
    if (!this.searchQuery) return this.payments

    const query = this.searchQuery.toLowerCase()
    return this.payments.filter(payment => 
      payment.guest?.toLowerCase().includes(query) ||
      payment.id?.toLowerCase().includes(query) ||
      payment.bookingId?.toString().includes(query)
    )
  }

  get totalRevenue() {
    return this.payments.reduce((sum, payment) => sum + (payment.amt || 0), 0)
  }

  get paidCount() {
    return this.payments.filter(p => p.status === 'Paid').length
  }

  get totalDownpayments() {
    return this.payments.length * 500
  }

  getPaymentsByYear(year) {
    return this.payments.filter(payment => {
      const paymentYear = new Date(payment.date).getFullYear()
      return paymentYear === year
    })
  }

  getPaymentsByMonth(year, month) {
    return this.payments.filter(payment => {
      const paymentDate = new Date(payment.date)
      return paymentDate.getFullYear() === year && paymentDate.getMonth() === month
    })
  }

  // ==========================================
  // STATE GETTERS
  // ==========================================

  getLoadingState() {
    return this.isLoading
  }

  getError() {
    return this.error
  }

  reset() {
    this.payments = []
    this.isLoading = false
    this.error = null
    this.searchQuery = ''
  }
}

export default new PaymentsService()