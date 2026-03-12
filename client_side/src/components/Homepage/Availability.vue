<template>
  <section id="availability">
    <div class="avail-inner">
      <div class="avail-header">
        <div class="section-label"><span>Planning Your Visit</span></div>
        <h2>Check Room Availability</h2>
        <p>Select reservation type, choose your date, then pick an available room.</p>
      </div>

      <div class="avail-grid">
        <!-- Live Calendar Widget -->
        <div class="filter-btn-con">
          <!-- STEP 1: Reservation Type Filter -->
          <div class="reservation-type-filter">
            <button class="type-filter-btn" :class="{ active: reservationType === 'Day Time' }"
              @click="setReservationType('Day Time')">
              <span class="type-icon">🌞</span>
              <div class="type-info">
                <div class="type-name">Day Time</div>
                <div class="type-hours">6:00 AM - 6:00 PM</div>
              </div>
            </button>
            <button class="type-filter-btn" :class="{ active: reservationType === 'Night Time' }"
              @click="setReservationType('Night Time')">
              <span class="type-icon">🌙</span>
              <div class="type-info">
                <div class="type-name">Night Time</div>
                <div class="type-hours">6:00 PM - 6:00 AM</div>
              </div>
            </button>
            <button class="type-filter-btn" :class="{ active: reservationType === 'Full Day' }"
              @click="setReservationType('Full Day')">
              <span class="type-icon">☀️🌙</span>
              <div class="type-info">
                <div class="type-name">Full Day</div>
                <div class="type-hours">24 Hours</div>
              </div>
            </button>
          </div>

          <!-- Room Filter Buttons -->
          <div class="room-selector">
            <button v-for="room in rooms" :key="room.id" class="room-select-btn"
              :class="{ active: selectedRoomId === room.id }" @click="selectRoom(room.id)">
              <span class="room-icon">{{ room.icon }}</span>
              {{ room.shortName || room.name }}
              <span v-if="room.quantity > 1" class="quantity-badge">x{{ room.quantity }}</span>
            </button>
            <button class="room-select-btn" :class="{ active: selectedRoomId === 'all' }" @click="selectRoom('all')">
              All Rooms & Cottages
            </button>
          </div>
        </div>

          <!-- STEP 3: Available Rooms Panel (RIGHT SIDE) -->
        <div class="available-rooms-panel">
          <!-- Show when NO date selected -->
          <div v-if="!selectedDateStr" class="no-selection-state">
            <div class="selection-icon">📅</div>
            <h3>Select a Date</h3>
            <p>Choose a date from the calendar to see available rooms and cottages.</p>
            <div class="steps-guide">
              <div class="step-item">
                <span class="step-num">1</span>
                <span class="step-text">Pick reservation type</span>
              </div>
              <div class="step-item">
                <span class="step-num">2</span>
                <span class="step-text">Select date</span>
              </div>
              <div class="step-item">
                <span class="step-num">3</span>
                <span class="step-text">Choose room</span>
              </div>
            </div>
          </div>

          <!-- Show when date IS selected -->
          <div v-else class="rooms-selection-view">
            <div class="panel-header">
              <div>
                <h3>{{ formatSelectedDate }}</h3>
                <div class="reservation-type-badge">
                  <span class="badge-icon">{{ getReservationTypeInfo.icon }}</span>
                  {{ reservationType }}
                  <span class="badge-time">{{ getReservationTypeInfo.startTime }} - {{ getReservationTypeInfo.endTime
                    }}</span>
                </div>
              </div>
              <button class="change-date-btn" @click="clearDateSelection">Change Date</button>
            </div>

            <!-- Available Rooms List -->
            <div class="rooms-list">
              <h4>Available Rooms & Cottages</h4>

              <div v-if="availableRoomsOnDate.length === 0" class="no-rooms-available">
                <div class="no-rooms-icon">😞</div>
                <p>All rooms and cottages are fully booked for this date.</p>
                <small>Please select a different date or reservation type.</small>
              </div>

              <div v-for="item in availableRoomsOnDate" :key="item.id" class="room-card available">
                <div class="room-card-header">
                  <span class="room-card-icon">{{ item.icon }}</span>
                  <div class="room-card-info">
                    <h5>{{ item.name }}</h5>
                    <span class="room-card-capacity">{{ item.capacity }}</span>
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <span class="room-card-quantity">
                      {{ item.availableQuantity }}/{{ item.quantity }}
                    </span>
                    <button class="view-btn" @click="openRoomImages(item)">
    View
  </button>
                  </div>
                </div>

                <div class="room-card-details">
                  <div class="room-amenities">
                    <span v-for="(amenity, idx) in item.amenities.slice(0, 3)" :key="idx" class="amenity-tag">
                      {{ amenity }}
                    </span>
                  </div>
                  <div class="room-card-footer">
                    <span class="room-card-price">₱{{ item.price.toLocaleString() }}</span>
                    <button class="book-room-btn" @click="openBookingForRoom(item)">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              <!-- Fully Booked Rooms -->
              <div v-if="bookedRoomsOnDate.length > 0" class="booked-rooms-section">
                <h4>Fully Booked</h4>
                <div v-for="item in bookedRoomsOnDate" :key="item.id" class="room-card booked">
                  <div class="room-card-header">
                    <span class="room-card-icon">{{ item.icon }}</span>
                    <div class="room-card-info">
                      <h5>{{ item.name }}</h5>
                      <span class="room-card-capacity">{{ item.capacity }}</span>
                    </div>
                    <span class="room-card-quantity booked">
                      {{ item.bookedQuantity }}/{{ item.quantity }}
                    </span>
                  </div>
                  <div class="booked-badge">Fully Booked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-widget">
          <!-- STEP 2: Calendar Navigation -->
          <div class="cal-header">
            <button class="cal-nav" @click="prevMonth">‹</button>
            <div class="cal-month">{{ currentMonthName }} {{ currentYear }}</div>
            <button class="cal-nav" @click="nextMonth">›</button>
          </div>

          <!-- Dynamic Legend -->
          <div class="cal-legend">
            <div v-if="selectedRoomId === 'all'" class="legend-item">
              <div class="legend-dot available"></div> Available
            </div>
            <div v-if="selectedRoomId === 'all'" class="legend-item">
              <div class="legend-dot partially-booked"></div> Partially Booked
            </div>
            <div v-if="selectedRoomId === 'all'" class="legend-item">
              <div class="legend-dot fully-booked"></div> Fully Booked
            </div>
            <div style="display: flex; gap: 10px;" v-else>
              <div class="legend-item">
                <div class="legend-dot available"></div> Available
              </div>
              <div class="legend-item">
                <div class="legend-dot available-other"></div> Available (other type)
              </div>
              <div class="legend-item">
                <div class="legend-dot booked-same"></div> Booked (same type)
              </div>
              <div class="legend-item">
                <div class="legend-dot full-blocked"></div> Full Day Booked
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
            <div class="cal-days">
              <!-- Empty cells -->
              <div v-for="n in startDay" :key="'empty-' + n" class="cal-day empty"></div>

              <!-- Days -->
              <div v-for="day in daysInMonth" :key="day" class="cal-day" :class="getDayClasses(day)"
                @click="handleDateClick(day)">
                {{ day }}

                <!-- Booking type indicators (only for single room view) -->
                <!-- <div v-if="selectedRoomId !== 'all' && !isDatePast(day)" class="booking-indicators">
                  <span v-if="hasBookingForType(formatDateString(day), 'Day Time')" class="indicator day"
                    title="Booked for Day Time">🌞</span>
                  <span v-if="hasBookingForType(formatDateString(day), 'Night Time')" class="indicator night"
                    title="Booked for Night Time">🌙</span>
                  <span v-if="hasBookingForType(formatDateString(day), 'Full Day')" class="indicator full"
                    title="Booked for Full Day">🔴</span>
                </div> -->

                <!-- Availability badges (for "all rooms" view) -->
                <span v-if="!isDateDisabled(day) && selectedRoomId === 'all'" class="availability-badge">
                  {{ getAvailableCount(day) }}/{{ totalCapacity }}
                </span>
                <span v-else-if="isDatePast(day) && selectedRoomId === 'all'" class="past">
                </span>
                <span v-else-if="isDateDisabled(day) && selectedRoomId === 'all'" class="fully-booked-badge">
                  Full
                </span>
                
              </div>
            </div>
          </div>
        </div>

      
      </div>

      <!-- Policies Section (BOTTOM) -->
      <div class="policies-section">
        <div class="policies-header">
          <div class="section-label"><span>Important Notes</span></div>
          <h3>Terms & Booking Policies</h3>
          <p>Before completing your reservation, please review the following booking policies to ensure a smooth and
            enjoyable stay.</p>
        </div>

        <div class="policies-grid">
          <div class="policy-card">
            <span class="policy-icon">✦</span>
            <div class="policy-content">
              <h4>No Cancellations</h4>
              <p>Reservations are non-refundable, but may be rebooked to available future dates.</p>
            </div>
          </div>
          <div class="policy-card">
            <span class="policy-icon">✦</span>
            <div class="policy-content">
              <h4>Business Hours</h4>
              <p>Open daily: 6:00 AM - 10:00 PM</p>
            </div>
          </div>
          <div class="policy-card">
            <span class="policy-icon">✦</span>
            <div class="policy-content">
              <h4>Downpayment</h4>
              <p>A 50% reservation fee is required to confirm all bookings.</p>
            </div>
          </div>
          <div class="policy-card">
            <span class="policy-icon">✦</span>
            <div class="policy-content">
              <h4>Group Bookings</h4>
              <p>Special packages available for reunions and events. Contact us for details.</p>
            </div>
          </div>
        </div>

        <div class="policies-footer">
          <a class="btn-gold" href="/about">Read Full Policies & Terms</a>
        </div>
      </div>
    </div>
  </section>
<RoomImagesModal
    :show="showImagesModal"
    :room="selectedRoomForImages"
    @close="closeImagesModal"
    @book="handleBookFromImages"
  /></template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import RoomImagesModal from '@/modal/RoomImagesModal.vue';
import {
  rooms,
  RESERVATION_TYPE_INFO,
  getAvailableQuantity,
  isDateFullyBooked,
  isFullyBooked,
  getTotalAvailableCapacity,
  getTotalCapacity,
  getAvailabilityDetails
} from '@/data/rooms'

export default {
   components: {
    RoomImagesModal
  },
  props: {
    rooms: {
      type: Array,
      default: () => rooms
    }
  },

  emits: ['open-booking'],

  setup(props, { emit }) {
    // STATE
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    const selectedDateStr = ref(null)
    const reservations = ref([])
    const loading = ref(false)
    const selectedRoomId = ref('all')
    const reservationType = ref('Day Time')

    // Add these refs
    const showImagesModal = ref(false)
    const selectedRoomForImages = ref(null)
    
    // Add these methods
    const openRoomImages = (room) => {
      selectedRoomForImages.value = room
      showImagesModal.value = true
    }
    
    const closeImagesModal = () => {
      showImagesModal.value = false
      selectedRoomForImages.value = null
    }
    
    const handleBookFromImages = (room) => {
      openBookingForRoom(room)
    }

    // COMPUTED
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

    const formatSelectedDate = computed(() => {
      if (!selectedDateStr.value) return ''

      const [year, month, day] = selectedDateStr.value.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    })

    const getReservationTypeInfo = computed(() => {
      if (reservationType.value === 'Full Day') {
        return {
          label: 'Full Day',
          icon: '☀️🌙',
          startTime: '6:00 AM',
          endTime: '6:00 AM (next day)',
          duration: '24 hours'
        }
      }
      return RESERVATION_TYPE_INFO[reservationType.value]
    })

    const availabilityDetails = computed(() => {
      if (!selectedDateStr.value) return []

      return getAvailabilityDetails(selectedDateStr.value, reservationType.value, reservations.value)
    })

    const availableRoomsOnDate = computed(() => {
      return availabilityDetails.value.filter(item => item.isAvailable)
    })

    const bookedRoomsOnDate = computed(() => {
      return availabilityDetails.value.filter(item => item.isFullyBooked)
    })

    const totalCapacity = computed(() => {
      if (selectedRoomId.value !== 'all') {
        const room = props.rooms.find(r => r.id === selectedRoomId.value)
        return room ? room.quantity : 0
      }
      return getTotalCapacity()
    })

    // ==========================================
    // AVAILABILITY FUNCTIONS
    // ==========================================

    const formatDateString = (day) => {
      return `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const isDatePast = (day) => {
      const dateStr = formatDateString(day)
      const [year, month, dayNum] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, dayNum)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return date < today
    }

    const hasBookingForType = (dateString, type) => {
      if (!reservations.value.length) return false

      return reservations.value.some(res => {
        if (res.isDeleted || res.status === 'Cancelled') return false

        const bookingDate = res.bookingDate || res.checkIn
        if (!bookingDate) return false

        return bookingDate === dateString && res.reservationType === type
      })
    }

    const hasAnyReservation = (dateString) => {
      if (!reservations.value.length) return false

      return reservations.value.some(res => {
        if (res.isDeleted || res.status === 'Cancelled') return false

        const bookingDate = res.bookingDate || res.checkIn
        return bookingDate === dateString
      })
    }

    const isDateBlockedForCurrentType = (dateString) => {
      if (!reservations.value.length) return false

      // SPECIAL RULE: If current type is Full Day
      if (reservationType.value === 'Full Day') {
        // Full Day is blocked if ANY reservation exists
        return hasAnyReservation(dateString)
      }

      // For Day Time and Night Time:
      // 1. Check if there's a Full Day booking (blocks everything)
      if (hasBookingForType(dateString, 'Full Day')) {
        return true
      }

      // 2. Check if the same type is already booked
      return hasBookingForType(dateString, reservationType.value)
    }

    const isDateDisabled = (day) => {
      // CHANGE THIS LINE
      const dateStr = formatDateString(day)  // Instead of formatLocalDateString
      const [year, month, dayNum] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, dayNum)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) return true

      if (selectedRoomId.value !== 'all') {
        const available = getAvailableQuantity(selectedRoomId.value, dateStr, reservationType.value, reservations.value)
        return available === 0
      }

      return isDateFullyBooked(dateStr, reservationType.value, reservations.value)
    }

    const getAvailableCount = (day) => {
      // CHANGE THIS LINE
      const dateStr = formatDateString(day)  // Instead of formatLocalDateString

      if (selectedRoomId.value !== 'all') {
        return getAvailableQuantity(selectedRoomId.value, dateStr, reservationType.value, reservations.value)
      }

      return getTotalAvailableCapacity(dateStr, reservationType.value, reservations.value)
    }

    const getDayClasses = (day) => {
      // CHANGE THIS LINE
      const dateStr = formatDateString(day)  // Instead of formatLocalDateString
      const classes = []

      if (isToday(day)) classes.push('today')
      if (selectedDateStr.value === dateStr) classes.push('selected')

      if (isDatePast(day)) {
        classes.push('past')
        return classes
      }

      if (selectedRoomId.value === 'all') {
        if (isDateDisabled(day)) {
          classes.push('fully-booked')
        } else {
          const availableCount = getAvailableCount(day)
          const total = totalCapacity.value

          if (availableCount === 0) {
            classes.push('fully-booked')
          } else if (availableCount < total) {
            classes.push('partially-booked')
          } else {
            classes.push('available')
          }
        }
      } else {
        const availableCount = getAvailableCount(day)

        console.log(`Room ${selectedRoomId} on ${dateStr}:`, {
          availableCount,
          reservationType: reservationType.value
        })

        if (availableCount === 0) {
          classes.push('fully-booked')
        } else {
          classes.push('available')
        }
      }

      return classes
    }

    const isToday = (day) => {
      const today = new Date()
      return day === today.getDate() &&
        currentMonth.value === today.getMonth() &&
        currentYear.value === today.getFullYear()
    }

    // METHODS
    const setReservationType = (type) => {
      reservationType.value = type
      selectedDate.value = null
      selectedDateStr.value = null
      console.log('🔄 Reservation type changed to:', type)
    }

    const selectRoom = (roomId) => {
      selectedRoomId.value = roomId
      console.log('Selected room/cottage:', roomId)

      // Clear selected date when changing rooms
      selectedDate.value = null
      selectedDateStr.value = null
    }

    const handleDateClick = (day) => {
      const dateStr = formatDateString(day)

      if (isDateDisabled(day)) {
        console.log(`❌ Date ${dateStr} is not available`)
        return
      }

      selectedDateStr.value = dateStr

      const [year, month, dayNum] = dateStr.split('-').map(Number)
      selectedDate.value = new Date(year, month - 1, dayNum)

      console.log(`📅 Date selected: ${dateStr}`)
    }

    const clearDateSelection = () => {
      selectedDate.value = null
      selectedDateStr.value = null
    }

    const openBookingForRoom = (room) => {
      if (!selectedDateStr.value) {
        console.warn('⚠️ No date selected')
        return
      }

      console.log('🏠 Opening booking for:', room.name)
      console.log('📅 Date string:', selectedDateStr.value)
      console.log('⏰ Type:', reservationType.value)

      const [year, month, day] = selectedDateStr.value.split('-').map(Number)
      const bookingDate = new Date(year, month - 1, day)

      emit('open-booking', room, bookingDate, reservationType.value)
    }

    const prevMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
    }

    const fetchReservations = async () => {
      loading.value = true
      try {
        console.log('📋 Fetching reservations...')
        const response = await api.getAllReservations()
        const reservationsData = response.data || response

        if (Array.isArray(reservationsData)) {
          reservations.value = reservationsData.filter(res => !res.isDeleted)
          console.log(`✅ Loaded ${reservations.value.length} active reservations`)
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

    onMounted(() => {
      fetchReservations()
    })

    return {
      currentYear,
      currentMonth,
      currentMonthName,
      daysInMonth,
      startDay,
      selectedDate,
      selectedDateStr,
      formatSelectedDate,
      loading,
      rooms: props.rooms,
      selectedRoomId,
      reservationType,
      availabilityDetails,
      availableRoomsOnDate,
      bookedRoomsOnDate,
      getReservationTypeInfo,
      totalCapacity,
      setReservationType,
      selectRoom,
      isDateDisabled,
      isDatePast,
      getAvailableCount,
      getDayClasses,
      hasBookingForType,
      formatDateString,
      isToday,
      handleDateClick,
      clearDateSelection,
      openBookingForRoom,
      prevMonth,
      nextMonth,
      showImagesModal,
      selectedRoomForImages,
      openRoomImages,
      closeImagesModal,
      handleBookFromImages
    }
  }
}
</script>

<style scoped>
/* ========================================== */
/* FILTER BUTTON CONTAINER */
/* ========================================== */
.filter-btn-con {
  grid-area: 1 / 1 / 2 / 3;
}

/* ========================================== */
/* RESERVATION TYPE FILTER */
/* ========================================== */
.reservation-type-filter {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background: var(--charcoal-mid);
  border-radius: 8px;
}

.type-filter-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--charcoal);
  border: 2px solid var(--charcoal-border);
  color: var(--white);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-filter-btn:hover {
  border-color: var(--gold);
  background: rgba(201, 169, 110, 0.1);
}

.type-filter-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--charcoal);
}

.type-icon {
  font-size: 22px;
}

.type-info {
  text-align: left;
  flex: 1;
}

.type-name {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
}

.type-hours {
  font-size: 10px;
  opacity: 0.8;
}

/* ========================================== */
/* ROOM SELECTOR */
/* ========================================== */
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
  display: flex;
  align-items: center;
  gap: 6px;
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

.room-icon {
  font-size: 16px;
}

.quantity-badge {
  font-size: 10px;
  background: rgba(201, 169, 110, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

/* ========================================== */
/* CALENDAR STYLES */
/* ========================================== */
.cal-legend {
  background-color: var(--charcoal);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--white);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.available {
  background: #10b981;
}

.legend-dot.available-other {
  background: var(--gold);
}

.legend-dot.partially-booked {
  background: var(--gold);
}

.legend-dot.booked-same {
  background: #ef4444;
}

.legend-dot.fully-booked,
.legend-dot.booked {
  background: #ef4444;
}

.legend-dot.full-blocked {
  background: #ef4444;
  position: relative;
}

.legend-dot.full-blocked::after {
  content: 'F';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  color: white;
}

.cal-day.disabled {
  cursor: not-allowed;
  background: rgba(216, 80, 80, 0.318);
  color: var(--white);
  pointer-events: none;
}

.cal-day.selected {
  border: 2px solid var(--gold) !important;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.2);
}

.cal-day.past {
  font-size: 15px;
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(130, 130, 130, 0.279);
  color: #ffffff;
  pointer-events: none;
  border: 1px solid var(--charcoal);
}

.cal-day.available {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.cal-day.available-other-type {
  background: rgba(201, 169, 110, 0.15);
  border-color: var(--gold);
}

.cal-day.partially-booked {
  background: rgba(201, 169, 110, 0.15);
  border-color: var(--gold);
}

.cal-day.booked-same-type {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

.cal-day.fully-booked,
.cal-day.booked {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

.cal-day.full-day-blocked {
  background: rgba(239, 68, 68, 0.25);
  border-color: #ef4444;
  color: #ef4444;
  position: relative;
}

.cal-day.full-day-blocked::after {
  content: 'FULL';
  position: absolute;
  bottom: 2px;
  font-size: 7px;
  font-weight: bold;
  color: #ef4444;
  opacity: 0.8;
}

.availability-badge {
  display: block;
  font-size: 9px;
  color: var(--gold);
  margin-top: 2px;
  font-weight: 600;
}

.fully-booked-badge {
  display: block;
  font-size: 8px;
  color: #ef4444;
  margin-top: 2px;
  font-weight: 600;
}

/* Booking indicators */
.booking-indicators {
  display: flex;
  gap: 2px;
  justify-content: center;
  margin-top: 2px;
  font-size: 8px;
  line-height: 1;
}

.indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

.indicator.day {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.indicator.night {
  background: rgba(201, 169, 110, 0.2);
  color: var(--gold);
}

.indicator.full {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* ========================================== */
/* AVAILABLE ROOMS PANEL (RIGHT SIDE) */
/* ========================================== */
.available-rooms-panel {
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  max-height: 705px;
  overflow-y: auto;
    grid-area: 2 / 1 / 3 / 2;

  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

.available-rooms-panel::-webkit-scrollbar {
  width: 5px;
}

.available-rooms-panel::-webkit-scrollbar-thumb {
  background-color: var(--gold);
  border-radius: 5px;
}

.available-rooms-panel::-webkit-scrollbar-thumb:hover {
  cursor: pointer;
}

/* No Selection State */
.no-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  height: 100%;
}

.selection-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-selection-state h3 {
  color: var(--white);
  font-size: 24px;
  margin-bottom: 12px;
}

.no-selection-state p {
  color: var(--white);
  margin-bottom: 30px;
  max-width: 300px;
}

.steps-guide {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--charcoal);
  border-radius: 8px;
  border: 1px solid var(--charcoal-border);
}

.step-num {
  width: 32px;
  height: 32px;
  background: var(--gold);
  color: var(--charcoal);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  color: var(--white);
  font-size: 14px;
}

/* Rooms Selection View */
.rooms-selection-view {
  height: 100%;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--charcoal-border);
}

.panel-header h3 {
  color: var(--gold);
  font-size: 20px;
  margin-bottom: 8px;
  word-wrap: break-word;
  max-width: 100%;
}

.reservation-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(201, 169, 110, 0.15);
  border: 1px solid var(--gold);
  border-radius: 20px;
  font-size: 12px;
  color: var(--white);
}

.badge-icon {
  font-size: 14px;
}

.badge-time {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 4px;
}

.change-date-btn {
  background: var(--charcoal);
  border: 1px solid var(--charcoal-border);
  color: var(--white);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.change-date-btn:hover {
  border-color: var(--gold);
  background: rgba(201, 169, 110, 0.1);
}

/* Availability Summary */
.availability-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.summary-stat {
  background: var(--charcoal);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--charcoal-border);
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 4px;
}

.stat-value.booked-color {
  color: #ef4444;
}

.stat-value.available-color {
  color: #10b981;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: var(--white);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Rooms List */
.rooms-list h4 {
  color: var(--white);
  font-size: 14px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.no-rooms-available {
  text-align: center;
  padding: 40px 20px;
}

.no-rooms-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.no-rooms-available p {
  color: var(--white);
  margin-bottom: 8px;
}

.no-rooms-available small {
  color: var(--white-soft);
  font-size: 13px;
}

/* Room Cards */
.room-card {
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 4px;
  padding: 24px 24px 20px;
  margin-bottom: 30px;
  transition: transform 0.35s, border-color 0.3s;
}

.room-card.available:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 169, 110, 0.4);
}

.room-card.booked {
  opacity: 0.6;
  border-color: #ef4444;
}

.room-card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.room-card-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.room-card-info {
  flex: 1;
}

.room-card-info h5 {
  font-family: 'Playfair Display', serif;
  color: var(--white);
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.room-card-capacity {
  color: var(--teal);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.room-card-quantity {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.room-card-quantity.booked {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.view-btn {
  background: var(--gold);
  color: var(--charcoal);
  border: 2px solid var(--gold);
  padding: 10px 24px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn:hover {
  background: transparent;
  color: var(--gold);
}

.room-card-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.room-amenities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.amenity-tag {
  font-size: 12px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--charcoal-border);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  gap: 6px;
}

.room-card-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--charcoal-border);
  padding-top: 16px;
}

.room-card-price {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--gold);
}

.book-room-btn {
  background: var(--gold);
  color: var(--charcoal);
  border: 2px solid var(--gold);
  padding: 10px 24px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
}

.book-room-btn:hover {
  background: transparent;
  color: var(--gold);
}

.booked-rooms-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--charcoal-border);
}

.booked-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  color: #ef4444;
  font-size: 15px;
  font-weight: 600;
}

/* ========================================== */
/* POLICIES SECTION (BOTTOM) */
/* ========================================== */
.policies-section {
  margin-top: 60px;
  padding: 40px;
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 12px;
}

.policies-header h3 {
  font-size: 32px;
  color: var(--white);
  margin-bottom: 12px;
  font-family: 'Cormorant Garamond', serif;
}

.policies-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 30px;
}

.policy-card {
  background: var(--charcoal);
  border: 1px solid var(--charcoal-border);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s;
}

.policy-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.policy-icon {
  color: var(--gold);
  font-size: 24px;
  flex-shrink: 0;
}

.policy-content h4 {
  color: var(--white);
  font-size: 16px;
  margin: 0 0 8px 0;
}

.policy-content p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.policies-footer {
  text-align: center;
}

/* ========================================== */
/* BASE STYLES */
/* ========================================== */
#availability {
  background: var(--charcoal);
  padding: 80px 0;
}

.avail-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.avail-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-label {
  margin-bottom: 12px;
}

.section-label span {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(201, 169, 110, 0.15);
  border: 1px solid var(--gold);
  color: var(--gold);
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-radius: 20px;
}

.avail-header h2 {
  font-size: 42px;
  color: var(--white);
  margin-bottom: 16px;
  font-family: 'Cormorant Garamond', serif;
}

.avail-header p {
  font-size: 16px;
  color: var(--text-muted);
  max-width: 700px;
  margin: 0 auto;
}

.avail-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
  align-items: start;
}

.calendar-widget {
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 12px;
  padding: 24px;
    grid-area: 2 / 2 / 3 / 3;

}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cal-nav {
  background: none;
  border: 1px solid var(--charcoal-border);
  color: var(--gold);
  font-size: 20px;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.cal-nav:hover {
  background: rgba(201, 169, 110, 0.1);
  border-color: var(--gold);
}

.cal-month {
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
}

.cal-grid {
  width: 100%;
}

.cal-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.cal-day-name {
  text-align: center;
  font-size: 12px;
  color: var(--white);
  font-weight: 600;
  padding: 8px 0;
}

.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--white);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.cal-day.empty {
  cursor: default;
  background: transparent;
}

.cal-day:not(.empty):not(.disabled):hover {
  border-color: var(--gold);
  transform: scale(1.05);
}

.cal-day.today {
  border: 2px solid var(--gold);
  font-weight: 700;
}

.btn-gold {
  display: inline-block;
  padding: 14px 32px;
  background: var(--gold);
  color: var(--charcoal);
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s;
  text-align: center;
}

.btn-gold:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);
}

/* RESPONSIVE */
@media (max-width: 968px) {
  .avail-grid {
    grid-template-columns: 1fr;
  }

  .policies-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .avail-header h2 {
    font-size: 32px;
  }

  .calendar-widget {
    padding: 16px;
  }

  .reservation-type-filter {
    grid-template-columns: 1fr;
  }

  .availability-summary {
    grid-template-columns: 1fr;
  }
}
</style>