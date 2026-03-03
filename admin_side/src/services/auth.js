// src/services/auth.js
import { reactive, computed } from 'vue'
import axios from 'axios'
import { adminAuth } from './api' // Import your admin API

// API Base URL - change to your backend port 3001
const API_BASE_URL = '/api/v1' // Use relative path so proxy works

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') // Use adminToken instead of token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Reactive state
const state = reactive({
  user: null,
  token: localStorage.getItem('adminToken') || null, // Use adminToken
  isLoading: false,
  error: null
})

// Computed properties
const isAuthenticated = computed(() => !!state.token)
const userName = computed(() => state.user?.fullName || 'Admin') // fullName from your schema
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
      // Use your admin login endpoint
      const response = await apiClient.post('/admin/login', {
        email: credentials.username, // Map username to email
        password: credentials.password
      })
      
      console.log('Login response:', response.data)
      
      // Your API returns { success, data: { admin, token } }
      const { token, admin } = response.data.data
      
      // Store token and user data
      state.token = token
      state.user = admin
      
      // Save to localStorage
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(admin))
      
      console.log('✅ Login successful:', admin.fullName)
      return { success: true }
    } catch (error) {
      state.error = error.response?.data?.message || 'Login failed'
      console.error('❌ Login error:', error)
      return { success: false, error: state.error }
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
        await apiClient.post('/admin/logout', {}, {
          headers: { Authorization: `Bearer ${state.token}` }
        })
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
      const response = await apiClient.get('/admin/verify', {
        headers: { Authorization: `Bearer ${state.token}` }
      })
      
      if (response.data.success) {
        state.user = response.data.data
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
      await this.verifyToken()
    }
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