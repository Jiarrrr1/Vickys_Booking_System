// src/services/api.js
/**
 * API SERVICE CONFIGURATION
 * 
 * This file sets up Axios and defines all API endpoints.
 * It handles authentication tokens, request/response interceptors,
 * and provides organized API methods.
 * 
 * STRUCTURE:
 * 1. Axios instance with base configuration
 * 2. Request/Response interceptors
 * 3. API endpoint groups (auth, bookings, payments, revenue)
 */

import axios from 'axios'
import router from '@/router'

// ==========================================
// AXIOS INSTANCE CONFIGURATION
// ==========================================

/**
 * Base API URL
 * Change this to your backend URL
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Create Axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// ==========================================
// REQUEST INTERCEPTOR
// Adds authentication token to every request
// ==========================================

apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==========================================
// RESPONSE INTERCEPTOR
// Handles errors globally
// ==========================================

apiClient.interceptors.response.use(
  (response) => {
    // Return successful response
    return response
  },
  (error) => {
    // Handle different error scenarios
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token')
          router.push('/login')
          break
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.response.data)
          break
          
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data)
          break
          
        case 500:
          // Server error
          console.error('Server error:', error.response.data)
          break
          
        default:
          console.error('API Error:', error.response.data)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response from server')
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * AUTHENTICATION API
 * Handles login, logout, and user profile
 */
export const authAPI = {
  /**
   * Login user
   * @param {Object} credentials - { username, password }
   * @returns {Promise} - { token, user }
   */
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials)
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: () => {
    return apiClient.post('/auth/logout')
  },

  /**
   * Get current user profile
   * @returns {Promise} - User object
   */
  getProfile: () => {
    return apiClient.get('/auth/profile')
  },

  /**
   * Update user profile
   * @param {Object} data - Updated user data
   * @returns {Promise}
   */
  updateProfile: (data) => {
    return apiClient.put('/auth/profile', data)
  },

  /**
   * Change password
   * @param {Object} data - { oldPassword, newPassword }
   * @returns {Promise}
   */
  changePassword: (data) => {
    return apiClient.post('/auth/change-password', data)
  }
}

/**
 * BOOKINGS API
 * Handles all booking operations
 */
export const bookingsAPI = {
  /**
   * Get all bookings
   * @param {Object} params - Query parameters (optional)
   * @returns {Promise} - Array of bookings
   */
  getAll: (params = {}) => {
    return apiClient.get('/bookings', { params })
  },

  /**
   * Get single booking by ID
   * @param {number} id - Booking ID
   * @returns {Promise} - Booking object
   */
  getById: (id) => {
    return apiClient.get(`/bookings/${id}`)
  },

  /**
   * Create new booking
   * @param {Object} data - Booking data
   * @returns {Promise} - Created booking
   */
  create: (data) => {
    return apiClient.post('/bookings', data)
  },

  /**
   * Update existing booking
   * @param {number} id - Booking ID
   * @param {Object} data - Updated data
   * @returns {Promise} - Updated booking
   */
  update: (id, data) => {
    return apiClient.put(`/bookings/${id}`, data)
  },

  /**
   * Delete booking
   * @param {number} id - Booking ID
   * @returns {Promise}
   */
  delete: (id) => {
    return apiClient.delete(`/bookings/${id}`)
  },

  /**
   * Get bookings by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} - Array of bookings
   */
  getByDateRange: (startDate, endDate) => {
    return apiClient.get('/bookings/range', {
      params: { startDate, endDate }
    })
  },

  /**
   * Get bookings by room
   * @param {number} roomId - Room ID
   * @returns {Promise} - Array of bookings
   */
  getByRoom: (roomId) => {
    return apiClient.get(`/bookings/room/${roomId}`)
  }
}

/**
 * PAYMENTS API
 * Handles payment records
 */
export const paymentsAPI = {
  /**
   * Get all payments
   * @returns {Promise} - Array of payments
   */
  getAll: () => {
    return apiClient.get('/payments')
  },

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise} - Payment object
   */
  getById: (id) => {
    return apiClient.get(`/payments/${id}`)
  },

  /**
   * Get payments by booking ID
   * @param {number} bookingId - Booking ID
   * @returns {Promise} - Array of payments
   */
  getByBooking: (bookingId) => {
    return apiClient.get(`/payments/booking/${bookingId}`)
  },

  /**
   * Create new payment
   * @param {Object} data - Payment data
   * @returns {Promise} - Created payment
   */
  create: (data) => {
    return apiClient.post('/payments', data)
  },

  /**
   * Update payment status
   * @param {number} id - Payment ID
   * @param {Object} data - { status }
   * @returns {Promise}
   */
  updateStatus: (id, data) => {
    return apiClient.patch(`/payments/${id}/status`, data)
  }
}

/**
 * REVENUE API
 * Handles revenue statistics
 */
export const revenueAPI = {
  /**
   * Get revenue summary
   * @returns {Promise} - Revenue data
   */
  getSummary: () => {
    return apiClient.get('/revenue/summary')
  },

  /**
   * Get monthly revenue
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise} - Monthly revenue data
   */
  getMonthly: (year, month) => {
    return apiClient.get('/revenue/monthly', {
      params: { year, month }
    })
  },

  /**
   * Get yearly revenue
   * @param {number} year - Year
   * @returns {Promise} - Yearly revenue data
   */
  getYearly: (year) => {
    return apiClient.get('/revenue/yearly', {
      params: { year }
    })
  },

  /**
   * Export revenue report
   * @param {Object} params - { startDate, endDate, format }
   * @returns {Promise} - File blob
   */
  export: (params) => {
    return apiClient.get('/revenue/export', {
      params,
      responseType: 'blob'
    })
  }
}

/**
 * ROOMS API
 * Handles room data
 */
export const roomsAPI = {
  /**
   * Get all rooms
   * @returns {Promise} - Array of rooms
   */
  getAll: () => {
    return apiClient.get('/rooms')
  },

  /**
   * Get available rooms for date range
   * @param {string} checkIn - Check-in date
   * @param {string} checkOut - Check-out date
   * @returns {Promise} - Array of available rooms
   */
  getAvailable: (checkIn, checkOut) => {
    return apiClient.get('/rooms/available', {
      params: { checkIn, checkOut }
    })
  }
}

// Export the axios instance for direct use if needed
export default apiClient