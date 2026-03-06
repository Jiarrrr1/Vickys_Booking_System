// src/services/auth.js
import { reactive, computed } from 'vue'
import { adminAuth } from './api'

// Reactive state
const state = reactive({
  user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
  token: localStorage.getItem('adminToken') || null,
  isLoading: false,
  error: null
})

// Computed properties
const isAuthenticated = computed(() => !!state.token)
const userName = computed(() => state.user?.fullName || 'Admin')
const userRole = computed(() => 'Admin')
const userInitial = computed(() => state.user?.fullName?.charAt(0).toUpperCase() || 'A')

const authService = {
  // State getters
  get user() { return state.user },
  get token() { return state.token },
  get isLoading() { return state.isLoading },
  get error() { return state.error },
  get isAuthenticated() { return isAuthenticated.value },
  get userName() { return userName.value },
  get userRole() { return userRole.value },
  get userInitial() { return userInitial.value },

  /**
   * Login using your backend admin endpoint
   */
  async login(credentials) {
    state.isLoading = true
    state.error = null

    try {
      console.log('📤 Attempting login with:', credentials.username)
      
      const response = await adminAuth.login({
        email: credentials.username,
        password: credentials.password
      })
      
      console.log('Login response:', response.data)
      
      // Your API returns { success: true, data: { admin, token } }
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed')
      }
      
      const { token, admin } = response.data.data
      
      if (!token) {
        throw new Error('No token received from server')
      }
      
      // Store token and user
      state.token = token
      state.user = admin
      
      // Save to localStorage
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(admin))
      
      console.log('✅ Login successful:', admin.fullName)
      return { success: true }
      
    } catch (error) {
      let errorMessage = 'Login failed'
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`
        console.error('Server error:', error.response.data)
      } else if (error.request) {
        // No response received
        errorMessage = 'Cannot connect to server. Make sure backend is running on port 3001'
        console.error('No response received')
      } else {
        // Request setup error
        errorMessage = error.message
        console.error('Request error:', error.message)
      }
      
      state.error = errorMessage
      return { success: false, error: errorMessage }
      
    } finally {
      state.isLoading = false
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      if (state.token) {
        await adminAuth.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      state.user = null
      state.token = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      console.log('✅ Logged out')
    }
  },

  /**
   * Verify token and get current admin
   */
  async verifyToken() {
    if (!state.token) return false

    try {
      const response = await adminAuth.verify()
      
      if (response.data.success) {
        state.user = response.data.data
        localStorage.setItem('adminUser', JSON.stringify(response.data.data))
        return true
      }
      return false
    } catch (error) {
      console.error('Token verification failed:', error)
      this.logout()
      return false
    }
  },

  /**
   * Initialize auth on app start
   */
  async initializeAuth() {
    if (state.token) {
      return await this.verifyToken()
    }
    return false
  },

  reset() {
    state.user = null
    state.token = null
    state.isLoading = false
    state.error = null
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  }
}

export default authService