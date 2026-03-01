<template>
  <section class="section fu">
    <!-- Section Heading -->
    <div class="shead">
      <div class="stitle">Bookings</div>
      <div class="sdesc">All confirmed guest reservations, sorted by earliest check-in date.</div>
    </div>

    <!-- Summary Stat Cards -->
    <div class="stats-grid c3 fu1">
      <!-- Total Bookings -->
      <StatCard
        :value="bookingsStore.totalBookings"
        label="Total Bookings"
        color-class="cg"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </template>
      </StatCard>

      <!-- Upcoming Check-ins -->
      <StatCard
        :value="bookingsStore.upcomingBookings.length"
        label="Upcoming (next 7 days)"
        color-class="ca"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </template>
      </StatCard>

      <!-- Total Guests -->
      <StatCard
        :value="bookingsStore.totalGuests"
        label="Total Guests"
        color-class="cb"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Bookings Table Card -->
    <div class="card fu2">
      <!-- Card Header with Filter -->
      <div class="card-head">
        <div>
          <div class="card-title">All Reservations</div>
          <div class="card-sub">Sorted by earliest check-in date</div>
        </div>

        <!-- Filter Bar -->
        <div class="fbar">
          <div class="fsearch">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search guest or room…"
              @input="handleSearch"
            />
          </div>

          <!-- Room Filter -->
          <select class="fsel" v-model="roomFilter" @change="handleSearch">
            <option value="">All Rooms</option>
            <option value="Deluxe Suite">Deluxe Suite</option>
            <option value="Garden View">Garden View</option>
            <option value="Standard Room">Standard Room</option>
            <option value="Family Suite">Family Suite</option>
            <option value="Poolside Cabin">Poolside Cabin</option>
            <option value="Mountain View">Mountain View</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="twrap">
        <table v-if="!bookingsStore.isLoading && filteredBookings.length > 0">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th style="text-align:center;">Guests</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Payment</th>
              <th>Booked On</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in filteredBookings" :key="booking.id">
              <td class="tdm">#{{ String(booking.id).padStart(4, '0') }}</td>
              <td class="tdn">{{ booking.guest }}</td>
              <td>{{ booking.room }}</td>
              <td style="text-align:center;">{{ booking.guests }}</td>
              <td><strong>{{ formatDate(booking.checkIn) }}</strong></td>
              <td>{{ formatDate(booking.checkOut) }}</td>
              <td>
                <span class="tag tag-g">{{ booking.method }}</span>
              </td>
              <td style="color:var(--t3);font-size:12.5px;">
                {{ formatDate(booking.bookedOn) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading State -->
        <div v-if="bookingsStore.isLoading" class="empty-state">
          <div class="loading-spinner"></div>
          <p style="margin-top: 16px;">Loading bookings...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!bookingsStore.isLoading && filteredBookings.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No Bookings Found</h3>
          <p>Try a different search term or clear the filter.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookingsStore } from '@/stores/bookings'
import StatCard from '@/components/StatCard.vue'

const bookingsStore = useBookingsStore()

const searchQuery = ref('')
const roomFilter = ref('')

// Filtered bookings based on search and filter
const filteredBookings = computed(() => {
  let filtered = [...bookingsStore.bookings]

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(booking => {
      return (
        booking.guest.toLowerCase().includes(query) ||
        booking.room.toLowerCase().includes(query)
      )
    })
  }

  // Apply room filter
  if (roomFilter.value) {
    filtered = filtered.filter(booking => {
      return booking.room === roomFilter.value
    })
  }

  // Sort by check-in date
  return filtered.sort((a, b) => {
    return new Date(a.checkIn) - new Date(b.checkIn)
  })
})

// Format date helper
const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
}

const handleSearch = () => {
  bookingsStore.setSearchQuery(searchQuery.value)
  bookingsStore.setRoomFilter(roomFilter.value)
}

// Fetch bookings on mount
onMounted(async () => {
  await bookingsStore.fetchBookings()
})
</script>

<style scoped>
.fbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>