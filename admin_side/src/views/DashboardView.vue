<template>
  <div class="dashboard-view">
    <section class="section fu">
      <!-- Stat Cards Row -->
      <div class="stats-grid">
        <!-- Total Bookings -->
        <StatCard :value="bookingsService.totalBookings" label="Total Bookings" color-class="cb" badge="+15%"
          class="fu1">
          <template #icon>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" fill="none" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" fill="none" />
            </svg>
          </template>
        </StatCard>

        <!-- Today's Bookings -->
        <StatCard :value="todaysBookings.length" label="Today's Bookings" color-class="cg" badge="+12%" class="fu2">
          <template #icon>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none" />
            </svg>
          </template>
        </StatCard>

        <!-- Upcoming Check-ins (next 7 days) -->
        <StatCard :value="upcomingBookings.length" label="Upcoming Check-ins" color-class="ca"
          :badge="`+${upcomingBookings.length}`" class="fu3">
          <template #icon>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" fill="none" />
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Recent Bookings Table -->
      <div class="dash-grid-single fu5">
        <div class="card">
          <!-- Card Header -->
          <div class="card-head">
            <div>
              <div class="card-title">Recent Bookings</div>
              <div class="card-sub">Showing today's check-ins</div>
            </div>
            <router-link to="/bookings" class="btn-g">
              View all
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M5 12h14" stroke="currentColor" stroke-width="2" />
                <path d="m12 5 7 7-7 7" stroke="currentColor" stroke-width="2" />
              </svg>
            </router-link>
          </div>

          <!-- Table -->
          <div class="twrap">
            <!-- Loading State -->
            <div v-if="bookingsService.isLoading" class="empty-state">
              <div class="loading-spinner"></div>
              <p style="margin-top: 16px;">Loading bookings...</p>
            </div>

            <!-- Table Content -->
            <template v-else>
              <table v-if="todaysBookings.length > 0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Guest Name</th>
                    <th>Room</th>
                    <th>Guests</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th >Status</th>
                    <th>Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="booking in todaysBookings" :key="booking.id" @click="openBookingModal(booking)">
                    <td class="tdm">#{{ String(booking.id).padStart(4, '0') }}</td>
                    <td class="tdn">{{ booking.guest }}</td>
                    <td>{{ booking.room }}</td>
                    <td style="text-align:center;">{{ booking.guests }}</td>
                    <td><strong>{{ formatDate(booking.checkIn) }}</strong></td>
                    <td>{{ formatDate(booking.checkOut) }}</td>
                    <td @click.stop>
                      <select 
                        class="status-dropdown" 
                        :class="getStatusClass(booking.status)" 
                        :value="booking.status"
                        @change="updateBookingStatus(booking.id, $event.target.value)"
                        :disabled="updatingStatusFor === booking.id"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Checked-out">Checked-out</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style="color:var(--t3);font-size:12.5px;">
                      {{ formatDate(booking.bookedOn) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" />
                  <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" />
                </svg>
                <h3>No Bookings Today</h3>
                <p>There are no check-ins scheduled for today.</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Booking Modal -->
    <BookingModal 
      :show="showBookingModal" 
      :booking="selectedBooking" 
      @close="closeBookingModal"
      @update-status="handleStatusUpdate" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import BookingModal from '@/modals/bookingModal.vue'
import bookingsService from '@/services/bookingService'

// Modal state
const showBookingModal = ref(false)
const selectedBooking = ref(null)
const updatingStatusFor = ref(null)

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Checked-in': 'status-checkedin',
    'Checked-out': 'status-checkedout',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

// Open modal with selected booking
const openBookingModal = (booking) => {
  console.log('Opening modal for booking:', booking)
  selectedBooking.value = { ...booking } // Create a copy to avoid reference issues
  showBookingModal.value = true
}

// Close modal
const closeBookingModal = () => {
  showBookingModal.value = false
  selectedBooking.value = null
}

// Update booking status from dropdown
const updateBookingStatus = async (bookingId, newStatus) => {
  console.log(`Updating booking #${bookingId} status to: ${newStatus}`)
  
  // Set loading state
  updatingStatusFor.value = bookingId
  
  const booking = bookingsService.bookings.find(b => b.id === bookingId)
  if (booking) {
    const oldStatus = booking.status
    booking.status = newStatus
    
    try {
      const result = await bookingsService.updateBookingStatus(bookingId, newStatus)
      
      if (result.success) {
        console.log(`✅ Booking #${bookingId} status updated successfully`)
        
        // If this booking is currently selected in modal, update it there too
        if (selectedBooking.value && selectedBooking.value.id === bookingId) {
          selectedBooking.value.status = newStatus
        }
      } else {
        // Revert on failure
        booking.status = oldStatus
        console.error('Failed to update status:', result.error)
        alert('Failed to update status. Please try again.')
      }
    } catch (error) {
      // Revert on error
      booking.status = oldStatus
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    } finally {
      // Clear loading state
      updatingStatusFor.value = null
    }
  } else {
    updatingStatusFor.value = null
  }
}

// Handle status update from modal
const handleStatusUpdate = async ({ bookingId, newStatus }) => {
  console.log(`Modal updating booking #${bookingId} status to: ${newStatus}`)
  
  const booking = bookingsService.bookings.find(b => b.id === bookingId)
  if (booking) {
    const oldStatus = booking.status
    booking.status = newStatus
    
    try {
      const result = await bookingsService.updateBookingStatus(bookingId, newStatus)
      
      if (result.success) {
        console.log(`✅ Booking #${bookingId} status updated via modal`)
        
        // Update selected booking if it's the same
        if (selectedBooking.value && selectedBooking.value.id === bookingId) {
          selectedBooking.value.status = newStatus
        }
      } else {
        booking.status = oldStatus
        console.error('Failed to update status:', result.error)
        alert('Failed to update status. Please try again.')
      }
    } catch (error) {
      booking.status = oldStatus
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    }
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

// Filtered bookings based on today's date
const todaysBookings = computed(() => {
  if (!bookingsService.bookings.length) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return bookingsService.bookings.filter(booking => {
    const checkIn = new Date(booking.checkIn)
    checkIn.setHours(0, 0, 0, 0)
    return checkIn.getTime() === today.getTime()
  }).sort((a, b) => {
    return new Date(a.checkIn) - new Date(b.checkIn)
  })
})

// Upcoming bookings (next 7 days)
const upcomingBookings = computed(() => {
  if (!bookingsService.bookings.length) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  return bookingsService.bookings.filter(booking => {
    const checkIn = new Date(booking.checkIn)
    return checkIn >= today && checkIn <= sevenDaysLater
  })
})

// Walk-ins
const walkIns = computed(() => {
  return bookingsService.bookings.filter(booking =>
    booking.method?.toLowerCase() === 'walk-in'
  ).length || 0
})

onMounted(async () => {
  // Fetch bookings
  await bookingsService.fetchBookings()
})
</script>

<style scoped>
.dash-grid-single {
  margin-top: 24px;
}

tr:hover {
  background: var(--sand);
  cursor: pointer;
}

.status-dropdown:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Status dropdown styles */
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

.status-dropdown:hover:not(:disabled) {
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

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid var(--sand);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>