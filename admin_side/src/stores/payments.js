// src/stores/payments.js
/**
 * Payments Store
 * 
 * Manages payment records and transaction data.
 */

import { defineStore } from 'pinia'
import { paymentsAPI } from '@/services/api'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    payments: [],
    isLoading: false,
    error: null,
    searchQuery: ''
  }),

  getters: {
    /**
     * Total revenue from all payments
     */
    totalRevenue: (state) => {
      return state.payments.reduce((sum, payment) => {
        return sum + (payment.amt || 0)
      }, 0)
    },

    /**
     * Count of paid transactions
     */
    paidCount: (state) => {
      return state.payments.filter(p => p.status === 'Paid').length
    },

    /**
     * Total downpayments (₱500 per booking)
     */
    totalDownpayments: (state) => {
      return state.payments.length * 500
    },

    /**
     * Filtered payments based on search
     */
    filteredPayments: (state) => {
      if (!state.searchQuery) return state.payments

      const query = state.searchQuery.toLowerCase()
      return state.payments.filter(payment => {
        return (
          payment.guest.toLowerCase().includes(query) ||
          payment.id.toLowerCase().includes(query)
        )
      })
    }
  },

  actions: {
    /**
     * Fetch all payments
     */
    async fetchPayments() {
      this.isLoading = true
      this.error = null

      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await paymentsAPI.getAll()
        // this.payments = response.data
        
        // For now, use sample data from payments.js
        const SAMPLE_PAYMENTS = [
          { id: '#1001', guest: 'Maria Santos',   room: 'Deluxe Suite',   amt: 7000,  method: 'GCash', date: 'Jan 18, 2026', status: 'Paid' },
          { id: '#1002', guest: 'Juan Dela Cruz', room: 'Garden View',    amt: 8400,  method: 'GCash', date: 'Jan 19, 2026', status: 'Paid' },
          { id: '#1003', guest: 'Anna Reyes',     room: 'Standard Room',  amt: 5000,  method: 'GCash', date: 'Jan 17, 2026', status: 'Paid' },
          { id: '#1004', guest: 'Carlos Mendoza', room: 'Family Suite',   amt: 16500, method: 'GCash', date: 'Jan 20, 2026', status: 'Paid' },
          { id: '#1005', guest: 'Isabel Garcia',  room: 'Poolside Cabin', amt: 11400, method: 'GCash', date: 'Jan 16, 2026', status: 'Paid' },
          { id: '#1006', guest: 'Roberto Aquino', room: 'Mountain View',  amt: 9600,  method: 'GCash', date: 'Jan 21, 2026', status: 'Paid' },
          { id: '#1007', guest: 'Elena Torres',   room: 'Deluxe Suite',   amt: 10500, method: 'GCash', date: 'Jan 23, 2026', status: 'Paid' },
          { id: '#1008', guest: 'Miguel Ramos',   room: 'Standard Room',  amt: 5000,  method: 'GCash', date: 'Jan 22, 2026', status: 'Paid' },
          { id: '#1009', guest: 'Sofia Valdez',   room: 'Garden View',    amt: 12600, method: 'GCash', date: 'Jan 25, 2026', status: 'Paid' },
          { id: '#1010', guest: 'Daniel Cruz',    room: 'Family Suite',   amt: 16500, method: 'GCash', date: 'Jan 24, 2026', status: 'Paid' },
        ]
        
        this.payments = SAMPLE_PAYMENTS
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch payments'
        console.error('Fetch payments error:', error)
        return false
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
     * Reset store
     */
    $reset() {
      this.payments = []
      this.isLoading = false
      this.error = null
      this.searchQuery = ''
    }
  }
})