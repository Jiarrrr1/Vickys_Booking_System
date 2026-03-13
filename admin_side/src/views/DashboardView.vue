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

        <!-- Upcoming Bookings (next 7 days) -->
        <StatCard :value="upcomingBookings.length" label="Upcoming (7 days)" color-class="ca"
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
              <div class="card-title">Today's Bookings</div>
              <div class="card-sub">Showing reservations for {{ formatTodayDate() }}</div>
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
                    <th>Booking Date</th>
                    <th>Reservation Type</th>
                    <th style="text-align: center;">Status</th>
                    <th>Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="booking in todaysBookings" :key="booking.id" @click="openBookingModal(booking)">
                    <td class="tdm">#{{ String(booking.id).padStart(4, '0') }}</td>
                    <td class="tdn">{{ booking.guest }}</td>
                    <td>{{ booking.roomName }}</td>
                    <td style="text-align:center;">{{ booking.guestQuantity }}</td>
                    <td><strong>{{ formatDate(booking.bookingDate) }}</strong></td>
                    <td>
                      <span class="reservation-badge" :class="getReservationTypeClass(booking.reservationType)">
                        {{ booking.reservationType || 'Day Time' }}
                      </span>
                    </td>
                    <td style="text-align: center;" @click.stop>
                      <select 
                        class="status-dropdown" 
                        :class="getStatusClass(booking.status)" 
                        :value="booking.status"
                        @change="updateBookingStatus(booking.id, $event.target.value)"
                        :disabled="updatingStatusFor === booking.id"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-in">Checked-in</option>
                        <option value="Success">Succes</option>
                        <!-- <option value="Re-schedule">Re-schedule</option> -->
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
                <p>There are no reservations scheduled for {{ formatTodayDate() }}.</p>
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
      @payment-success="handlePaymentSuccess"
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
    'Re-schedule': 'status-reschedule',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

// Get reservation type class for styling
const getReservationTypeClass = (type) => {
  const classes = {
    'Day Time': 'type-day',
    'Night Time': 'type-night',
    'Full Day': 'type-full'
  }
  return classes[type] || 'type-day'
}

// Format today's date for display
const formatTodayDate = () => {
  const today = new Date()
  return today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
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

// Handle payment success from modal
const handlePaymentSuccess = ({ bookingId, amount, newBalance }) => {
  console.log(`💰 Payment processed for booking #${bookingId}: ₱${amount}, new balance: ₱${newBalance}`)
  
  // Optionally refresh bookings or show a success message
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
  
  try {
    // Handle YYYY-MM-DD format
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    // Handle Date objects or timestamps
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

// Filtered bookings based on today's date
// Filtered bookings based on today's date
const todaysBookings = computed(() => {
  if (!bookingsService.bookings.length) {
    console.log('📊 No bookings in service')
    return []
  }

  // Get today's date in YYYY-MM-DD using local time (NOT UTC)
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`
  
  console.log('📅 Today (local):', todayStr)
  console.log('📋 Sample booking:', bookingsService.bookings[0])

  const filtered = bookingsService.bookings.filter(booking => {
    // bookingDate should already be in YYYY-MM-DD format from transformBooking
    const bookingDate = booking.bookingDate
    return bookingDate === todayStr
  }).sort((a, b) => {
    return (a.bookingDate || '').localeCompare(b.bookingDate || '')
  })
  
  console.log(`📊 Found ${filtered.length} bookings for today`)
  return filtered
})

// Upcoming bookings (next 7 days)
const upcomingBookings = computed(() => {
  if (!bookingsService.bookings.length) {
    console.log('📊 No bookings in service for upcoming')
    return []
  }

  // Get today's date in YYYY-MM-DD using local time
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  // Get date 7 days from now
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)
  const laterYear = sevenDaysLater.getFullYear()
  const laterMonth = String(sevenDaysLater.getMonth() + 1).padStart(2, '0')
  const laterDay = String(sevenDaysLater.getDate()).padStart(2, '0')
  const sevenDaysLaterStr = `${laterYear}-${laterMonth}-${laterDay}`

  console.log('📅 Date range:', todayStr, 'to', sevenDaysLaterStr)

  const filtered = bookingsService.bookings.filter(booking => {
    const bookingDate = booking.bookingDate
    // Only include future bookings (>= today) and within 7 days
    return bookingDate >= todayStr && bookingDate <= sevenDaysLaterStr
  })
  
  console.log(`📊 Found ${filtered.length} upcoming bookings`)
  return filtered
})

onMounted(async () => {
  // Fetch bookings
  await bookingsService.fetchBookings()
  // Debug: Log all bookings and their dates
  console.log('📋 All bookings after fetch:', bookingsService.bookings.map(b => ({
    id: b.id,
    guest: b.guest,
    bookingDate: b.bookingDate,
    room: b.room
  })))
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

.status-reschedule {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

/* Reservation type badge styles */
.reservation-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
}

.type-day {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type-night {
  background-color: #e8eaf6;
  color: #3f51b5;
}

.type-full {
  background-color: #f3e5f5;
  color: #7b1fa2;
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