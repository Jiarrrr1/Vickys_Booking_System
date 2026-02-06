<template>
  <div class="space-y-8 px-10 py-5">
    <div>
      <h2 class="text-2xl text-neutral-800">Dashboard Overview</h2>
      <p class="text-neutral-500 mt-1">Welcome back! Here's what's happening today.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Bookings" :value="142" :icon="Calendar" icon-color="text-blue-600" />
      <StatCard
        title="Today's Bookings"
        :value="8"
        :icon="CheckCircle"
        icon-color="text-green-600"
      />
      <StatCard title="Upcoming Check-ins" :value="recentBookings.length" :icon="Users" icon-color="text-purple-600" />
    </div>

    <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 min-h-[300px]">
      <h3 class="text-lg text-neutral-800 mb-4">Recent Bookings</h3>

      <div v-if="recentBookings.length > 0" class="">
        <table class="w-full">
          <thead>
            <tr class="border-b border-neutral-200">
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Guest Name</th>
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Room</th>
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Guests</th>
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Check-in</th>
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Check-out</th>
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Status</th>
              <th class="text-left py-3 px-4 text-sm text-neutral-600">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="booking in recentBookings"
              :key="booking.id"
              class="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td class="py-3 px-4 text-neutral-700">{{ booking.guestName }}</td>
              <td class="py-3 px-4 text-neutral-700">{{ booking.room }}</td>
              <td class="py-3 px-4 text-neutral-700">{{ booking.guests }}</td>
              <td class="py-3 px-4 text-neutral-700">{{ booking.checkIn }}</td>
              <td class="py-3 px-4 text-neutral-700">{{ booking.checkOut }}</td>
              <td class="py-3 px-4">
                <StatusBadge :status="booking.status" />
              </td>
              <td class="py-3 px-4">
                <DropDownButton 
                  :current-status="booking.status"
                  :booking-id="booking.id"
                  @status-change="handleStatusChange"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state - ONLY show when there are NO bookings -->
      <div
        v-if="recentBookings.length === 0"
        class="flex flex-col items-center justify-center py-12 px-4 h-full"
      >
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-neutral-900">No recent bookings</h3>
          <p class="mt-1 text-neutral-500">There are no recent bookings to display.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Calendar, CheckCircle, Bed, Users } from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import DropDownButton from '@/components/DropDownButton.vue' 
import StatusBadge from '@/components/StatusBadge.vue' 
// Make it reactive so we can update status
const recentBookings = ref([
  { 
    id: 1,
    guestName: 'Maria Santos', 
    room: 'Deluxe Suite', 
    guests: 2, 
    checkIn: 'Jan 20, 2026', 
    checkOut: 'Jan 22, 2026', 
    status: 'Pending' 
  },
 
])

const handleStatusChange = ({ bookingId, newStatus }) => {
  const bookingIndex = recentBookings.value.findIndex(b => b.id === bookingId)
  if (bookingIndex !== -1) {
    recentBookings.value[bookingIndex].status = newStatus
    console.log(`Booking ${bookingId} status updated to ${newStatus}`)
    
    // In real app: await updateBookingStatusAPI(bookingId, newStatus)
  }
}
</script>