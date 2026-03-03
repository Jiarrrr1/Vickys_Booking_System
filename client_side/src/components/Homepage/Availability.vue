<template>
  <section id="availability">
    <div class="avail-inner">
      <div class="avail-header">
        <div class="section-label"><span>Planning Your Visit</span></div>
        <h2>Check Room Availability</h2>
        <p>Select your preferred dates and we'll confirm your booking right away.</p>
      </div>

      <div class="avail-grid">
        <!-- Live Calendar Widget -->
        <div class="calendar-widget">
          <!-- Room Selector Buttons -->
          <div class="room-selector">
            <button 
              v-for="room in rooms" 
              :key="room.id"
              class="room-select-btn"
              :class="{ active: selectedRoomId === room.id }"
              @click="selectRoom(room.id)"
            >
              {{ room.name }}
            </button>
            <button 
              class="room-select-btn"
              :class="{ active: selectedRoomId === 'all' }"
              @click="selectRoom('all')"
            >
              All Rooms
            </button>
          </div>

          <div class="cal-header">
            <button class="cal-nav" @click="prevMonth">‹</button>
            <div class="cal-month">{{ currentMonthName }} {{ currentYear }}</div>
            <button class="cal-nav" @click="nextMonth">›</button>
          </div>
          
          <!-- Dynamic Legend based on selection -->
       <!-- Dynamic Legend based on selection -->
          <div class="cal-legend">
            <div v-if="selectedRoomId === 'all'" class="legend-item">
              <div class="legend-dot available"></div> Available (some rooms)
            </div>
            <div v-if="selectedRoomId === 'all'" class="legend-item">
              <div class="legend-dot fully-booked"></div> Fully Booked (all rooms)
            </div>
            <div v-else class="legend-item">
              <div  class="legend-item">
              <div class="legend-dot available"></div> Available
            </div>
            <div class="legend-item">
              <div class="legend-dot booked"></div> Booked
            </div>
            </div>
          </div>

          <div class="cal-grid">
            <div class="cal-days-header">
              <div class="cal-day-name">Sun</div>
              <div class="cal-day-name">Mon</div>
              <div class="cal-day-name">Tue</div>
              <div class="cal-day-name">Wed</div>
              <div class="cal-day-name">Thu</div>
              <div class="cal-day-name">Fri</div>
              <div class="cal-day-name">Sat</div>
            </div>
            <div class="cal-days" id="calDays">
              <!-- Empty cells for days before month starts -->
              <div v-for="n in startDay" :key="'empty-'+n" class="cal-day empty"></div>
              
              <!-- Actual days of the month -->
              <div v-for="day in daysInMonth" 
                   :key="day"
                   class="cal-day"
                   :class="getDayClasses(day)"
                   @click="handleDateClick(day)">
                {{ day }}
                <!-- Show room count when viewing all rooms -->
                <span v-if="selectedRoomId === 'all'" class="room-count-badge">
                  {{ getAvailableRoomsCount(day) }}/{{ rooms.length }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Policies -->
        <div class="policies-card">
          <div class="section-label"><span>Important Notes</span></div>
          <h3>Terms &amp; Booking Policies</h3>
          <p>Before completing your reservation, please review the following booking policies to ensure a smooth and enjoyable stay.</p>

          <div class="policy-item">
            <span class="policy-icon">✦</span>
            <div class="policy-text"><strong style="color:#fff">No Cancellations.</strong> Reservations are non-refundable, but may be rebooked to available future dates.</div>
          </div>
          <div class="policy-item">
            <span class="policy-icon">✦</span>
            <div class="policy-text"><strong style="color:#fff">Business Hours.</strong> Open daily: 6:00 AM - 10:00 PM</div>
          </div>
          <div class="policy-item">
            <span class="policy-icon">✦</span>
            <div class="policy-text"><strong style="color:#fff">Downpayment.</strong> A 50% reservation fee is required to confirm all bookings. This fee is applied to the total package cost and guarantees your selected date.</div>
          </div>
          <div class="policy-item">
            <span class="policy-icon">✦</span>
            <div class="policy-text"><strong style="color:#fff">Group Bookings.</strong> Special packages available for reunions and events. Contact us for details.</div>
          </div>

          <a class="btn-gold" href="/about">Read Full Policies</a>
        </div>
      </div>
    </div>

    <!-- Date Details Modal -->
    <div v-if="showDateModal" class="date-modal-overlay" @click="closeDateModal">
      <div class="date-modal" @click.stop>
        <div class="date-modal-header">
          <h3>
            <span v-if="selectedRoomId !== 'all'">{{ getSelectedRoomName() }} - </span>
            {{ formatSelectedDate }}
          </h3>
          <button class="date-modal-close" @click="closeDateModal">✕</button>
        </div>
        
        <div class="date-modal-body">
          <!-- Availability Summary for All Rooms View -->
          <div v-if="selectedRoomId === 'all'" class="availability-summary">
            <div class="summary-item">
              <span class="summary-label">Total Rooms:</span>
              <span class="summary-value">{{ rooms.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Booked:</span>
              <span class="summary-value">{{ bookedRoomsOnDate.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Available:</span>
              <span class="summary-value available">{{ rooms.length - bookedRoomsOnDate.length }}</span>
            </div>
          </div>

          <!-- Single Room View -->
          <div v-else-if="selectedRoomId !== 'all'">
            <div v-if="isRoomBookedOnSelectedDate(selectedRoomId)" class="room-status booked">
              <div class="status-icon">📅</div>
              <p>This room is booked on {{ formatSelectedDate }}</p>
            </div>
            <div v-else class="room-status available">
              <div class="status-icon">✅</div>
              <p>This room is available on {{ formatSelectedDate }}</p>
              <button class="book-now-btn" @click="openBookingForRoom">
                Book This Room
              </button>
            </div>
          </div>
          
          <!-- Booked Rooms List (for All Rooms view) -->
          <div v-if="selectedRoomId === 'all'" class="bookings-list">
            <h4 v-if="bookedRoomsOnDate.length > 0">Booked Rooms ({{ bookedRoomsOnDate.length }})</h4>
            <h4 v-else>All Rooms Available</h4>
            
            <div v-for="booking in bookedRoomsOnDate" :key="booking._id || booking.id" class="booking-card">
              <div class="booking-room-name">{{ booking.roomName }}</div>
              <div class="booking-details">
                <div class="booking-detail">
                  <span class="detail-label">Check-in:</span>
                  <span class="detail-value">{{ formatDate(booking.checkIn) }}</span>
                </div>
                <div class="booking-detail">
                  <span class="detail-label">Check-out:</span>
                  <span class="detail-value">{{ formatDate(booking.checkOut) }}</span>
                </div>
              </div>
            </div>

            <!-- Available Rooms Section -->
            <div v-if="rooms.length - bookedRoomsOnDate.length > 0" class="available-rooms-section">
              <h4>Available Rooms ({{ rooms.length - bookedRoomsOnDate.length }})</h4>
              <div class="available-rooms-list">
                <div v-for="room in getAvailableRoomsOnSelectedDate()" :key="room.id" class="available-room-item">
                  <span>{{ room.name }}</span>
                  <button class="small-book-btn" @click="openBookingForSpecificRoom(room)">
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import { rooms } from '@/data/rooms';

export default {
  props: {
    rooms: {
      type: Array,
      default: () => rooms
    }
  },
  
  emits: ['select-room', 'open-booking'],
  
  setup(props, { emit }) {
    // Current date state
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    const showDateModal = ref(false)
    const reservations = ref([])
    const loading = ref(false)
    const selectedRoomId = ref('all') // 'all' or specific room ID
    
    // Computed properties for calendar
    const currentYear = computed(() => currentDate.value.getFullYear())
    const currentMonth = computed(() => currentDate.value.getMonth())
    const currentMonthName = computed(() => {
      return currentDate.value.toLocaleString('default', { month: 'long' })
    })
    
    const daysInMonth = computed(() => {
      return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
    })
    
    const startDay = computed(() => {
      const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
      return firstDay
    })

    // Format selected date for display
    const formatSelectedDate = computed(() => {
      if (!selectedDate.value) return ''
      return selectedDate.value.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    })

    // Get selected room name
    const getSelectedRoomName = () => {
      if (selectedRoomId.value === 'all') return 'All Rooms'
      const room = props.rooms.find(r => r.id === selectedRoomId.value)
      return room ? room.name : 'Room'
    }

    // Select room
    const selectRoom = (roomId) => {
      selectedRoomId.value = roomId
      console.log('Selected room:', roomId)
    }

    // Check if a specific room is booked on a date
   const isRoomBookedOnDate = (roomId, dateStr) => {
  if (!reservations.value.length || roomId === 'all') return false
  
  const roomName = props.rooms.find(r => r.id === roomId)?.name
  if (!roomName) return false
  
  return reservations.value.some(reservation => {
    if (reservation.roomName !== roomName) return false
    
    const checkIn = new Date(reservation.checkIn)
    const checkOut = new Date(reservation.checkOut)
    const current = new Date(dateStr)
    
    checkIn.setHours(0, 0, 0, 0)
    checkOut.setHours(0, 0, 0, 0)
    current.setHours(0, 0, 0, 0)
    
    // Booked if current date is between checkIn and checkOut (INCLUSIVE)
    return current >= checkIn && current <= checkOut
  })
}


    // Check if selected room is booked on selected date
    const isRoomBookedOnSelectedDate = (roomId) => {
      if (!selectedDate.value) return false
      const dateStr = selectedDate.value.toISOString().split('T')[0]
      return isRoomBookedOnDate(roomId, dateStr)
    }

    // Get available rooms on selected date
    const getAvailableRoomsOnSelectedDate = () => {
      if (!selectedDate.value) return props.rooms
      
      const dateStr = selectedDate.value.toISOString().split('T')[0]
      const bookedRoomNames = new Set()
      
      reservations.value.forEach(reservation => {
        const checkIn = new Date(reservation.checkIn)
        const checkOut = new Date(reservation.checkOut)
        const current = new Date(dateStr)
        
        checkIn.setHours(0, 0, 0, 0)
        checkOut.setHours(0, 0, 0, 0)
        current.setHours(0, 0, 0, 0)
        
        if (current >= checkIn && current < checkOut) {
          bookedRoomNames.add(reservation.roomName)
        }
      })
      
      return props.rooms.filter(room => !bookedRoomNames.has(room.name))
    }

   // Get count of available rooms on a specific date
const getAvailableRoomsCount = (day) => {
  if (!reservations.value.length) return props.rooms.length
  
  const dateStr = formatDateString(currentYear.value, currentMonth.value + 1, day)
  const bookedRoomNames = new Set()
  
  reservations.value.forEach(reservation => {
    const checkIn = new Date(reservation.checkIn)
    const checkOut = new Date(reservation.checkOut)
    const current = new Date(dateStr)
    
    checkIn.setHours(0, 0, 0, 0)
    checkOut.setHours(0, 0, 0, 0)
    current.setHours(0, 0, 0, 0)
    
    // Count as booked if current date is between checkIn and checkOut (INCLUSIVE of checkOut)
    if (current >= checkIn && current <= checkOut) {
      bookedRoomNames.add(reservation.roomName)
    }
  })
  
  return props.rooms.length - bookedRoomNames.size
}

// Get CSS classes for a day cell
const getDayClasses = (day) => {
  const dateStr = formatDateString(currentYear.value, currentMonth.value + 1, day)
  const classes = []
  
  if (isToday(day)) classes.push('today')
  
  const availableCount = getAvailableRoomsCount(day)
  
  if (selectedRoomId.value === 'all') {
    // For all rooms view
    if (availableCount === 0) {
      classes.push('fully-booked')
    } else if (availableCount < props.rooms.length) {
      classes.push('partially-booked')
    }
  } else {
    // For single room view
    if (isRoomBookedOnDate(selectedRoomId.value, dateStr)) {
      classes.push('booked')
    }
  }
  
  return classes
}


    // Get all rooms booked on selected date
const bookedRoomsOnDate = computed(() => {
  if (!selectedDate.value || !reservations.value.length) return []
  
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  const bookedRooms = new Map()
  
  reservations.value.forEach(reservation => {
    const checkIn = new Date(reservation.checkIn)
    const checkOut = new Date(reservation.checkOut)
    const current = new Date(dateStr)
    
    checkIn.setHours(0, 0, 0, 0)
    checkOut.setHours(0, 0, 0, 0)
    current.setHours(0, 0, 0, 0)
    
    // CHANGE THIS LINE:
    // From: if (current >= checkIn && current < checkOut) {
    // To:
    if (current >= checkIn && current <= checkOut) {
      bookedRooms.set(reservation.roomName, reservation)
    }
  })
  
  return Array.from(bookedRooms.values())
})
    
    // Fetch reservations from API
    const fetchReservations = async () => {
      loading.value = true
      try {
        console.log('📋 Fetching reservations for availability...')
        const response = await api.getAllReservations()
        
        const reservationsData = response.data || response
        
        if (Array.isArray(reservationsData)) {
          reservations.value = reservationsData
          console.log(`✅ Loaded ${reservations.value.length} reservations`)
        } else {
          reservations.value = []
        }
      } catch (error) {
        console.error('❌ Error fetching reservations:', error)
        reservations.value = []
      } finally {
        loading.value = false
      }
    }
    
    // Check if date is today
    const isToday = (day) => {
      const today = new Date()
      return day === today.getDate() && 
             currentMonth.value === today.getMonth() && 
             currentYear.value === today.getFullYear()
    }
    
    // Format date as YYYY-MM-DD
    const formatDateString = (year, month, day) => {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    // Handle date click
    const handleDateClick = (day) => {
      const date = new Date(currentYear.value, currentMonth.value, day)
      selectedDate.value = date
      showDateModal.value = true
    }

    // Close modal
    const closeDateModal = () => {
      showDateModal.value = false
      selectedDate.value = null
    }
    
    // Open booking for specific room
    const openBookingForRoom = () => {
      closeDateModal()
      const room = props.rooms.find(r => r.id === selectedRoomId.value)
      if (room) {
        emit('open-booking', { room, date: selectedDate.value })
      }
    }

    const openBookingForSpecificRoom = (room) => {
      closeDateModal()
      emit('open-booking', { room, date: selectedDate.value })
    }
    
    // Navigation methods
    const prevMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
    }
    
    const nextMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
    }
    
    // Initialize
    onMounted(() => {
      fetchReservations()
    })
    
    return {
      // State
      currentYear,
      currentMonth,
      currentMonthName,
      daysInMonth,
      startDay,
      showDateModal,
      selectedDate,
      formatSelectedDate,
      bookedRoomsOnDate,
      loading,
      rooms: props.rooms,
      selectedRoomId,
      
      // Methods
      getDayClasses,
      isToday,
      handleDateClick,
      prevMonth,
      nextMonth,
      closeDateModal,
      formatDate,
      selectRoom,
      getSelectedRoomName,
      isRoomBookedOnSelectedDate,
      getAvailableRoomsOnSelectedDate,
      getAvailableRoomsCount,
      openBookingForRoom,
      openBookingForSpecificRoom
    }
  }
}
</script>



<style scoped>
/* Add these new styles while keeping your existing ones */
.room-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 10px;
  background: var(--charcoal-mid);
  border-radius: 8px;
}

.room-select-btn {
  padding: 8px 16px;
  background: var(--charcoal);
  border: 1px solid var(--charcoal-border);
  color: var(--white);
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.room-select-btn:hover {
  border-color: var(--gold);
  background: rgba(201, 169, 110, 0.1);
}

.room-select-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--charcoal);
}

/* Calendar day states */
.cal-day.fully-booked {
  background: rgba(220, 38, 38, 0.2);
  color: #ef4444;
  position: relative;
}

.cal-day.partially-booked {
  background: rgba(201, 169, 110, 0.15);
  color: var(--charcoal);
  position: relative;
}

.cal-day.partially-booked::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold) 50%, var(--charcoal-border) 50%);
}

.room-count-badge {
  display: block;
  font-size: 9px;
  color: var(--gold-muted);
  margin-top: 2px;
}

/* Legend updates */
.legend-dot.fully-booked {
  background: #ef4444;
}

.legend-dot.selected-room {
  background: var(--gold);
}

/* Availability Summary */
.availability-summary {
  display: flex;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.summary-value.available {
  color: #10b981;
}

/* Room Status */
.room-status {
  text-align: center;
  padding: 30px;
  border-radius: 8px;
}

.room-status.available {
  background: #d1fae5;
  color: #065f46;
}

.room-status.booked {
  background: #fee2e2;
  color: #991b1b;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Book Now Button */
.book-now-btn {
  background: var(--gold);
  color: var(--charcoal);
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;
  width: 100%;
}

.book-now-btn:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
}

/* Available Rooms Section */
.available-rooms-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.available-rooms-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.available-room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f9fafb;
  border-radius: 4px;
}

.small-book-btn {
  background: var(--gold);
  color: var(--charcoal);
  border: none;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 3px;
  cursor: pointer;
}

.small-book-btn:hover {
  background: var(--gold-light);
}

/* Your existing styles below */
.date-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.date-modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.date-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.date-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.date-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.date-modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.date-modal-body {
  padding: 24px;
  overflow-y: auto;
}

.no-bookings {
  text-align: center;
  padding: 40px 20px;
}

.no-bookings-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-bookings p {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-bookings small {
  font-size: 14px;
  color: #6b7280;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.booking-room-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #111827;
  font-weight: 600;
}

.cal-day {
  cursor: pointer;
}

.cal-day:not(.empty):not(.booked):not(.fully-booked):not(.partially-booked):hover {
  background: var(--gold-light);
}

.cal-day.booked:hover,
.cal-day.fully-booked:hover,
.cal-day.partially-booked:hover {
  background-color: var(--gold-light);
  
}

/* Your exact original styles - no changes */
.date-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.date-modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.date-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.date-modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.date-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.date-modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.date-modal-body {
  padding: 24px;
  overflow-y: auto;
}

.no-bookings {
  text-align: center;
  padding: 40px 20px;
}

.no-bookings-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-bookings p {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-bookings small {
  font-size: 14px;
  color: #6b7280;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.booking-room-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #111827;
  font-weight: 600;
}

.cal-day {
  cursor: pointer;
}

.cal-day:not(.empty):not(.booked):hover {
  background: var(--gold-light);
}

.cal-day.booked:hover {
  opacity: 0.8;
}
</style>