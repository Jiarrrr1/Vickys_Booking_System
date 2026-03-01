// src/stores/bookings.js
/**
 * Bookings Store
 * 
 * Manages all booking-related data and operations.
 * Handles fetching, filtering, and statistics.
 * 
 * USAGE:
 * const bookingsStore = useBookingsStore()
 * await bookingsStore.fetchBookings()
 * console.log(bookingsStore.totalBookings)
 */

import { defineStore } from 'pinia'
import { bookingsAPI } from '@/services/api'

export const useBookingsStore = defineStore('bookings', {
  // ==========================================
  // STATE
  // ==========================================
  state: () => ({
    // All bookings data
    bookings: [],
    
    // Loading states
    isLoading: false,
    
    // Error messages
    error: null,
    
    // Filter values
    searchQuery: '',
    roomFilter: ''
  }),

  // ==========================================
  // GETTERS
  // ==========================================
  getters: {
    /**
     * Get total number of bookings
     */
    totalBookings: (state) => state.bookings.length,

    /**
     * Get upcoming bookings (next 7 days)
     */
    upcomingBookings: (state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const sevenDaysLater = new Date(today)
      sevenDaysLater.setDate(today.getDate() + 7)

      return state.bookings.filter(booking => {
        const checkIn = new Date(booking.checkIn)
        return checkIn >= today && checkIn <= sevenDaysLater
      })
    },

    /**
     * Get total number of guests
     */
    totalGuests: (state) => {
      return state.bookings.reduce((sum, booking) => {
        return sum + (booking.guests || 0)
      }, 0)
    },

    /**
     * Get filtered bookings based on search and room filter
     */
    filteredBookings: (state) => {
      let filtered = [...state.bookings]

      // Apply search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(booking => {
          return (
            booking.guest.toLowerCase().includes(query) ||
            booking.room.toLowerCase().includes(query)
          )
        })
      }

      // Apply room filter
      if (state.roomFilter) {
        filtered = filtered.filter(booking => {
          return booking.room === state.roomFilter
        })
      }

      // Sort by check-in date (earliest first)
      return filtered.sort((a, b) => {
        return new Date(a.checkIn) - new Date(b.checkIn)
      })
    },

    /**
     * Get unique room types for filter dropdown
     */
    roomTypes: (state) => {
      const rooms = state.bookings.map(b => b.room)
      return [...new Set(rooms)].sort()
    }
  },

  // ==========================================
  // ACTIONS
  // ==========================================
  actions: {
    /**
     * Fetch all bookings from API
     */
    async fetchBookings() {
      this.isLoading = true
      this.error = null

      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await bookingsAPI.getAll()
        // this.bookings = response.data
        
        // For now, use sample data
        const SAMPLE_BOOKINGS = [
          { id: 1,  guest: 'Maria Santos',   room: 'Deluxe Suite',   guests: 2, checkIn: '2026-01-20', checkOut: '2026-01-22', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-15' },
          { id: 2,  guest: 'Juan Dela Cruz', room: 'Garden View',    guests: 4, checkIn: '2026-01-21', checkOut: '2026-01-23', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-13' },
          { id: 3,  guest: 'Anna Reyes',     room: 'Standard Room',  guests: 2, checkIn: '2026-02-19', checkOut: '2026-02-21', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-30' },
          { id: 4,  guest: 'Carlos Mendoza', room: 'Family Suite',   guests: 5, checkIn: '2026-02-22', checkOut: '2026-02-25', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-10' },
          { id: 5,  guest: 'Isabel Garcia',  room: 'Poolside Cabin', guests: 3, checkIn: '2026-03-10', checkOut: '2026-03-13', method: 'GCash', status: 'Confirmed', bookedOn: '2026-01-28' },
          { id: 6,  guest: 'Roberto Aquino', room: 'Mountain View',  guests: 2, checkIn: '2026-03-18', checkOut: '2026-03-21', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-05' },
          { id: 7,  guest: 'Elena Torres',   room: 'Deluxe Suite',   guests: 2, checkIn: '2026-03-25', checkOut: '2026-03-28', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-10' },
          { id: 8,  guest: 'Miguel Ramos',   room: 'Standard Room',  guests: 3, checkIn: '2026-03-28', checkOut: '2026-03-30', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-17' },
          { id: 9,  guest: 'Sofia Valdez',   room: 'Garden View',    guests: 2, checkIn: '2026-04-05', checkOut: '2026-04-08', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-14' },
          { id: 10, guest: 'Daniel Cruz',    room: 'Family Suite',   guests: 6, checkIn: '2026-04-12', checkOut: '2026-04-15', method: 'GCash', status: 'Confirmed', bookedOn: '2026-02-16' },
        ]
        
        this.bookings = SAMPLE_BOOKINGS
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch bookings'
        console.error('Fetch bookings error:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Create a new booking
     * @param {Object} bookingData - New booking data
     */
    async createBooking(bookingData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await bookingsAPI.create(bookingData)
        this.bookings.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create booking'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update existing booking
     * @param {number} id - Booking ID
     * @param {Object} updates - Updated data
     */
    async updateBooking(id, updates) {
      this.isLoading = true
      this.error = null

      try {
        const response = await bookingsAPI.update(id, updates)
        const index = this.bookings.findIndex(b => b.id === id)
        if (index !== -1) {
          this.bookings[index] = response.data
        }
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update booking'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Delete a booking
     * @param {number} id - Booking ID
     */
    async deleteBooking(id) {
      this.isLoading = true
      this.error = null

      try {
        await bookingsAPI.delete(id)
        this.bookings = this.bookings.filter(b => b.id !== id)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete booking'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Set search query
     */
    setSearchQuery(query) {
      this.searchQuery = query
    },

    /**
     * Set room filter
     */
    setRoomFilter(room) {
      this.roomFilter = room
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.searchQuery = ''
      this.roomFilter = ''
    },

    /**
     * Reset store to initial state
     */
    $reset() {
      this.bookings = []
      this.isLoading = false
      this.error = null
      this.searchQuery = ''
      this.roomFilter = ''
    }
  }
})