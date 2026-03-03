<template>
  <!-- SINGLE ROOT DIV - wrap everything -->
  <div class="bookings-view">
    <section class="section fu">
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
            <div class="card-sub">Click on any booking to view details and manage status</div>
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
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="booking in filteredBookings" 
                :key="booking.id"
                class="booking-row"
                @click="openBookingModal(booking)"
              >
                <td class="tdm">#{{ String(booking.id).padStart(4, '0') }}</td>
                <td class="tdn">{{ booking.guest }}</td>
                <td>{{ booking.room }}</td>
                <td style="text-align:center;">{{ booking.guests }}</td>
                <td><strong>{{ formatDate(booking.checkIn) }}</strong></td>
                <td>{{ formatDate(booking.checkOut) }}</td>

                <td style="text-align: center;" @click.stop>
                  <select 
                    class="status-dropdown" 
                    :class="getStatusClass(booking.status)"
                    :value="booking.status"
                    @change="updateBookingStatus(booking.id, $event.target.value)"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Re-schedule">Re-schedule</option>
                    <option value="Checked-in">Checked-in</option>
                    <option value="Checked-out">Checked-out</option>
                  </select>
                </td>

                <td style="text-align: center;" @click.stop>
                  <button 
                    class="view-btn" 
                    @click="openBookingModal(booking)"
                    title="View Details"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
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

    <!-- Booking Details Modal - NOW INSIDE THE ROOT DIV -->
    <BookingModal
      :show="showModal"
      :booking="selectedBooking"
      @close="closeModal"
      @update-status="handleStatusUpdate"
      @save-notes="handleSaveNotes"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import bookingsService from '@/services/bookingService'
import StatCard from '@/components/StatCard.vue'
import BookingModal from '@/modals/bookingModal.vue'

const bookingsStore = bookingsService

const searchQuery = ref('')
const roomFilter = ref('')
const showModal = ref(false)
const selectedBooking = ref(null)

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

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Re-schedule': 'status-reschedule',
    'Checked-in': 'status-checkedin',
    'Checked-out': 'status-checkedout',
  }
  return classes[status] || 'status-pending'
}

// Open booking modal
const openBookingModal = (booking) => {
  selectedBooking.value = { ...booking }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  selectedBooking.value = null
}

// Update booking status from dropdown
const updateBookingStatus = async (bookingId, newStatus) => {
  const result = await bookingsStore.updateBookingStatus(bookingId, newStatus)
  
  if (result.success) {
    console.log(`✅ Status updated to ${newStatus}`)
  } else {
    console.error('❌ Failed to update status')
  }
}

// Handle status update from modal
const handleStatusUpdate = async (data) => {
  const result = await bookingsStore.updateBookingStatus(data.bookingId, data.newStatus)
  
  if (result.success) {
    console.log('✅ Status updated successfully')
    // Update selected booking if modal is open
    if (selectedBooking.value && selectedBooking.value.id === data.bookingId) {
      selectedBooking.value.status = data.newStatus
    }
  }
}

// Handle save notes from modal
const handleSaveNotes = async (data) => {
  const result = await bookingsStore.updateBookingNotes(data.bookingId, data.notes)
  
  if (result.success) {
    console.log('✅ Notes saved successfully')
    // Update selected booking if modal is open
    if (selectedBooking.value && selectedBooking.value.id === data.bookingId) {
      selectedBooking.value.notes = data.notes
    }
  }
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
.bookings-view {
  width: 100%;
  min-height: 100%;
}

.fbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Clickable row */
.booking-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.booking-row:hover {
  background-color: var(--sand) !important;
}

/* Status Dropdown Styling */
.status-dropdown {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.status-dropdown:hover {
  opacity: 0.8;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.status-confirmed {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.status-reschedule {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.status-checkedin {
  background-color: #cce5ff;
  color: #004085;
  border-color: #b8daff;
}

.status-checkedout {
  background-color: #e2e3e5;
  color: #383d41;
  border-color: #d6d8db;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

/* View Button */
.view-btn {
  background: var(--blue);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all var(--tr);
}

.view-btn:hover {
  background: #1d4d7a;
  transform: translateY(-1px);
}

.view-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}
</style>