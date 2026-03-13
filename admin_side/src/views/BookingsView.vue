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

        <!-- Upcoming Bookings -->
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
              <option value="Rose Room">Rose Room</option>
              <option value="Tulip Room">Tulip Room</option>
              <option value="Callalily Room">Callalily Room</option>
              <option value="Stargazer Room">Family Suite</option>
              <!-- <option value="Bamboo Room">Bamboo Room</option> -->
              <option value="Garden Cottage">Garden Cottage</option>
            </select>

            <button class="create-btn" @click="openCreateModal">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Reservation
            </button>
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
                <th>Booking Date</th>
                <th>Reservation Type</th>
                <th style="text-align: center;">Status</th>
                <!-- <th style="text-align: center;">Edit</th> -->
                <th style="text-align: center;">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="booking in paginatedBookings" 
                :key="booking.id"
                class="booking-row"
                @click="openBookingModal(booking)"
              >
                <td class="tdm">#{{ String(booking.id).padStart(4, '0') }}</td>
                <td class="tdn">{{ booking.guest }}</td>
                <td>{{ booking.roomName }}</td>
                <td style="text-align:center;">{{ booking.guestQuantity }}</td>
                <td><strong>{{ formatDate(booking.bookingDate) }}</strong></td>
                <td>
                  <span class="reservation-type-badge" :class="getReservationTypeClass(booking.reservationType)">
                    {{ booking.reservationType || 'Day Time' }}
                  </span>
                </td>

                <!-- In BookingsView.vue, replace the status dropdown section (lines ~130-142) -->

<td style="text-align: center;" @click.stop>
  <span 
    class="status-badge" 
    :class="getStatusClass(booking.status)"
  >
    {{ booking.status }}
  </span>
</td>
<!-- 
                <td style="text-align: center;" @click.stop>
                  <button 
      class="edit-btn" 
      @click="openEditModal(booking)"
      title="Edit Reservation"
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    </button>
                </td> -->
                <td style="text-align: center;" @click.stop>
                  <button 
                    class="delete-btn" 
                    @click="confirmDelete(booking)"
                    title="Delete Booking"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
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
        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1 && !bookingsStore.isLoading">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <!-- Booking Details Modal -->
    <BookingModal
      :show="showModal"
      :booking="selectedBooking"
      @close="closeModal"
      @update-status="handleStatusUpdate"
      @save-notes="handleSaveNotes"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Delete Booking?"
      :message="`Are you sure you want to delete booking #${selectedDeleteBooking?.id} for ${selectedDeleteBooking?.guest}? This will move it to trash.`"
      confirm-text="Delete"
      type="danger"
      @confirm="confirmDeleteBooking"
      @close="showDeleteModal = false"
    />

    <!-- Feedback Modal (for success/error messages) -->
    <div v-if="showFeedbackModal" class="feedback-modal-overlay" @click="showFeedbackModal = false">
      <div class="feedback-modal" @click.stop>
        <div class="feedback-icon" :class="feedbackType">
          <span v-if="feedbackType === 'success'">✓</span>
          <span v-else-if="feedbackType === 'error'">✗</span>
          <span v-else>!</span>
        </div>
        <h3 class="feedback-title">{{ feedbackTitle }}</h3>
        <p class="feedback-message">{{ feedbackMessage }}</p>
        <button class="feedback-btn" @click="showFeedbackModal = false">OK</button>
      </div>
    </div>

    <CreateReservationModal
      :show="showCreateModal"
      @close="closeCreateModal"
      @success="handleNewReservation"
    />

    <!-- Add after CreateReservationModal -->
<!-- <EditReservationModal
  :show="showEditModal"
  :reservation-id="selectedEditBooking?.id"
  @close="closeEditModal"
  @updated="handleReservationUpdated"
/> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import bookingsService from '@/services/bookingService'
import StatCard from '@/components/StatCard.vue'
import BookingModal from '@/modals/bookingModal.vue'
import ConfirmationModal from '@/modals/confirmationModal.vue'
import CreateReservationModal from '@/modals/createModal.vue'

const bookingsStore = bookingsService

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const roomFilter = ref('')
const showModal = ref(false)
const selectedBooking = ref(null)
const showDeleteModal = ref(false)
const selectedDeleteBooking = ref(null)
const showFeedbackModal = ref(false)
const feedbackType = ref('success')
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const showCreateModal = ref(false)



// Format date helper with null/undefined check
const formatDate = (dateString) => {
  if (!dateString) return '—' // Return em dash if no date
  
  try {
    // Handle if it's already a formatted date string (YYYY-MM-DD)
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      if (!year || !month || !day) return 'Invalid date'
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthIndex = parseInt(month) - 1
      
      // Check if month index is valid
      if (monthIndex < 0 || monthIndex > 11) return 'Invalid date'
      
      return `${months[monthIndex]} ${parseInt(day)}, ${year}`
    }
    
    return 'Invalid date'
  } catch (error) {
    console.warn('Error formatting date:', dateString, error)
    return 'Invalid date'
  }
}

// Get status class for styling
const getStatusClass = (status) => {
  if (!status) return 'status-pending'
  
  const classes = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Re-schedule': 'status-reschedule',
    'Checked-in': 'status-checkedin',
    'Checked-out': 'status-checkedout',
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

// Filtered bookings based on search and filter
const filteredBookings = computed(() => {
  let filtered = [...bookingsStore.bookings]

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(booking => {
      return (
        (booking.guest && booking.guest.toLowerCase().includes(query)) ||
        (booking.room && booking.room.toLowerCase().includes(query))
      )
    })
  }

  // Apply room filter
  if (roomFilter.value) {
    filtered = filtered.filter(booking => {
      return booking.room === roomFilter.value
    })
  }

  // Sort by booking date
  return filtered.sort((a, b) => {
    return new Date(a.bookingDate) - new Date(b.bookingDate)
  })
})

// Paginated feedbacks
const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBookings.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredBookings.value.length / itemsPerPage)
)

// Show feedback modal
const showFeedback = (type, title, message) => {
  feedbackType.value = type
  feedbackTitle.value = title
  feedbackMessage.value = message
  showFeedbackModal.value = true
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

// Open create modal
const openCreateModal = () => {
  showCreateModal.value = true
}

// Close create modal
const closeCreateModal = () => {
  showCreateModal.value = false
}

// Handle new reservation
const handleNewReservation = async (newReservation) => {
  console.log('✅ New reservation created:', newReservation)
  
  // Refresh the bookings list
  try {
    await bookingsStore.fetchBookings()
    console.log('📋 Bookings list refreshed')
  } catch (error) {
    console.error('❌ Error refreshing bookings:', error)
  }
  
  closeCreateModal()
}

// Confirm delete
const confirmDelete = (booking) => {
  selectedDeleteBooking.value = booking
  showDeleteModal.value = true
}

// Confirm delete booking
const confirmDeleteBooking = async () => {
  if (!selectedDeleteBooking.value) return
  
  const result = await bookingsStore.deleteBooking(selectedDeleteBooking.value.id)
  
  if (result.success) {
    showFeedback('success', 'Deleted!', `Booking #${selectedDeleteBooking.value.id} has been moved to trash.`)
  } else {
    showFeedback('error', 'Delete Failed', result.error || 'Failed to delete booking')
  }
  
  showDeleteModal.value = false
  selectedDeleteBooking.value = null
}

// Update booking status from dropdown
const updateBookingStatus = async (bookingId, newStatus) => {
  const result = await bookingsStore.updateBookingStatus(bookingId, newStatus)
  
  if (result.success) {
    console.log(`✅ Status updated to ${newStatus}`)
    showFeedback('success', 'Status Updated', `Booking status changed to ${newStatus}`)
  } else {
    console.error('❌ Failed to update status')
    showFeedback('error', 'Update Failed', result.error || 'Failed to update status')
  }
}

// Handle status update from modal
const handleStatusUpdate = async (data) => {
  const result = await bookingsStore.updateBookingStatus(
    data.bookingId, 
    data.newStatus,
    data.newSchedule // ✅ Pass the new schedule date
  )
  
  if (result.success) {
    console.log('✅ Status updated successfully')
    if (selectedBooking.value && selectedBooking.value.id === data.bookingId) {
      selectedBooking.value.status = data.newStatus
      
      // ✅ Update booking date if it was rescheduled
      if (data.newSchedule) {
        selectedBooking.value.bookingDate = data.newSchedule
      }
    }
    
    // ✅ Refresh bookings to get latest data
    await bookingsStore.fetchBookings()
    
    const message = data.newSchedule 
      ? `Booking rescheduled to ${data.newSchedule}` 
      : `Booking status changed to ${data.newStatus}`
    
    showFeedback('success', 'Status Updated', message)
  } else {
    showFeedback('error', 'Update Failed', result.error || 'Failed to update status')
  }
}

// Handle save notes from modal
const handleSaveNotes = async (data) => {
  const result = await bookingsStore.updateBookingNotes(data.bookingId, data.notes)
  
  if (result.success) {
    console.log('✅ Notes saved successfully')
    if (selectedBooking.value && selectedBooking.value.id === data.bookingId) {
      selectedBooking.value.notes = data.notes
    }
    showFeedback('success', 'Notes Saved', 'Booking notes have been updated.')
  } else {
    showFeedback('error', 'Save Failed', result.error || 'Failed to save notes')
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
/* Add styles for reservation type badges */
.reservation-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
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

/* Delete Button */
.delete-btn {
  background: #dc3545;
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

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.delete-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

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

/* Feedback Modal Styles */
.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.feedback-modal {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.feedback-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
}

.feedback-icon.success {
  background: #d4edda;
  color: #28a745;
}

.feedback-icon.error {
  background: #f8d7da;
  color: #dc3545;
}

.feedback-icon.info {
  background: #e3f2fd;
  color: #3498db;
}

.feedback-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #333;
}

.feedback-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px;
  line-height: 1.6;
}

.feedback-btn {
  padding: 10px 30px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-btn:hover {
  background: #357abd;
  transform: translateY(-1px);
}

.edit-btn {
  background: #f59e0b;
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

.edit-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.edit-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid var(--border);
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: white;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all var(--tr);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.page-btn:hover:not(:disabled) {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: var(--text);
  font-weight: 500;
  font-size: 14px;
}
</style>