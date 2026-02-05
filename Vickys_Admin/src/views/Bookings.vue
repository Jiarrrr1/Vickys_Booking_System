<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl text-neutral-800">Booking History</h2>
        <p class="text-neutral-500 mt-1">View and manage all bookings</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search bookings..."
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
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral-50">
            <tr class="border-b border-neutral-200">
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Guest Name</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Room Name</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Guests</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Check-in</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Check-out</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Payment Method</th>
              <th class="text-left py-4 px-6 text-sm text-neutral-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td class="py-4 px-6 text-neutral-700">{{ booking.guestName }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ booking.roomName }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ booking.guests }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ booking.checkIn }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ booking.checkOut }}</td>
              <td class="py-4 px-6 text-neutral-700">{{ booking.paymentMethod }}</td>
              <td class="py-4 px-6">
                <span
                  :class="`px-3 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`"
                >
                  {{ booking.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="filteredBookings.length === 0" class="text-center py-8 text-neutral-500">
        No bookings found matching your criteria.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Booking {
  id: number
  guestName: string
  roomName: string
  guests: number
  checkIn: string
  checkOut: string
  paymentMethod: string
  status: string
}

const searchQuery = ref('')
const statusFilter = ref('')

const bookingData: Booking[] = [
  { id: 1, guestName: 'Maria Santos', roomName: 'Deluxe Suite', guests: 2, checkIn: 'Jan 20, 2026', checkOut: 'Jan 22, 2026', paymentMethod: 'GCash', status: 'Confirmed' },

]

const filteredBookings = computed(() => {
  return bookingData.filter(booking => {
    const matchesSearch = searchQuery.value === '' || 
      booking.guestName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.roomName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.paymentMethod.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === '' || 
      booking.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-100 text-green-700'
    case 'Pending':
      return 'bg-amber-100 text-amber-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
}
</script>