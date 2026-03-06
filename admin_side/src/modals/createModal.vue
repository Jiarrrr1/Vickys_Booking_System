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
          <!-- Guest Information -->
          <div class="form-section">
            <h3>Guest Information</h3>
            
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

          <!-- Room Selection -->
          <div class="form-section">
            <h3>Select Room</h3>
            
            <div class="room-grid">
              <div
                v-for="room in rooms"
                :key="room.id"
                class="room-card"
                :class="{ 
                  selected: formData.roomId === room.id,
                  unavailable: !room.available
                }"
                @click="selectRoom(room)"
              >
                <div class="room-icon">{{ room.icon }}</div>
                <div class="room-info">
                  <h4>{{ room.name }}</h4>
                  <p class="capacity">{{ room.capacity }}</p>
                  <p class="price">₱{{ room.price.toLocaleString() }}/night</p>
                  <span v-if="!room.available" class="unavailable-badge">Unavailable</span>
                </div>
                <div v-if="formData.roomId === room.id" class="check-icon">✓</div>
              </div>
            </div>

            <p v-if="!selectedRoom" class="help-text">Please select a room to continue</p>
          </div>

          <!-- Booking Details -->
         <!-- Booking Details -->
<div v-if="selectedRoom" class="form-section">
  <h3>Booking Details</h3>
  
  <!-- Availability hint -->
  <div v-if="selectedRoom" class="availability-hint" :class="{ 
    'has-blocked': getBlockedDatesForRoom.size > 0,
    'loading': isLoadingReservations 
  }">
    <span class="hint-icon">{{ isLoadingReservations ? '⏳' : '📅' }}</span>
    <span class="hint-text">{{ availableDatesHint }}</span>
  </div>
  
  <div class="form-row">
    <div class="form-group">
      <label for="checkIn">Check-in Date *</label>
      <input
        id="checkIn"
        v-model="formData.checkIn"
        type="date"
        required
        :min="minCheckInDate"
        @change="handleCheckInChange"
        :class="{ 'error-input': checkInError }"
      />
      <small v-if="checkInError" class="error-message">{{ checkInError }}</small>
    </div>

    <div class="form-group">
      <label for="checkOut">Check-out Date *</label>
      <input
        id="checkOut"
        v-model="formData.checkOut"
        type="date"
        required
        :min="minCheckOutDate"
        @change="handleCheckOutChange"
        :class="{ 'error-input': checkOutError }"
      />
      <small v-if="checkOutError" class="error-message">{{ checkOutError }}</small>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label for="status">Status *</label>
      <select id="status" v-model="formData.status" required>
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Checked In">Checked In</option>
      </select>
    </div>

    <div class="form-group">
      <label>Total Nights</label>
      <div class="readonly-field">{{ formData.totalNights || 0 }} nights</div>
    </div>
  </div>
</div>

       <!-- Payment Details -->
<div v-if="selectedRoom && formData.totalNights > 0" class="form-section">
  <h3>Payment Details</h3>
  
  <div class="">
    <div class="form-row">
      <!-- Payment Type - Hidden when status is Checked In -->
      <div v-if="formData.status != 'Checked In'" class="form-group" :class="{ 'full-width': formData.status === 'Checked In' }">
        <label for="paymentType">Payment Type *</label>
        <select id="paymentType" v-model="formData.paymentType" required>
          <option value="Downpayment">Downpayment (50%)</option>
          <option value="Full Payment">Full Payment</option>
        </select>
      </div>

      <!-- Payment Method - Takes full width when Payment Type is hidden -->
      <div class="form-group" :class="{ 'full-width': formData.status === 'Checked In' }">
        <label for="paymentMethod">Payment Method *</label>
        <select id="paymentMethod" v-model="formData.paymentMethod" required>
          <option value="">Select payment method</option>
          <option value="Gcash">Gcash</option>
          <option value="cash">Cash</option>
        </select>
      </div>
    </div>

    <!-- Reference Number - Only show for Gcash -->
    <div class="form-row" v-if="formData.paymentMethod === 'Gcash'">
      <div class="form-group" :class="{ 'full-width': formData.status === 'Checked In' }">
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
  </div>

  <div class="pricing-summary">
    <div class="summary-row">
      <span>Room Rate:</span>
      <strong>₱{{ selectedRoom?.price?.toLocaleString() || 0 }} × {{ formData.totalNights }} nights</strong>
    </div>
    <div class="summary-row total">
      <span>Total Amount:</span>
      <strong>₱{{ formatNumber(formData.total) }}</strong>
    </div>
    <div v-if="formData.status != 'Checked In' && formData.paymentType === 'Downpayment'" class="summary-row">
      <span>Downpayment (50%):</span>
      <strong>₱{{ formatNumber(formData.downpayment) }}</strong>
    </div>
    <div v-if="formData.status != 'Checked In'" class="summary-row">
      <span>Remaining Balance:</span>
      <strong>₱{{ formatNumber(formData.remainingBalance) }}</strong>
    </div>
    <div v-if="formData.status != 'Checked In' && formData.paymentType === 'full'" class="summary-row paid-indicator">
    <span>Payment Status:</span>
    <strong class="paid-text">✓ Fully Paid</strong>
  </div>
  </div>
</div>

          <!-- Special Request -->
          <div v-if="selectedRoom" class="form-section">
            <div class="form-group">
              <label for="request">Special Request (Optional)</label>
              <textarea
                id="request"
                v-model="formData.request"
                rows="3"
                placeholder="Any special requests from the guest..."
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn-submit" 
              :disabled="isSubmitting || !isFormValid"
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

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import FeedbackModal from './FeedbackModal.vue'
import bookingsService from '@/services/bookingService' // Import the booking service
// ✅ Import from external data file
import { 
  rooms, 
  BOOKING_CONFIG,
  getRoomById,
  calculateRoomPrice,
  calculateDownpayment,
  calculateRemainingBalance 
} from '@/data/rooms'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

// ==========================================
// FEEDBACK MODAL STATE
// ==========================================
const showFeedback = ref(false)
const feedbackType = ref('loading')
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackDetails = ref(null)

// ==========================================
// DATE BLOCKING STATE
// ==========================================
const existingReservations = ref([])
const isLoadingReservations = ref(false)
const dateError = ref('')
const checkInError = ref('')
const checkOutError = ref('')

// ==========================================
// STATE
// ==========================================
const isSubmitting = ref(false)

const formData = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  guests: 1,
  roomId: null,
  roomName: '',
  checkIn: '',
  checkOut: '',
  paymentType: 'Downpayment',
  paymentMethod: '',
  rfrncNumber: '',
  total: 0,
  downpayment: 0,
  remainingBalance: 0,
  totalNights: 0,
  request: '',
  status: 'Paid'
})

// ==========================================
// FEEDBACK METHODS
// ==========================================
const showLoadingFeedback = (message = 'Processing your reservation...') => {
  feedbackType.value = 'loading'
  feedbackTitle.value = 'Please wait'
  feedbackMessage.value = message
  feedbackDetails.value = null
  showFeedback.value = true
}

const showSuccessFeedback = (title, message, details = null) => {
  feedbackType.value = 'success'
  feedbackTitle.value = title
  feedbackMessage.value = message
  feedbackDetails.value = details
}

const showErrorFeedback = (title, message, details = null) => {
  feedbackType.value = 'error'
  feedbackTitle.value = title
  feedbackMessage.value = message
  feedbackDetails.value = details
}

const handleFeedbackClose = () => {
  showFeedback.value = false
}

const handleFeedbackConfirm = () => {
  if (feedbackType.value === 'success') {
    emit('success')
    emit('close')
  }
  showFeedback.value = false
}

// ==========================================
// FETCH EXISTING RESERVATIONS
// ==========================================
const fetchExistingReservations = async () => {
  isLoadingReservations.value = true
  try {
    await bookingsService.fetchBookings()
    existingReservations.value = bookingsService.bookings
    console.log('📋 Fetched existing reservations:', existingReservations.value.length)
  } catch (error) {
    console.error('Error fetching reservations:', error)
  } finally {
    isLoadingReservations.value = false
  }
}

// Watch for modal open to fetch reservations
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await fetchExistingReservations()
    resetForm()
  }
})

// ==========================================
// DATE BLOCKING FUNCTIONS
// ==========================================

// Get all blocked dates for the selected room
const getBlockedDatesForRoom = computed(() => {
  if (!selectedRoom.value || !existingReservations.value.length) {
    return new Set()
  }
  
  const blockedDates = new Set()
  const roomReservations = existingReservations.value.filter(
    res => res.room === selectedRoom.value.name // Use 'room' field from transformed data
  )
  
  roomReservations.forEach(reservation => {
    const start = new Date(reservation.checkIn)
    const end = new Date(reservation.checkOut)
    
    // Add all dates between check-in and check-out (excluding check-out day)
    const current = new Date(start)
    while (current < end) {
      blockedDates.add(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
  })
  
  return blockedDates
})

// Check if a specific date is blocked
const isDateBlocked = (dateString) => {
  if (!selectedRoom.value) return false
  return getBlockedDatesForRoom.value.has(dateString)
}

// Check if any date in a range is blocked
const hasBlockedDatesInRange = (startDate, endDate) => {
  if (!selectedRoom.value || !startDate || !endDate) return false
  
  const blockedDates = getBlockedDatesForRoom.value
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const current = new Date(start)
  while (current < end) {
    if (blockedDates.has(current.toISOString().split('T')[0])) {
      return true
    }
    current.setDate(current.getDate() + 1)
  }
  
  return false
}

// Validate check-in date
const validateCheckIn = (date) => {
  if (!selectedRoom.value) return true
  
  if (isDateBlocked(date)) {
    checkInError.value = 'This date is not available. Please select another date.'
    dateError.value = 'This date is not available. Please select another date.'
    return false
  }
  
  checkInError.value = ''
  dateError.value = ''
  return true
}

// Validate check-out date
const validateCheckOut = (checkIn, checkOut) => {
  if (!selectedRoom.value || !checkIn || !checkOut) return true
  
  if (hasBlockedDatesInRange(checkIn, checkOut)) {
    checkOutError.value = 'Your selected dates overlap with an existing reservation'
    dateError.value = 'Your selected dates overlap with an existing reservation'
    return false
  }
  
  checkOutError.value = ''
  dateError.value = ''
  return true
}

// ==========================================
// COMPUTED
// ==========================================
// ... keep all your existing imports and state ...

// ==========================================
// COMPUTED
// ==========================================

// Selected room (using helper function)
const selectedRoom = computed(() => {
  if (!formData.roomId) return null
  return getRoomById(formData.roomId)
})

// Calculate downpayment based on total
const calculatedDownpayment = computed(() => {
  return calculateDownpayment(formData.total)
})

// Calculate remaining balance based on payment type
const calculatedRemainingBalance = computed(() => {
  if (formData.paymentType === 'Full Payment') {
    return 0
  } else {
    // For downpayment, remaining is total - downpayment
    return formData.total - calculatedDownpayment.value
  }
})

// Form validation
const isFormValid = computed(() => {
  const basicValid = formData.fullName &&
         formData.email &&
         formData.phoneNumber &&
         formData.roomId &&
         formData.checkIn &&
         formData.checkOut &&
         formData.totalNights > 0 &&
         formData.paymentMethod &&
         !dateError.value
  
  // If Gcash is selected, reference number is required
  if (formData.paymentMethod === 'Gcash') {
    return basicValid && formData.rfrncNumber && formData.rfrncNumber.trim() !== ''
  }

  return basicValid
})

// Availability hint text
const availableDatesHint = computed(() => {
  if (!selectedRoom.value) return ''
  if (isLoadingReservations.value) return 'Checking availability...'
  
  const blockedCount = getBlockedDatesForRoom.value.size
  if (blockedCount === 0) return 'All dates are available for this room'
  return `${blockedCount} date${blockedCount > 1 ? 's are' : ' is'} already booked for this room`
})

// Minimum check-in date (today)
const minCheckInDate = computed(() => {
  try {
    const today = new Date()
    if (isNaN(today.getTime())) {
      return ''
    }
    return today.toISOString().split('T')[0]
  } catch (error) {
    console.error('Error calculating min check-in date:', error)
    return ''
  }
})

// Minimum check-out date (1 day after check-in)
const minCheckOutDate = computed(() => {
  if (!formData.checkIn) return ''
  
  try {
    const checkIn = new Date(formData.checkIn)
    if (isNaN(checkIn.getTime())) return ''
    
    checkIn.setDate(checkIn.getDate() + 1)
    return checkIn.toISOString().split('T')[0]
  } catch (error) {
    console.error('Error calculating min checkout date:', error)
    return ''
  }
})

// ==========================================
// METHODS
// ==========================================

const selectRoom = (room) => {
  if (!room.available) return
  
  formData.roomId = room.id
  formData.roomName = room.name
  
  // Reset dates when room changes
  formData.checkIn = ''
  formData.checkOut = ''
  formData.totalNights = 0
  dateError.value = ''
  checkInError.value = ''
  checkOutError.value = ''
  
  // Reset payment values
  formData.total = 0
  formData.downpayment = 0
  formData.remainingBalance = 0
}

const handleCheckInChange = () => {
  try {
    // Validate check-in date
    if (formData.checkIn && !validateCheckIn(formData.checkIn)) {
      formData.checkIn = ''
      formData.totalNights = 0
      return
    }
    
    // Reset check-out if it's before new check-in
    if (formData.checkOut && formData.checkIn) {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkOut <= checkIn) {
        formData.checkOut = ''
        formData.totalNights = 0
      }
    }
    
    calculateNights()
  } catch (error) {
    console.error('Error in handleCheckInChange:', error)
  }
}

const handleCheckOutChange = () => {
  // Validate check-out date range
  if (formData.checkIn && formData.checkOut) {
    if (!validateCheckOut(formData.checkIn, formData.checkOut)) {
      formData.checkOut = ''
      formData.totalNights = 0
      return
    }
  }
  calculateNights()
}

const calculateNights = () => {
  if (formData.checkIn && formData.checkOut) {
    try {
      // Validate that dates don't overlap with existing reservations
      if (!validateCheckOut(formData.checkIn, formData.checkOut)) {
        formData.totalNights = 0
        return
      }
      
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      
      // Validate dates
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        formData.totalNights = 0
        return
      }
      
      const diffTime = checkOut - checkIn
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 0) {
        formData.totalNights = diffDays
        calculatePricing()
      } else {
        formData.totalNights = 0
        dateError.value = 'Check-out date must be after check-in date'
      }
    } catch (error) {
      console.error('Error calculating nights:', error)
      formData.totalNights = 0
    }
  }
}

const calculatePricing = () => {
  if (!selectedRoom.value || formData.totalNights === 0) {
    formData.total = 0
    formData.downpayment = 0
    formData.remainingBalance = 0
    return
  }
  
  // Calculate total
  const total = calculateRoomPrice(formData.roomId, formData.totalNights)
  formData.total = total
  
  // Calculate downpayment
  formData.downpayment = calculateDownpayment(total)
  
  // Calculate remaining balance based on payment type
  updateRemainingBalance()
}

// New function to update remaining balance based on payment type
const updateRemainingBalance = () => {
  if (formData.paymentType === 'Full Payment') {
    formData.remainingBalance = 0
  } else {
    formData.remainingBalance = formData.total - formData.downpayment
  }
}

// Watch for payment type changes
watch(() => formData.paymentType, () => {
  updateRemainingBalance()
})

// Watch for total changes (in case it's updated elsewhere)
watch(() => formData.total, () => {
  updateRemainingBalance()
})

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('en-PH')
}

const handleOverlayClick = () => {
  emit('close')
}

// In handleSubmit
// In createModal.vue - update the handleSubmit function

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }
  
  showLoadingFeedback('Creating your reservation...')
  isSubmitting.value = true
  
  try {
     // Map payment method to match model enum
    const paymentMethod = formData.paymentMethod === 'gcash' ? 'GCash' : 'Cash'
    
    const reservationData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      guests: formData.guests,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      request: formData.request || "",
      paymentType: formData.paymentType === 'down' ? 'Downpayment' : 'Full Payment',
      paymentMethod: paymentMethod, // Now 'GCash' or 'Cash'
      roomId: formData.roomId,
      roomName: formData.roomName,
      total: formData.total,
      status: formData.status || "Pending",
      rfrncNumber: formData.paymentMethod === 'gcash' ? formData.rfrncNumber : '',
      totalNights: formData.totalNights,
      downpayment: formData.downpayment,
      remainingBalance: formData.remainingBalance
    }
    
    console.log('📦 Sending reservation data:', reservationData)
    
    const result = await bookingsService.createReservationWithPayment(reservationData)
    
    if (result.success) {
      // Determine payment status message
      let paymentStatusMessage = ''
      let amountPaid = 0
      
      if (formData.paymentMethod === 'Gcash') {
        amountPaid = formData.paymentType === 'Downpayment' ?  formData.downpayment : formData.total
        paymentStatusMessage = 'Paid via Gcash'
      } else {
        // Cash payment
        if (formData.paymentType === 'Full Payment') {
          amountPaid = formData.total
          // paymentStatusMessage = 'Full amount to be paid at check-in'
        } else {
          amountPaid = formData.downpayment
          // paymentStatusMessage = 'Downpayment to be paid at check-in'
        }
      }
      
      // Prepare details based on payment method and type
      const details = {
        'Reservation ID': result.reservationId,
        'Guest Name': formData.fullName,
        'Room': formData.roomName,
        'Check-in': formData.checkIn,
        'Check-out': formData.checkOut,
        'Total Nights': formData.totalNights,
        'Total Amount': `₱${formatNumber(formData.total)}`,
        'Payment Method': formData.paymentMethod === 'Gcash' ? 'Gcash' : 'Cash',
        'Payment Type': formData.paymentType === 'Downpayment' ? 'Downpayment (50%)' : 'Full Payment',
      }

      // Add payment-specific details
      if (formData.paymentMethod === 'Gcash') {
        details['Amount Paid'] = `₱${formatNumber(amountPaid)}`
        details['Reference Number'] = formData.rfrncNumber
        details['Payment Status'] = 'Paid'
      } else {
        details['Amount Paid'] = `₱${formatNumber(amountPaid)}`
        details['Payment Status'] = paymentStatusMessage
      }
      
      // Only show remaining balance for downpayment
      if (formData.paymentType === 'Downpayment') {
        details['Remaining Balance'] = `₱${formatNumber(formData.remainingBalance)}`
      }

      // Custom success message based on payment type
      let successMessage = ''
      if (formData.paymentMethod === 'Gcash') {
        successMessage = 'Reservation and payment have been successfully recorded.'
      } else {
        if (formData.paymentType === 'full') {
          successMessage = 'Reservation created successfully. Full payment will be collected at check-in.'
        } else {
          successMessage = 'Reservation created successfully. Downpayment will be collected at check-in.'
        }
      }

      showSuccessFeedback(
        'Reservation Created!',
        successMessage,
        details
      )
      
      await fetchExistingReservations()
      resetForm()
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error)
    showErrorFeedback(
      'Reservation Failed',
      error.response?.data?.message || error.message || 'Failed to create reservation'
    )
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'number') {
      formData[key] = 0
    } else if (typeof formData[key] === 'string') {
      formData[key] = ''
    } else if (formData[key] === null) {
      formData[key] = null
    }
  })
  formData.guests = 1
  formData.paymentType = 'Downpayment'
  formData.paymentMethod = ''
  formData.status = 'Paid'
  dateError.value = ''
  checkInError.value = ''
  checkOutError.value = ''
}

// Watch for check-out changes
watch(() => formData.checkOut, (newValue) => {
  if (newValue) {
    calculateNights()
  } else {
    formData.totalNights = 0
  }
})

// Watch for check-in changes
watch(() => formData.checkIn, (newValue, oldValue) => {
  if (newValue !== oldValue && formData.checkOut) {
    calculateNights()
  }
})

// Watch payment method to clear reference number when switching to cash
watch(() => formData.paymentMethod, (newValue) => {
  if (newValue !== 'Gcash') {
    formData.rfrncNumber = ''
  }
})

</script>

<style scoped>
/* ... Same styles as before ... */

/* Add this to your existing styles */
.full-width {
  grid-column: span 2; /* Makes the element take full width of the form-row */
}

/* Availability hint */
.availability-hint {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0369a1;
}

.availability-hint.has-blocked {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.availability-hint.loading {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #4b5563;
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  flex: 1;
}

/* Error styling */
.error-input {
  border-color: #ef4444 !important;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* Disabled state for date inputs */
input[type="date"]:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}
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
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.create-reservation-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.close-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.modal-body {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
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
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.unavailable-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-top: 4px;
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

.pricing-summary {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
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
  margin: 8px -16px;
  padding: 12px 16px;
  border-radius: 6px;
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
}
</style>