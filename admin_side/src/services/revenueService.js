// src/services/revenueService.js
import { revenueAPI } from './api'
import bookingsService from './bookingService'
import paymentsService from './paymentsService'

class RevenueService {
  constructor() {
    this.isLoading = false
    this.error = null
    this.selectedYear = new Date().getFullYear()
    this.selectedMonth = new Date().getMonth()
    this.viewMode = 'monthly' // 'monthly' or 'yearly'
    this.searchQuery = ''
  }

  // ==========================================
  // API CALLS
  // ==========================================

  async fetchRevenueSummary() {
    this.isLoading = true
    this.error = null

    try {
      const response = await revenueAPI.getSummary()
      return { success: true, data: response.data }
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to fetch revenue summary'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async fetchMonthlyRevenue(year, month) {
    this.isLoading = true
    this.error = null

    try {
      const response = await revenueAPI.getMonthly(year, month + 1) // API uses 1-12
      return { success: true, data: response.data }
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to fetch monthly revenue'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async fetchYearlyRevenue(year) {
    this.isLoading = true
    this.error = null

    try {
      const response = await revenueAPI.getYearly(year)
      return { success: true, data: response.data }
    } catch (error) {
      this.error = error.response?.data?.message || 'Failed to fetch yearly revenue'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  async exportRevenueReport(params) {
    try {
      const response = await revenueAPI.export(params)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ==========================================
  // COMPUTED PROPERTIES (using local data)
  // ==========================================

  get paymentsByMonth() {
    return paymentsService.getPaymentsByMonth(this.selectedYear, this.selectedMonth)
  }

  get paymentsByYear() {
    return paymentsService.getPaymentsByYear(this.selectedYear)
  }

  get bookingsByMonth() {
    return bookingsService.getBookingsByMonth(this.selectedYear, this.selectedMonth)
  }

  get bookingsByYear() {
    return bookingsService.getBookingsByYear(this.selectedYear)
  }

  get monthlyRevenue() {
    return this.paymentsByMonth.reduce((sum, p) => sum + (p.amt || 0), 0)
  }

  get yearlyRevenue() {
    return this.paymentsByYear.reduce((sum, p) => sum + (p.amt || 0), 0)
  }

  get monthlyBookings() {
    return this.bookingsByMonth.length
  }

  get yearlyBookings() {
    return this.bookingsByYear.length
  }

  get monthlyAvgPerBooking() {
    return this.monthlyBookings > 0 ? this.monthlyRevenue / this.monthlyBookings : 0
  }

  get yearlyAvgPerBooking() {
    return this.yearlyBookings > 0 ? this.yearlyRevenue / this.yearlyBookings : 0
  }

  get monthlyBreakdown() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']
    
    return months.map((monthName, index) => {
      const payments = paymentsService.getPaymentsByMonth(this.selectedYear, index)
      const bookings = bookingsService.getBookingsByMonth(this.selectedYear, index)
      
      const revenue = payments.reduce((sum, p) => sum + (p.amt || 0), 0)
      const bookingCount = bookings.length
      
      return {
        month: monthName,
        monthIndex: index,
        bookings: bookingCount,
        revenue,
        avgPerBooking: bookingCount > 0 ? revenue / bookingCount : 0,
        growth: 0 // You can calculate this if you have historical data
      }
    })
  }

  get filteredMonthlyBreakdown() {
    if (!this.searchQuery) return this.monthlyBreakdown
    
    const query = this.searchQuery.toLowerCase()
    return this.monthlyBreakdown.filter(item => 
      item.month.toLowerCase().includes(query)
    )
  }

  get summaryStats() {
    const formatAmount = (amount) => `₱${amount.toLocaleString()}`
    
    return {
      totalRevenue: {
        value: formatAmount(paymentsService.totalRevenue),
        label: 'Total Revenue',
        growth: 0 // Calculate from API
      },
      totalBookings: {
        value: bookingsService.totalBookings,
        label: 'Overall Bookings',
        growth: 0
      },
      thisMonth: {
        value: formatAmount(this.monthlyRevenue),
        label: 'This Month',
        growth: 0
      },
      thisYear: {
        value: formatAmount(this.yearlyRevenue),
        label: 'This Year',
        growth: 0
      },
      monthlyBookings: {
        value: this.monthlyBookings,
        label: 'Monthly Bookings',
        growth: 0
      },
      yearlyBookings: {
        value: this.yearlyBookings,
        label: 'Yearly Bookings',
        growth: 0
      }
    }
  }

  // ==========================================
  // SETTERS
  // ==========================================

  setSelectedYear(year) {
    this.selectedYear = parseInt(year)
  }

  setSelectedMonth(month) {
    this.selectedMonth = parseInt(month)
  }

  setViewMode(mode) {
    this.viewMode = mode
  }

  setSearchQuery(query) {
    this.searchQuery = query
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  formatAmount(amount) {
    if (amount === undefined || amount === null) return '₱0'
    return `₱${amount.toLocaleString()}`
  }

  calculateGrowth(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
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
    this.isLoading = false
    this.error = null
    this.selectedYear = new Date().getFullYear()
    this.selectedMonth = new Date().getMonth()
    this.viewMode = 'monthly'
    this.searchQuery = ''
  }
}

export default new RevenueService()