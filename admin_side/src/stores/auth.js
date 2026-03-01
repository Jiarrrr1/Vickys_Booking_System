// src/stores/auth.js
/**
 * Authentication Store
 * 
 * This store manages user authentication state and actions.
 * It handles login, logout, and stores the user's token.
 * 
 * HOW TO USE:
 * 1. Import: import { useAuthStore } from '@/stores/auth'
 * 2. Initialize: const authStore = useAuthStore()
 * 3. Use: authStore.login(credentials)
 */

import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  // ==========================================
  // STATE - Your data storage
  // ==========================================
  state: () => ({
    // User object from API
    user: null,
    
    // JWT token for authentication
    token: localStorage.getItem('token') || null,
    
    // Loading state for async operations
    isLoading: false,
    
    // Error messages
    error: null
  }),

  // ==========================================
  // GETTERS - Computed properties
  // Think of these as "computed" in components
  // ==========================================
  getters: {
    /**
     * Check if user is authenticated
     * Returns true if token exists
     */
    isAuthenticated: (state) => !!state.token,

    /**
     * Get user's display name
     * Returns user name or 'Guest'
     */
    userName: (state) => state.user?.name || 'Guest',

    /**
     * Get user's role
     * Returns role or 'user'
     */
    userRole: (state) => state.user?.role || 'user',

    /**
     * Get user's initial for avatar
     * Returns first letter of name
     */
    userInitial: (state) => {
      return state.user?.name?.charAt(0).toUpperCase() || 'U'
    }
  },

  // ==========================================
  // ACTIONS - Methods that modify state
  // Can be async and make API calls
  // ==========================================
  actions: {
    /**
     * Login user with credentials
     * @param {Object} credentials - { username, password }
     * @returns {Promise<boolean>} - Success status
     */
    async login(credentials) {
      this.isLoading = true
      this.error = null

      try {
        // Call API
        const response = await authAPI.login(credentials)
        
        // Store token and user data
        this.token = response.data.token
        this.user = response.data.user
        
        // Save token to localStorage for persistence
        localStorage.setItem('token', this.token)
        
        return true
      } catch (error) {
        // Handle errors
        this.error = error.response?.data?.message || 'Login failed'
        console.error('Login error:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Logout user
     * Clears all auth data
     */
    logout() {
      this.user = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
    },

    /**
     * Refresh user data from API
     * Useful after updating profile
     */
    async refreshUser() {
      if (!this.token) return

      try {
        const response = await authAPI.getProfile()
        this.user = response.data
      } catch (error) {
        console.error('Failed to refresh user:', error)
        // If token is invalid, logout
        if (error.response?.status === 401) {
          this.logout()
        }
      }
    },

    /**
     * Initialize auth state from localStorage
     * Call this on app startup
     */
    async initializeAuth() {
      if (this.token) {
        try {
          await this.refreshUser()
        } catch (error) {
          // Token is invalid, clear it
          this.logout()
        }
      }
    }
  }
})