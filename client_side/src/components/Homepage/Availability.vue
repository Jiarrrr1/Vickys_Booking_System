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
          <div class="cal-header">
            <button class="cal-nav" @click="prevMonth">‹</button>
            <div class="cal-month">{{ currentMonthName }} {{ currentYear }}</div>
            <button class="cal-nav" @click="nextMonth">›</button>
          </div>
          <div class="cal-legend">
            <div class="legend-item"><div class="legend-dot available"></div> Available</div>
            <div class="legend-item"><div class="legend-dot booked"></div> Booked</div>
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
                   :class="{
                     'booked': isDateBooked(day),
                     'today': isToday(day)
                   }"
                   @click="handleDateClick(day)">
                {{ day }}
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
          <h3>Bookings on {{ formatSelectedDate }}</h3>
          <button class="date-modal-close" @click="closeDateModal">✕</button>
        </div>
        
        <div class="date-modal-body">
          <div v-if="bookedRoomsOnDate.length === 0" class="no-bookings">
            <div class="no-bookings-icon">📅</div>
            <p>No rooms booked on this date</p>
            <small>All rooms are available for booking</small>
          </div>
          
          <div v-else class="bookings-list">
            <div v-for="booking in bookedRoomsOnDate" :key="booking.id" class="booking-card">
              <div class="booking-room-name">{{ booking.roomName }}</div>
              <div class="booking-details">
                <!-- <div class="booking-detail">
                  <span class="detail-label">Guest:</span>
                  <span class="detail-value">{{ booking.guestName }}</span>
                </div> -->
                <div class="booking-detail">
                  <span class="detail-label">Check-in:</span>
                  <span class="detail-value">{{ formatDate(booking.checkIn) }}</span>
                </div>
                <div class="booking-detail">
                  <span class="detail-label">Check-out:</span>
                  <span class="detail-value">{{ formatDate(booking.checkOut) }}</span>
                </div>
                <!-- <div class="booking-status" :class="booking.status">
                  {{ booking.status }}
                </div> -->
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
import { reservations } from '@/data/reservations'

export default {
  setup() {
    // Current date state
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    const showDateModal = ref(false)
    
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
      return firstDay // 0 = Sunday, 1 = Monday, etc.
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

    // Get all rooms booked on selected date
    const bookedRoomsOnDate = computed(() => {
      if (!selectedDate.value) return []
      
      const dateStr = selectedDate.value.toISOString().split('T')[0]
      
      return reservations.filter(reservation => {
        const checkIn = new Date(reservation.checkIn)
        const checkOut = new Date(reservation.checkOut)
        const current = new Date(dateStr)
        
        // Set time to midnight for accurate comparison
        checkIn.setHours(0, 0, 0, 0)
        checkOut.setHours(0, 0, 0, 0)
        current.setHours(0, 0, 0, 0)
        
        // Check if current date falls within reservation range
        return current >= checkIn && current < checkOut
      })
    })
    
    // Function to check if a date is booked (any room)
    const isDateBooked = (day) => {
      const dateStr = formatDateString(currentYear.value, currentMonth.value + 1, day)
      
      return reservations.some(reservation => {
        const checkIn = new Date(reservation.checkIn)
        const checkOut = new Date(reservation.checkOut)
        const currentDate = new Date(dateStr)
        
        // Set time to midnight for accurate comparison
        checkIn.setHours(0, 0, 0, 0)
        checkOut.setHours(0, 0, 0, 0)
        currentDate.setHours(0, 0, 0, 0)
        
        // Check if current date falls within reservation range
        return currentDate >= checkIn && currentDate < checkOut
      })
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
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    // Handle date click - show modal with bookings
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
    
    // Navigation methods
    const prevMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
    }
    
    const nextMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
    }
    
    // Initialize calendar
    onMounted(() => {
      console.log('Total reservations:', reservations.length)
    })
    
    return {
      currentYear,
      currentMonth,
      currentMonthName,
      daysInMonth,
      startDay,
      isDateBooked,
      isToday,
      handleDateClick,
      prevMonth,
      nextMonth,
      showDateModal,
      closeDateModal,
      formatSelectedDate,
      bookedRoomsOnDate,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Date Modal Overlay */
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

/* Date Modal */
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

/* No Bookings State */
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

/* Bookings List */
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

.booking-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 8px;
  align-self: flex-start;
}

.booking-status.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.booking-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.booking-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Calendar day hover effect */
.cal-day {
  cursor: pointer;
}

.cal-day:not(.empty):not(.booked):hover {
  background: #f3f4f6;
}

.cal-day.booked:hover {
  opacity: 0.8;
}
</style>