<template>
  <section id="availability">
    <div class="avail-inner">
      <div class="avail-header">
        <div class="section-label"><span>Planning Your Visit</span></div>
        <h2>Check Room Availability</h2>
        <p>Select reservation type, choose your date, choose your room in one page then book your room.</p>
      </div>

      <div class="avail-grid">
        <!-- Top Section: Reservation Type & Room Selector -->
        <div class="filter-btn-con">
          <!-- STEP 1: Reservation Type Filter -->
          <div class="reservation-type-filter">
            <button class="type-filter-btn" :class="{ active: reservationType === 'Day Time' }"
              @click="setReservationType('Day Time')">
              <span class="type-icon">🌞</span>
              <div class="type-info">
                <div class="type-name">Day Time</div>
                <div class="type-hours">8:00 AM - 4:00 PM</div>
              </div>
            </button>
            <button class="type-filter-btn" :class="{ active: reservationType === 'Night Time' }"
              @click="setReservationType('Night Time')">
              <span class="type-icon">🌙</span>
              <div class="type-info">
                <div class="type-name">Night Time</div>
                <div class="type-hours">5:00 PM - 1:00 AM</div>
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

          <!-- Room Selection Buttons -->
          <div class="room-selector">
            <button v-for="room in rooms" :key="room.id" class="room-select-btn"
              :class="{ active: selectedRoomId === room.id }" @click="selectRoom(room.id)">
              <span class="room-icon">{{ room.icon }}</span>
              {{ room.shortName || room.name }}
            </button>
          </div>
        </div>

        <!-- LEFT PANEL: Selected Room Details -->
        <div class="selected-room-panel">
          <!-- Show when NO room selected -->
          <div v-if="!selectedRoom" class="no-selection-state">
            <div class="selection-icon">🏠</div>
            <h3>Select a Room</h3>
            <p>Choose a room or cottage from above to see details and check availability.</p>
          </div>

          <!-- Show when room IS selected -->
          <div v-else class="room-selected-view">
            <!-- Simple Image Gallery -->
            <!-- Simple Image Gallery with Crossfade -->
<div class="simple-gallery">
  <div class="main-image-container">
    <div 
      v-for="(image, index) in roomImages" 
      :key="index"
      class="gallery-slide" 
      :class="{ 'active': currentImageIndex === index }"
    >
      <img 
        :src="image.url" 
        :alt="image.alt"
        class="main-image"
      />
    </div>
    
    <!-- Navigation Dots -->
    <div v-if="roomImages.length > 1" class="image-dots">
      <button 
        v-for="(_, index) in roomImages" 
        :key="index"
        class="dot"
        :class="{ active: currentImageIndex === index }"
        @click="goToImage(index)"
        @mouseenter="pauseAutoSlide"
        @mouseleave="startAutoSlide"
      ></button>
    </div>
    
    <!-- Image Counter -->
    <div class="image-counter">
      {{ currentImageIndex + 1 }}/{{ roomImages.length }}
    </div>
  </div>
</div>

            <!-- Room Details - Simple Listing Style -->
            <div class="room-details-simple">
              <div class="detail-row">
                <span class="detail-label">Room Name:</span>
                <span class="detail-value">{{ selectedRoom.name }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Capacity:</span>
                <span class="detail-value">{{ selectedRoom.capacity }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value price">₱{{ selectedRoom.price.toLocaleString() }}</span>
              </div>
              
              <div v-if="selectedRoom.quantity > 1" class="detail-row">
                <span class="detail-label">Available Units:</span>
                <span class="detail-value">{{ selectedRoom.quantity }}</span>
              </div>

              <div class="detail-row amenities">
                <span class="detail-label">Amenities:</span>
                <div class="amenities-list">
                  <span v-for="(amenity, idx) in selectedRoom.amenities" :key="idx" class="amenity-item">
                    {{ amenity }}
                  </span>
                </div>
              </div>

              <div class="detail-row description">
                <span class="detail-label">Description:</span>
                <p class="detail-value">{{ selectedRoom.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: Calendar -->
        <div class="calendar-widget">
          <!-- Calendar Navigation -->
          <div class="cal-header">
            <button class="cal-nav" @click="prevMonth">‹</button>
            <div class="cal-month">{{ currentMonthName }} {{ currentYear }}</div>
            <button class="cal-nav" @click="nextMonth">›</button>
          </div>

          <!-- Simplified Legend -->
          <div class="cal-legend">
            <div class="legend-item">
              <div class="legend-dot available"></div> Available
            </div>
            <div class="legend-item">
              <div class="legend-dot booked"></div> Booked
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
              <div 
                v-for="day in daysInMonth" 
                :key="day" 
                class="cal-day" 
                :class="getDayClasses(day)"
                @click="handleDateClick(day)"
              >
                {{ day }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Policies Section -->
      <div class="policies-section">
        <div class="policies-header">
          <div class="section-label"><span>Important Notes</span></div>
          <h3>Terms & Booking Policies</h3>
          <p>Before completing your reservation, please review the following booking policies.</p>
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
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '@/services/api'
import {
  rooms,
  getAvailableQuantity
} from '@/data/rooms'
import { getRoomImages } from '@/data/roomImages'

export default {
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
    const selectedRoomId = ref(1)
    const reservationType = ref('Full Day')

    
    // Image gallery
    const roomImages = ref([])
    const currentImageIndex = ref(0)
        // Auto-slide
const autoSlideInterval = ref(null)
const slideInterval = 3000 // 3 seconds

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
      return new Date(currentYear.value, currentMonth.value, 1).getDay()
    })

    const selectedRoom = computed(() => {
      return props.rooms.find(r => r.id === selectedRoomId.value)
    })

    const currentImage = computed(() => {
      if (roomImages.value.length === 0) return { url: '', alt: '' }
      return roomImages.value[currentImageIndex.value]
    })

    // ==========================================
    // IMAGE GALLERY
    // ==========================================
    const nextImage = () => {
  if (roomImages.value.length === 0) return
  currentImageIndex.value = (currentImageIndex.value + 1) % roomImages.value.length
}

const prevImage = () => {
  if (roomImages.value.length === 0) return
  currentImageIndex.value = (currentImageIndex.value - 1 + roomImages.value.length) % roomImages.value.length
}

const goToImage = (index) => {
  currentImageIndex.value = index
}

const startAutoSlide = () => {
  if (autoSlideInterval.value) clearInterval(autoSlideInterval.value)
  if (roomImages.value.length > 1) {
    autoSlideInterval.value = setInterval(() => {
      nextImage()
    }, slideInterval)
  }
}

const pauseAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}
 const loadRoomImages = (room) => {
  if (room) {
    roomImages.value = getRoomImages(room.roomId)
    currentImageIndex.value = 0
    startAutoSlide() // Add this line
  }
}

    // ==========================================
    // AVAILABILITY FUNCTIONS
    // ==========================================
    const formatDateString = (day) => {
      return `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const isDatePast = (day) => {
      const date = new Date(currentYear.value, currentMonth.value, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date < today
    }

    const isDateAvailableForRoom = (day) => {
      if (!selectedRoomId.value) return false
      
      const dateStr = formatDateString(day)
      if (isDatePast(day)) return false

      const available = getAvailableQuantity(
        selectedRoomId.value, 
        dateStr, 
        reservationType.value, 
        reservations.value
      )
      return available > 0
    }

    const getDayClasses = (day) => {
      const classes = []

      if (isToday(day)) classes.push('today')
      if (selectedDateStr.value === formatDateString(day)) classes.push('selected')
      if (isDatePast(day)) {
        classes.push('past')
        return classes
      }

      if (isDateAvailableForRoom(day)) {
        classes.push('available')
      } else {
        classes.push('booked')
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
    }

    const selectRoom = (roomId) => {
      selectedRoomId.value = roomId
      const room = props.rooms.find(r => r.id === roomId)
      loadRoomImages(room)
    }

    const handleDateClick = (day) => {
      if (!selectedRoomId.value) {
        alert('Please select a room first')
        return
      }
      
      const dateStr = formatDateString(day)

      if (isDatePast(day)) return

      selectedDateStr.value = dateStr
      const [year, month, dayNum] = dateStr.split('-').map(Number)
      selectedDate.value = new Date(year, month - 1, dayNum)

      const available = getAvailableQuantity(
        selectedRoomId.value, 
        dateStr, 
        reservationType.value, 
        reservations.value
      )

      if (available > 0) {
        openBookingModal()
      }
    }

const openBookingModal = () => {
  if (!selectedRoom.value || !selectedDate.value || !reservationType.value) return
  
  // Pass the reservations data
  emit('open-booking', selectedRoom.value, selectedDate.value, reservationType.value, reservations.value)
}

    const prevMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
    }

    const fetchReservations = async () => {
      try {
        const response = await api.getAllReservations()
        const reservationsData = response.data || response
        if (Array.isArray(reservationsData)) {
          reservations.value = reservationsData.filter(res => !res.isDeleted)
        }
      } catch (error) {
        console.error('Error fetching reservations:', error)
      }
    }

onMounted(() => {
  fetchReservations()
  const initialRoom = props.rooms.find(r => r.id === selectedRoomId.value)
  if (initialRoom) loadRoomImages(initialRoom)
})

// Add this for cleanup when component unmounts
onUnmounted(() => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
  }
})

    return {
      currentYear,
      currentMonth,
      currentMonthName,
      daysInMonth,
      startDay,
      selectedDateStr,
      rooms: props.rooms,
      selectedRoomId,
      selectedRoom,
      reservationType,
      roomImages,
      currentImageIndex,
      currentImage,
      nextImage,
  prevImage,
  goToImage,
  startAutoSlide,
  pauseAutoSlide,
      setReservationType,
      selectRoom,
      handleDateClick,
      prevMonth,
      nextMonth,
      isDatePast,
      getDayClasses,
      openBookingModal
    }
  }
}
</script>

<style scoped>
/* ========================================== */
/* BASE LAYOUT */
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

/* ========================================== */
/* MAIN GRID */
/* ========================================== */
.avail-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 30px;
  align-items: start;
}

.filter-btn-con {
  grid-area: 1 / 1 / 2 / 3;
}

/* ========================================== */
/* RESERVATION TYPE FILTER */
/* ========================================== */
.reservation-type-filter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  display: flex;
  align-items: center;
  gap: 6px;
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

.room-icon {
  font-size: 16px;
}

.quantity-badge {
  margin-left: 4px;
  padding: 2px 6px;
  background: rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  font-size: 10px;
}

/* ========================================== */
/* SELECTED ROOM PANEL */
/* ========================================== */
.selected-room-panel {
  grid-area: 2 / 1 / 3 / 2;
  padding: 20px;
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 12px;
  height: fit-content;
}

/* No Selection State */
.no-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.selection-icon {
  margin-bottom: 20px;
  font-size: 64px;
  opacity: 0.5;
}

.no-selection-state h3 {
  margin-bottom: 12px;
  color: var(--white);
  font-size: 24px;
}

.no-selection-state p {
  max-width: 300px;
  color: var(--white);
}

/* Simple Gallery */
.simple-gallery {
  margin-bottom: 20px;
}

.main-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.dot.active {
  background: var(--gold);
  transform: scale(1.2);
}

.image-counter {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 12px;
  font-size: 10px;
  z-index: 10;
}

/* Room Details - Simple Listing */
.room-details-simple {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid var(--charcoal-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 100px;
  color: var(--gold);
  font-size: 14px;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: var(--white);
  font-size: 14px;
}

.detail-value.price {
  color: var(--gold);
  font-weight: 600;
}

/* Amenities List */
.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.amenity-item {
  padding: 4px 12px;
  background: rgba(201, 169, 110, 0.1);
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 20px;
  color: var(--white);
  font-size: 12px;
}

/* Description */
.description p {
  margin: 0;
  line-height: 1.6;
}

/* ========================================== */
/* CALENDAR WIDGET */
/* ========================================== */
.calendar-widget {
  grid-area: 2 / 2 / 3 / 3;
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 12px;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 2px var(--charcoal-mid);
}

.cal-nav {
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--charcoal-border);
  border-radius: 6px;
  color: var(--gold);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.cal-nav:hover {
  background: rgba(201, 169, 110, 0.1);
  border-color: var(--gold);
}

.cal-month {
  color: var(--white);
  font-size: 18px;
  font-weight: 600;
}

.cal-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  padding: 12px;
  background: var(--charcoal);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--white);
  font-size: 11px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.available {
  background: #10b981;
}

.legend-dot.booked {
  background: #ef4444;
}

.cal-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.cal-day-name {
  padding: 8px 0;
  color: var(--white);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
}

.cal-day.empty {
  background: transparent;
  cursor: default;
}

.cal-day:not(.empty):hover {
  border: 1px solid var(--gold);
}

.cal-day.today {
  border: 2px solid var(--gold);
  font-weight: 700;
}

.cal-day.past {
  background: rgba(130, 130, 130, 0.279);
  cursor: not-allowed;
  opacity: 0.4;
  pointer-events: none;
}

.cal-day.available {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
}

.cal-day.booked {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #ef4444;
  cursor: not-allowed;
}

.cal-day.selected {
  border: 2px solid var(--gold) !important;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.2);
}

/* ========================================== */
/* POLICIES SECTION */
/* ========================================== */
.policies-section {
  margin-top: 60px;
  padding: 40px;
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 12px;
}

.policies-header {
  text-align: center;
  margin-bottom: 30px;
}

.policies-header h3 {
  margin-bottom: 12px;
  color: var(--white);
  font-size: 32px;
  font-family: 'Cormorant Garamond', serif;
}

.policies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.policy-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--charcoal);
  border: 1px solid var(--charcoal-border);
  border-radius: 8px;
  transition: all 0.3s;
}

.policy-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.policy-icon {
  color: var(--gold);
  font-size: 24px;
}

.policy-content h4 {
  margin: 0 0 8px;
  color: var(--white);
  font-size: 16px;
}

.policy-content p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.policies-footer {
  text-align: center;
}

.btn-gold {
  display: inline-block;
  padding: 12px 30px;
  background: var(--gold);
  border-radius: 6px;
  color: var(--charcoal);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-gold:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);
}


/* ========================================== */
/* IMAGE ANIMATIONS */
/* ========================================== */

/* Fade Transition - Faster */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease; /* Changed from 0.5s to 0.2s */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Zoom Effect - Keep same or make faster if desired */
.zoom-effect {
  animation: zoomIn 6s ease-in-out infinite;
}

@keyframes zoomIn {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Update main-image class */
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ========================================== */
/* GALLERY CROSSFADE ANIMATION */
/* ========================================== */

.main-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: var(--charcoal);
}

.gallery-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  pointer-events: none;
}

.gallery-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Optional slow zoom effect (can be removed if not wanted) */
.gallery-slide.active .main-image {
  animation: slowZoom 8s ease-in-out infinite;
}

@keyframes slowZoom {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Image Dots - keep existing styles */
.image-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 20;
}

.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 20;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.dot.active {
  background: var(--gold);
  transform: scale(1.2);
}

.image-counter {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 20;
  backdrop-filter: blur(4px);
}

/* Remove old fade transition styles */
/* Delete or comment out these old styles:
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
*/
/* ========================================== */
/* RESPONSIVE */
/* ========================================== */
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

  .reservation-type-filter {
    grid-template-columns: 1fr;
  }
}
</style>