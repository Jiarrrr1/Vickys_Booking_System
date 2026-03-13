<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="create-reservation-modal" @click.stop>
        <div class="modal-header">
          <h2>Create New Reservation</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- STEP 1: Guest Information -->
          <div class="form-section">
            <h3>Step 1: Guest Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Full Name *</label>
                <input
                  id="fullName"
                  v-model="formData.fullName"
                  type="text"
                  required
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="juan@example.com"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phoneNumber">Phone Number *</label>
                <input
                  id="phoneNumber"
                  v-model="formData.phoneNumber"
                  type="tel"
                  required
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div class="form-group">
                <label for="guests">Number of Guests *</label>
                <input
                  id="guests"
                  v-model.number="formData.guests"
                  type="number"
                  :min="BOOKING_CONFIG.minGuests"
                  :max="BOOKING_CONFIG.maxGuests"
                  required
                />
              </div>
            </div>
          </div>

          <!-- STEP 2: Select Date and Reservation Type -->
          <div class="form-section">
            <h3>Step 2: Select Date & Reservation Type</h3>
            
            <div class="form-row">
              <!-- Reservation Type -->
              <div class="form-group">
                <label for="reservationType">Reservation Type *</label>
                <select 
                  id="reservationType" 
                  v-model="formData.reservationType" 
                  required
                  @change="handleReservationTypeChange"
                >
                  <option value="Day Time">Day Time (6AM - 6PM)</option>
                  <option value="Night Time">Night Time (6PM - 6AM)</option>
                  <option value="Full Day">Full Day (24 Hours)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="status">Status *</label>
                <select id="status" v-model="formData.status" required>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-in">Checked-in</option>
                </select>
              </div>
            </div>

            <!-- Calendar for Date Selection -->
            <div class="calendar-section">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="calendar-label">Select Date *</label>
                <small v-if="dateError" class="error-message">{{ dateError }}</small>
              </div>

              <!-- Month Navigation -->
              <div class="calendar-header">
                <button type="button" class="calendar-nav" @click="prevMonth">←</button>
                <span class="calendar-month">{{ currentMonthName }} {{ currentYear }}</span>
                <button type="button" class="calendar-nav" @click="nextMonth">→</button>
              </div>

              <!-- Day Names -->
              <div class="calendar-weekdays">
                <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
              </div>

              <!-- Calendar Days -->
              <div class="calendar-days">
                <!-- Empty cells -->
                <div v-for="n in startDay" :key="'empty-'+n" class="calendar-day empty"></div>
                
                <!-- Actual days -->
                <div 
                  v-for="day in daysInMonth" 
                  :key="day"
                  class="calendar-day"
                  :class="getDateClasses(day)"
                  @click="selectDate(day)"
                >
                  {{ day }}
                  <span v-if="!isPastDate(formatDateString(day))" class="availability-indicator">
                    {{ getDateAvailabilitySummary(day) }}
                  </span>
                </div>
              </div>

              <!-- Selected Date Display -->
              <div v-if="formData.bookingDate" class="selected-date-display">
                <span class="selected-label">Selected:</span>
                <span class="selected-value">{{ formatDisplayDate(formData.bookingDate) }}</span>
                <button type="button" class="clear-date" @click="clearDate">✕</button>
              </div>
            </div>

            <!-- Date Summary -->
            <div v-if="formData.bookingDate" class="date-summary">
              <div class="summary-stats">
                <div class="stat">
                  <span class="stat-label">Total Available:</span>
                  <span class="stat-value">{{ getTotalAvailableForDate }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Total Capacity:</span>
                  <span class="stat-value">{{ getTotalCapacity() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Room Selection (Only shown after date is selected) -->
          <div v-if="formData.bookingDate" class="form-section">
            <h3>Step 3: Select Available Room</h3>
            
            <!-- Availability hint -->
            <div class="availability-hint" :class="{ 
              'has-blocked': hasBlockedRooms,
              'loading': isLoadingReservations 
            }">
              <span class="hint-icon">{{ isLoadingReservations ? '⏳' : '🏨' }}</span>
              <span class="hint-text">{{ roomsAvailabilityHint }}</span>
            </div>

            <!-- Room Grid with Quantity Selection -->
            <div class="room-grid">
              <div
                v-for="room in roomsWithAvailability"
                :key="room.id"
                class="room-card"
                :class="{ 
                  selected: selectedRoomIds.includes(room.id),
                  'partially-available': room.availableQuantity > 0 && room.availableQuantity < room.quantity,
                  'unavailable': !room.isAvailable
                }"
                @click="toggleRoomSelection(room)"
              >
                <div class="room-icon">{{ room.icon }}</div>
                <div class="room-info">
                  <h4>{{ room.name }}</h4>
                  <p class="capacity">{{ room.capacity }}</p>
                  <p class="price">₱{{ room.price.toLocaleString() }}</p>
                  
                  <!-- Availability badge -->
                  <div 
                    class="availability-badge" 
                    :class="{
                      success: room.isAvailable && room.availableQuantity === room.quantity,
                      warning: room.isAvailable && room.availableQuantity < room.quantity,
                      unavailable: !room.isAvailable
                    }"
                  >
                    <span v-if="!room.isAvailable">🔴 Unavailable</span>
                    <span v-else>{{ room.availableQuantity }}/{{ room.quantity }} available</span>
                  </div>

                  <!-- Quantity Selector - Only show for rooms with multiple units and availability -->
                  <div v-if="room.isAvailable && room.quantity > 1" class="quantity-selector">
                    <button 
                      type="button" 
                      class="quantity-btn"
                      :disabled="getSelectedQuantity(room.id) <= 0"
                      @click.stop="decrementQuantity(room)"
                    >−</button>
                    <span class="quantity-value">{{ getSelectedQuantity(room.id) }}</span>
                    <button 
                      type="button" 
                      class="quantity-btn"
                      :disabled="getSelectedQuantity(room.id) >= room.availableQuantity"
                      @click.stop="incrementQuantity(room)"
                    >+</button>
                  </div>
                </div>
                <div v-if="selectedRoomIds.includes(room.id)" class="check-icon">✓</div>
              </div>
            </div>

            <!-- Selected Rooms Summary -->
            <div v-if="selectedRooms.length > 0" class="selected-rooms-summary">
              <h4>Selected Rooms:</h4>
              <div v-for="room in selectedRooms" :key="room.id" class="selected-room-item">
                <span>{{ room.name }} x{{ room.quantity }}</span>
                <span>₱{{ (room.price * room.quantity).toLocaleString() }}</span>
              </div>
            </div>

            <p v-if="selectedRooms.length === 0 && roomsWithAvailability.filter(r => r.isAvailable).length === 0" class="no-rooms-message">
              ⚠️ No rooms available for <strong>{{ formatDisplayDate(formData.bookingDate) }}</strong> - <strong>{{ formData.reservationType }}</strong>
              <br>
              <small>Try selecting a different date or reservation type.</small>
            </p>
            <p v-else-if="selectedRooms.length === 0" class="help-text">Please select at least one room to continue</p>
          </div>

          <!-- STEP 4: Payment Details (Only shown after rooms are selected) -->
          <div v-if="selectedRooms.length > 0 && formData.total > 0" class="form-section">
            <h3>Step 4: Payment Details</h3>
            
            <div class="form-row">
              <!-- Payment Type -->
              <div v-if="formData.status != 'Checked-in'" class="form-group">
                <label for="paymentType">Payment Type *</label>
                <select id="paymentType" v-model="formData.paymentType" required @change="updateRemainingBalance">
                  <option value="Downpayment">Downpayment (50%)</option>
                  <option value="Full Payment">Full Payment</option>
                </select>
              </div>

              <!-- Payment Method -->
              <div class="form-group">
                <label for="paymentMethod">Payment Method *</label>
                <select id="paymentMethod" v-model="formData.paymentMethod" required>
                  <option value="">Select payment method</option>
                  <option value="Gcash">Gcash</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <!-- Reference Number - Only show for Gcash -->
            <div class="form-row" v-if="formData.paymentMethod === 'Gcash'">
              <div class="form-group full-width">
                <label for="rfrncNumber">Reference Number <span class="required-star">*</span></label>
                <input
                  id="rfrncNumber"
                  v-model="formData.rfrncNumber"
                  type="text"
                  :required="formData.paymentMethod === 'Gcash'"
                  placeholder="Enter Gcash reference number"
                />
                <p class="help-text">Required for Gcash payments</p>
              </div>
            </div>

            <div class="pricing-summary">
              <!-- Show breakdown for each selected room -->
              <div v-for="room in selectedRooms" :key="room.id" class="summary-row">
                <span>{{ room.name }} x{{ room.quantity }}:</span>
                <strong>₱{{ (room.price * room.quantity).toLocaleString() }}</strong>
              </div>
              
              
              <div v-if="formData.paymentType === 'Downpayment'" class="summary-row">
                <span>Downpayment (50%):</span>
                <strong>₱{{ formData.downpayment.toLocaleString() }}</strong>
              </div>
              <div v-if="formData.paymentType === 'Downpayment'" class="summary-row">
                <span>Remaining Balance:</span>
                <strong>₱{{ formData.remainingBalance.toLocaleString() }}</strong>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <strong>₱{{ formData.total.toLocaleString() }}</strong>
              </div>
            </div>
          </div>

          <!-- Special Requests -->
          <div class="form-section">
            <h3>Additional Information (Optional)</h3>
            <div class="form-group">
              <textarea
                v-model="formData.request"
                rows="3"
                placeholder="Any special requests or notes..."
              ></textarea>
            </div>
          </div>

          <!-- Submit Footer -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
            <button 
              type="submit" 
              class="btn-submit" 
              :disabled="!isFormValid || isSubmitting"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Reservation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
  
  <FeedbackModal
    :show="showFeedback"
    :type="feedbackType"
    :title="feedbackTitle"
    :message="feedbackMessage"
    :details="feedbackDetails"
    button-text="OK"
    @close="handleFeedbackClose"
    @confirm="handleFeedbackConfirm"
  />
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { 
  rooms, 
  BOOKING_CONFIG, 
  calculateDownpayment, 
  calculateRemainingBalance,
  getAvailabilityDetails,
  getTotalCapacity,
  getTotalAvailableCapacity
} from '../../../client_side/src/data/rooms'
import bookingsService from '@/services/bookingService'
import FeedbackModal from './FeedbackModal.vue'

export default {
  name: 'CreateReservationModal',
  components: {
    FeedbackModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'success', 'created'],
  
  setup(props, { emit }) {
    // ==========================================
    // STATE
    // ==========================================
    const isSubmitting = ref(false)
    const isLoadingReservations = ref(false)
    const dateError = ref('')
    
    // Calendar state
    const currentDate = new Date()
    const currentMonth = ref(currentDate.getMonth())
    const currentYear = ref(currentDate.getFullYear())
    
    // Selected rooms with quantities
    const selectedRoomsMap = ref(new Map()) // roomId -> quantity

    const formData = reactive({
      fullName: '',
      email: '',
      phoneNumber: '',
      guests: 1,
      reservationType: 'Day Time',
      status: 'Pending',
      bookingDate: '',
      total: 0,
      paymentType: 'Downpayment',
      paymentMethod: '',
      rfrncNumber: '',
      downpayment: 0,
      remainingBalance: 0,
      request: ''
    })

    // Store existing reservations
    const existingReservations = ref([])

    // Feedback modal state
    const showFeedback = ref(false)
    const feedbackType = ref('success')
    const feedbackTitle = ref('')
    const feedbackMessage = ref('')
    const feedbackDetails = ref(null)

    // ==========================================
    // COMPUTED - CALENDAR
    // ==========================================
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    const currentMonthName = computed(() => {
      return new Date(currentYear.value, currentMonth.value).toLocaleDateString('en-US', { month: 'long' })
    })
    
    const daysInMonth = computed(() => {
      return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
    })
    
    const startDay = computed(() => {
      return new Date(currentYear.value, currentMonth.value, 1).getDay()
    })

    // ==========================================
    // COMPUTED - ROOM AVAILABILITY
    // ==========================================
    
    // Get availability details for selected date
    const roomsWithAvailability = computed(() => {
      if (!formData.bookingDate || !formData.reservationType) {
        return rooms.map(room => ({
          ...room,
          availableQuantity: room.quantity || 1,
          isAvailable: true,
          hasFullDay: false,
          hasDayTime: false,
          hasNightTime: false,
          dayTimeCount: 0,
          nightTimeCount: 0,
          fullDayCount: 0
        }))
      }
      
      return getAvailabilityDetails(formData.bookingDate, formData.reservationType, existingReservations.value)
    })

    // Check if there are any blocked rooms
    const hasBlockedRooms = computed(() => {
      return roomsWithAvailability.value.some(room => !room.isAvailable)
    })

    // Rooms availability hint
    const roomsAvailabilityHint = computed(() => {
      if (isLoadingReservations.value) {
        return 'Loading availability...'
      }
      
      const availableCount = roomsWithAvailability.value.filter(r => r.isAvailable).length
      const totalCount = rooms.length
      
      if (availableCount === 0) {
        return 'No rooms available for this date and reservation type'
      } else if (availableCount < totalCount) {
        return `${availableCount} out of ${totalCount} rooms available`
      } else {
        return 'All rooms are available'
      }
    })

    // Selected room IDs
    const selectedRoomIds = computed(() => {
      return Array.from(selectedRoomsMap.value.keys())
    })

    // Selected rooms with quantities
    const selectedRooms = computed(() => {
      const selected = []
      for (const [roomId, quantity] of selectedRoomsMap.value.entries()) {
        if (quantity > 0) {
          const room = roomsWithAvailability.value.find(r => r.id === roomId)
          if (room) {
            selected.push({
              ...room,
              quantity
            })
          }
        }
      }
      return selected
    })

    // Total amount calculation with proper fallback
    const totalAmount = computed(() => {
      return selectedRooms.value.reduce((sum, room) => {
        const roomPrice = room.price || 0
        return sum + (roomPrice * room.quantity)
      }, 0)
    })

    // Form validation
    const isFormValid = computed(() => {
      return (
        formData.fullName &&
        formData.email &&
        formData.phoneNumber &&
        formData.guests > 0 &&
        formData.reservationType &&
        formData.status &&
        formData.bookingDate &&
        selectedRooms.value.length > 0 &&
        formData.paymentMethod &&
        (formData.paymentMethod !== 'Gcash' || formData.rfrncNumber)
      )
    })

    // Total available for date
    const getTotalAvailableForDate = computed(() => {
      if (!formData.bookingDate) return 0
      return getTotalAvailableCapacity(formData.bookingDate, formData.reservationType, existingReservations.value)
    })

    // ==========================================
    // QUANTITY MANAGEMENT
    // ==========================================
    
    function getSelectedQuantity(roomId) {
      return selectedRoomsMap.value.get(roomId) || 0
    }

    function incrementQuantity(room) {
      const currentQty = selectedRoomsMap.value.get(room.id) || 0
      if (currentQty < room.availableQuantity) {
        selectedRoomsMap.value.set(room.id, currentQty + 1)
        updateTotal()
      }
    }

    function decrementQuantity(room) {
      const currentQty = selectedRoomsMap.value.get(room.id) || 0
      if (currentQty > 0) {
        if (currentQty === 1) {
          selectedRoomsMap.value.delete(room.id)
        } else {
          selectedRoomsMap.value.set(room.id, currentQty - 1)
        }
        updateTotal()
      }
    }

    function toggleRoomSelection(room) {
      if (!room.isAvailable) return
      
      const currentQty = getSelectedQuantity(room.id)
      
      if (currentQty === 0) {
        // Select the room with quantity 1
        selectedRoomsMap.value.set(room.id, 1)
      } else {
        // Deselect the room
        selectedRoomsMap.value.delete(room.id)
      }
      updateTotal()
    }

    function updateTotal() {
      const total = totalAmount.value
      formData.total = isNaN(total) ? 0 : total
      updateRemainingBalance()
    }

    function clearSelectedRooms() {
      selectedRoomsMap.value.clear()
      formData.total = 0
      formData.downpayment = 0
      formData.remainingBalance = 0
    }

    // ==========================================
    // CALENDAR METHODS
    // ==========================================
    
    function prevMonth() {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }
    
    function nextMonth() {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    function formatDateString(day) {
      const month = String(currentMonth.value + 1).padStart(2, '0')
      const dayStr = String(day).padStart(2, '0')
      return `${currentYear.value}-${month}-${dayStr}`
    }

    function formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    function isPastDate(dateStr) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const checkDate = new Date(dateStr + 'T00:00:00')
      return checkDate < today
    }

    function getDateClasses(day) {
      const dateStr = formatDateString(day)
      const classes = []
      
      if (isPastDate(dateStr)) {
        classes.push('past')
        return classes
      }
      
      if (formData.bookingDate === dateStr) {
        classes.push('selected')
      }
      
      const totalAvailable = getTotalAvailableCapacity(dateStr, formData.reservationType, existingReservations.value)
      const totalCapacity = getTotalCapacity()
      
      if (totalAvailable === 0) {
        classes.push('fully-booked')
      } else if (totalAvailable < totalCapacity) {
        classes.push('partially-available')
      }
      
      return classes
    }

    function getDateAvailabilitySummary(day) {
      const dateStr = formatDateString(day)
      
      if (isPastDate(dateStr)) return ''
      
      const totalAvailable = getTotalAvailableCapacity(dateStr, formData.reservationType, existingReservations.value)
      const totalCapacity = getTotalCapacity()
      
      if (totalAvailable === 0) return '⛔'
      if (totalAvailable < totalCapacity) return `${totalAvailable}`
      return '✓'
    }

    function selectDate(day) {
      const dateStr = formatDateString(day)
      
      if (isPastDate(dateStr)) {
        dateError.value = 'Cannot select past dates'
        return
      }
      
      dateError.value = ''
      formData.bookingDate = dateStr
      clearSelectedRooms()
    }

    function clearDate() {
      formData.bookingDate = ''
      clearSelectedRooms()
      dateError.value = ''
    }

    // ==========================================
    // PAYMENT METHODS
    // ==========================================
    
    function updateRemainingBalance() {
      const total = parseFloat(formData.total) || 0
      
      if (formData.paymentType === 'Downpayment') {
        formData.downpayment = calculateDownpayment(total)
        formData.remainingBalance = calculateRemainingBalance(total, formData.downpayment)
      } else {
        formData.downpayment = total
        formData.remainingBalance = 0
      }
      
      formData.downpayment = isNaN(formData.downpayment) ? 0 : formData.downpayment
      formData.remainingBalance = isNaN(formData.remainingBalance) ? 0 : formData.remainingBalance
    }

    // ==========================================
    // FEEDBACK METHODS
    // ==========================================
    
    function showLoadingFeedback(message = 'Processing your reservation...') {
      feedbackType.value = 'loading'
      feedbackTitle.value = 'Please wait'
      feedbackMessage.value = message
      feedbackDetails.value = null
      showFeedback.value = true
    }

    function showSuccessFeedback(title, message, details = null) {
      feedbackType.value = 'success'
      feedbackTitle.value = title
      feedbackMessage.value = message
      feedbackDetails.value = details
      showFeedback.value = true
    }

    function showErrorFeedback(title, message) {
      feedbackType.value = 'error'
      feedbackTitle.value = title
      feedbackMessage.value = message
      feedbackDetails.value = null
      showFeedback.value = true
    }

    function handleFeedbackClose() {
      showFeedback.value = false
    }

    function handleFeedbackConfirm() {
      if (feedbackType.value === 'success') {
        emit('created')
        emit('close')
      }
      showFeedback.value = false
    }

    // ==========================================
    // FORM SUBMISSION
    // ==========================================
    
    async function handleSubmit() {
      if (!isFormValid.value) {
        return
      }

      // Verify all selected rooms are still available
      for (const room of selectedRooms.value) {
        const currentRoom = roomsWithAvailability.value.find(r => r.id === room.id)
        if (!currentRoom?.isAvailable || currentRoom.availableQuantity < room.quantity) {
          showErrorFeedback('Room Not Available', 
            `${room.name} is no longer available. Please adjust your selection.`)
          return
        }
      }

      isSubmitting.value = true
      showLoadingFeedback('Creating your reservation...')

      try {
        // Group rooms by type (using room ID as identifier)
        const roomsByType = new Map()
        
        selectedRooms.value.forEach(room => {
          if (!roomsByType.has(room.id)) {
            roomsByType.set(room.id, [])
          }
          roomsByType.get(room.id).push(room)
        })
        
        const promises = []
        
        // Process each room type
        for (const [roomId, rooms] of roomsByType.entries()) {
          const room = rooms[0] // Get the room details from first item
          const totalQuantity = rooms.reduce((sum, r) => sum + r.quantity, 0)
          
          // Calculate totals for this room type
          const roomTotal = room.price * totalQuantity
          const roomDownpayment = formData.paymentType === 'Downpayment' 
            ? calculateDownpayment(roomTotal)
            : roomTotal
          const roomRemainingBalance = formData.paymentType === 'Downpayment'
            ? calculateRemainingBalance(roomTotal, roomDownpayment)
            : 0

          const payload = {
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            guestQuantity: formData.guests,
            roomName: room.name,
            roomId: room.roomId,
            roomQuantity: totalQuantity,
            bookingDate: formData.bookingDate,
            reservationType: formData.reservationType,
            status: formData.status,
            totalAmount: roomTotal,
            paymentType: formData.paymentType,
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.rfrncNumber || '',
            downpayment: roomDownpayment,
            remainingBalance: roomRemainingBalance,
            totalNights: 0,
            request: formData.request || '',
            notes: formData.request || ''
          }
          
          console.log(`📦 Creating reservation for ${room.name} x${totalQuantity}:`, payload)
          promises.push(bookingsService.createReservationWithPayment(payload))
        }

        const results = await Promise.all(promises)
        const allSuccessful = results.every(r => r.success)

        if (allSuccessful) {
          const amountPaid = formData.paymentType === 'Downpayment' ? formData.downpayment : formData.total
          
          const details = {
            'Guest Name': formData.fullName,
            'Booking Date': formatDisplayDate(formData.bookingDate),
            'Reservation Type': formData.reservationType,
            'Selected Rooms': selectedRooms.value.map(r => `${r.name} x${r.quantity}`).join(', '),
            'Total Amount': `₱${formData.total.toLocaleString()}`,
            'Payment Method': formData.paymentMethod,
            'Payment Type': formData.paymentType === 'Downpayment' ? 'Downpayment (50%)' : 'Full Payment',
          }

          if (formData.paymentMethod === 'Gcash') {
            details['Amount Paid'] = `₱${amountPaid.toLocaleString()}`
            details['Reference Number'] = formData.rfrncNumber
            details['Payment Status'] = 'Paid'
          } else {
            details['Amount to Collect'] = `₱${amountPaid.toLocaleString()}`
          }
          
          if (formData.paymentType === 'Downpayment') {
            details['Remaining Balance'] = `₱${formData.remainingBalance.toLocaleString()}`
          }

          details['Reservation IDs'] = results.map(r => r.reservationId).join(', ')

          const successMessage = formData.paymentMethod === 'Gcash'
            ? `${results.length} reservation(s) and payment have been successfully recorded.`
            : `${results.length} reservation(s) created successfully. Payment will be collected at check-in.`

          showSuccessFeedback('Reservations Created!', successMessage, details)
          await bookingsService.fetchBookings()
          resetForm()
        } else {
          const failed = results.find(r => !r.success)
          showErrorFeedback('Reservation Failed', failed?.error || 'Failed to create reservations')
        }
      } catch (error) {
        console.error('Error creating reservations:', error)
        showErrorFeedback('Reservation Failed', error.message || 'Failed to create reservations')
      } finally {
        isSubmitting.value = false
      }
    }

    function resetForm() {
      Object.assign(formData, {
        fullName: '',
        email: '',
        phoneNumber: '',
        guests: 1,
        reservationType: 'Day Time',
        status: 'Pending',
        bookingDate: '',
        total: 0,
        paymentType: 'Downpayment',
        paymentMethod: '',
        rfrncNumber: '',
        downpayment: 0,
        remainingBalance: 0,
        request: ''
      })
      selectedRoomsMap.value.clear()
      dateError.value = ''
    }

    function handleOverlayClick() {
      emit('close')
    }

    function handleReservationTypeChange() {
      clearSelectedRooms()
    }

    // ==========================================
    // LOAD RESERVATIONS
    // ==========================================
    
    async function loadExistingReservations() {
      isLoadingReservations.value = true
      try {
        await bookingsService.fetchBookings()
        existingReservations.value = bookingsService.bookings
      } catch (error) {
        console.error('Error loading reservations:', error)
      } finally {
        isLoadingReservations.value = false
      }
    }

    onMounted(() => {
      loadExistingReservations()
    })

    watch(() => props.show, (newVal) => {
      if (newVal) {
        loadExistingReservations()
        resetForm()
      }
    })

    watch(totalAmount, (newTotal) => {
      const validTotal = isNaN(newTotal) ? 0 : newTotal
      formData.total = validTotal
      updateRemainingBalance()
    }, { immediate: true })

    watch(() => formData.paymentType, () => {
      updateRemainingBalance()
    })

    return {
      // State
      formData,
      isSubmitting,
      isLoadingReservations,
      dateError,
      showFeedback,
      feedbackType,
      feedbackTitle,
      feedbackMessage,
      feedbackDetails,
      
      // Calendar
      currentMonth,
      currentYear,
      currentMonthName,
      daysInMonth,
      startDay,
      weekdays,
      
      // Room availability
      roomsWithAvailability,
      selectedRooms,
      selectedRoomIds,
      hasBlockedRooms,
      roomsAvailabilityHint,
      getTotalAvailableForDate,
      
      // Validation
      isFormValid,
      
      // Quantity methods
      getSelectedQuantity,
      incrementQuantity,
      decrementQuantity,
      toggleRoomSelection,
      
      // Methods
      prevMonth,
      nextMonth,
      selectDate,
      clearDate,
      formatDateString,
      formatDisplayDate,
      isPastDate,
      getDateClasses,
      getDateAvailabilitySummary,
      updateRemainingBalance,
      handleSubmit,
      handleOverlayClick,
      handleReservationTypeChange,
      handleFeedbackClose,
      handleFeedbackConfirm,
      
      // Constants
      BOOKING_CONFIG,
      getTotalCapacity
    }
  }
}
</script>

<style scoped>
/* ==========================================
   MODAL OVERLAY
   ========================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.create-reservation-modal {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ==========================================
   MODAL HEADER
   ========================================== */
.modal-header {
  padding: 20px 24px;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn svg {
  stroke: white;
  stroke-width: 2;
}

/* ==========================================
   MODAL BODY
   ========================================== */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==========================================
   FORM ELEMENTS
   ========================================== */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.readonly-field {
  padding: 10px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.full-width {
  grid-column: span 2;
}

/* ==========================================
   CALENDAR
   ========================================== */
.calendar-section {
  margin-top: 16px;
}

.calendar-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.calendar-nav {
  background: white;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.calendar-nav:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.calendar-month {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 8px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
  background: white;
}

.calendar-day.empty {
  border: none;
  cursor: default;
}

.calendar-day.past {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.calendar-day:not(.past):not(.empty):hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.calendar-day.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  font-weight: 600;
}

.calendar-day.fully-booked:not(.selected) {
  background: #fee2e2;
  border-color: #ef4444;
  cursor: not-allowed;
}

.calendar-day.partially-available:not(.selected) {
  background: #fef3c7;
  border-color: #f59e0b;
}

.availability-indicator {
  font-size: 10px;
  position: absolute;
  bottom: 2px;
  right: 4px;
}

.selected-date-display {
  margin-top: 12px;
  padding: 12px;
  background: #f0f4ff;
  border: 1px solid #667eea;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.selected-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  flex: 1;
}

.clear-date {
  background: #ef4444;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.clear-date:hover {
  background: #dc2626;
}

/* ==========================================
   DATE SUMMARY
   ========================================== */
.date-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.summary-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

/* ==========================================
   AVAILABILITY HINT
   ========================================== */
.availability-hint {
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.availability-hint.has-blocked {
  background: #fef3c7;
  border-color: #fcd34d;
}

.availability-hint.loading {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.hint-icon {
  font-size: 20px;
}

.hint-text {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

/* ==========================================
   ROOM GRID
   ========================================== */
.room-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.room-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  gap: 12px;
  opacity: 1;
}

.room-card:hover:not(.unavailable) {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.room-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.room-card.unavailable {
  opacity: 0.5;
  cursor: not-allowed;
}

.room-card.unavailable:hover {
  transform: none;
  border-color: #e0e0e0;
  box-shadow: none;
}

.room-card.partially-available {
  border-left: 4px solid #f59e0b;
}

.room-icon {
  font-size: 32px;
  line-height: 1;
}

.room-info {
  flex: 1;
}

.room-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.room-info .capacity {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #6b7280;
}

.room-info .price {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.availability-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
}

.availability-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.availability-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.availability-badge.unavailable {
  background: #fee2e2;
  color: #991b1b;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s;
}

.quantity-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.quantity-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-value {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.selected-rooms-summary {
  margin: 16px 0;
  padding: 16px;
  background: #f0f4ff;
  border: 1px solid #667eea;
  border-radius: 8px;
}

.selected-rooms-summary h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

.selected-room-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.selected-room-item span:first-child {
  color: #1f2937;
}

.selected-room-item span:last-child {
  font-weight: 600;
  color: #10b981;
}

.check-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.no-rooms-message {
  text-align: center;
  padding: 24px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  margin: 16px 0;
}

.no-rooms-message strong {
  color: #1f2937;
}

.pricing-summary {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row span {
  color: #6b7280;
  font-size: 14px;
}

.summary-row strong {
  color: #1f2937;
  font-size: 14px;
}

.summary-row.total {
  background: #667eea;
  color: white;
  padding: 12px 16px;
  border-radius: 0 0 6px 6px;
}

.summary-row.total span,
.summary-row.total strong {
  color: white;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f9fafb;
  position: sticky;
  bottom: 0;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-row,
  .room-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
}
</style>