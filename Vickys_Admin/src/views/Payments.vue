<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl text-neutral-800">Payment Monitoring</h2>
        <p class="text-neutral-500 mt-1">Track all payments and transactions</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search payments..."
            class="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-green-500 focus:border-green-500 w-full md:w-64"
          />
          <div class="absolute left-3 top-2.5">
            <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full" v-if="filteredPayments.length > 0">
          <thead class="bg-neutral-50">
            <tr class="border-b border-neutral-200">
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Booking ID</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Guest Name</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Room</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Amount</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Payment Method</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Date</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="payment in filteredPayments" 
              :key="payment.id" 
              class="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td class="py-4 px-6 text-neutral-700">#{{ payment.bookingId }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ payment.guestName }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ payment.room }}</td>
              <td class="py-4 px-6 text-neutral-700">₱{{ payment.amount.toLocaleString() }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ payment.paymentMethod }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ payment.date }}</td>
              <td class="py-4 px-6">
                <span 
                  :class="`px-3 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`"
                >
                  {{ payment.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Empty state -->
        <div v-if="filteredPayments.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-neutral-900">No payments found</h3>
        
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">Total Revenue</p>
        <p class="text-2xl text-neutral-800 mt-2">₱{{ totalRevenue.toLocaleString() }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">Paid Transactions</p>
        <p class="text-2xl text-neutral-800 mt-2">{{ paidCount }}</p>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">Pending Payments</p>
        <p class="text-2xl text-neutral-800 mt-2">{{ pendingCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Payment {
  id: number
  bookingId: string
  guestName: string
  room: string
  amount: number
  paymentMethod: string
  date: string
  status: string
}

const searchQuery = ref('')
const statusFilter = ref('')

const paymentData: Payment[] = [
  { id: 1, bookingId: '1001', guestName: 'Maria Santos', room: 'Deluxe Suite', amount: 7000, paymentMethod: 'GCash', date: 'Jan 18, 2026', status: 'Paid' },

]

const filteredPayments = computed(() => {
  return paymentData.filter(payment => {
    const matchesSearch = searchQuery.value === '' || 
      payment.guestName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.room.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === '' || 
      payment.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

// Calculate stats dynamically
const totalRevenue = computed(() => {
  return paymentData.reduce((sum, payment) => sum + payment.amount, 0)
})

const paidCount = computed(() => {
  return paymentData.filter(payment => payment.status === 'Paid').length
})

const pendingCount = computed(() => {
  return paymentData.filter(payment => payment.status === 'Pending').length
})

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700'
    case 'Pending':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
}
</script>