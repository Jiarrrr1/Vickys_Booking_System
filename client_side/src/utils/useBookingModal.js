// src/utils/useBookingModal.js
import { ref, reactive, computed, watch } from 'vue'
import { api } from '../services/api'
import { getAvailableQuantity } from '../data/rooms' // Add this import

export function useBookingModal(bookingRoom, bookingDate, reservationType, isOpen, closeBooking, reservationsRef = ref([])) {
  // Steps
  const stepLabels = ['Guest Info', 'Review', 'Payment'] 
  const currentStep = ref(1)
  const submitted = ref(false)
  const refNumber = ref('')
  const isSubmitting = ref(false)
  const paymentLocked = ref(false)
  const paymentCompleted = ref(false)

  const forceUpdate = ref(0)
  const availableQuantity = ref(5)
const maxQuantity = ref(1)
const isLoadingAvailability = ref(true)

  
  // Field validation errors
  const fieldErrors = reactive({
    name: '',
    email: '',
    phone: '',
    rfrncNumber: ''
  })

  // Form data
  const form = reactive({
    name: '',
    email: '',
    phone: '',
    guestCount: 2,
    specialReq: '',
    payType: 'down',
    rfrncNumber: '',
    roomQuantity: 1
  })

    const reservations = reservationsRef

  // Store reservations from parent if available

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================
// Keep isCottage as computed (it's simple)
const isCottage = computed(() => {
  return bookingRoom.value?.id === 5
})
 // Create a function to calculate availability
const calculateAvailability = () => {
  console.log('🧮 Calculating availability with reservations:', reservations.value)
  
  if (!bookingRoom.value || !bookingDate.value || !reservationType.value) {
    console.log('❌ Missing data for availability calculation')
    return bookingRoom.value?.quantity || 5
  }
  
  // Format date to YYYY-MM-DD
  const date = bookingDate.value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`
  
  console.log('📅 Calculating availability for cottage:', {
    roomId: bookingRoom.value.id,
    roomName: bookingRoom.value.name,
    date: formattedDate,
    type: reservationType.value,
    reservations: reservations.value.length
  })
  
  // Get available quantity using your existing function
  const available = getAvailableQuantity(
    bookingRoom.value.id,
    formattedDate,
    reservationType.value,
    reservations.value
  )
  
  console.log('✅ Calculated available quantity:', available)
  return available
}

// Update both refs when dependencies change
const updateAvailability = () => {
  isLoadingAvailability.value = true
  const avail = calculateAvailability()
  availableQuantity.value = avail
  maxQuantity.value = isCottage.value ? Math.max(1, avail) : 1
  isLoadingAvailability.value = false
}







  // Total price with quantity
  const totalPrice = computed(() => {
    const basePrice = bookingRoom.value?.price || 0
    const quantity = isCottage.value ? (form.roomQuantity || 1) : 1
    return basePrice * quantity
  })

  // Calculate downpayment (50% of total price)
  const computeDownpayment = computed(() => {
    return Math.round(totalPrice.value * 0.5)
  })

  // Calculate remaining balance based on payment type
  const computeRemainingBalance = computed(() => {
    const total = totalPrice.value
    
    if (form.payType === 'full') {
      return 0
    } else {
      const paid = computeDownpayment.value
      return total - paid
    }
  })

  // Reservation type time display
  const reservationTypeTime = computed(() => {
    const times = {
      'Day Time': '6:00 AM - 6:00 PM',
      'Night Time': '6:00 PM - 6:00 AM (next day)',
      'Full Day': '6:00 AM - 6:00 AM (24 hours)'
    }
    return times[reservationType.value] || ''
  })

  // ========================================
  // QUANTITY FUNCTIONS
  // ========================================

  const incrementQuantity = () => {
    if (form.roomQuantity < maxQuantity.value) {
      form.roomQuantity++
    }
  }

  const decrementQuantity = () => {
    if (form.roomQuantity > 1) {
      form.roomQuantity--
    }
  }


  // Reset quantity when room changes
  watch(() => bookingRoom.value, (newRoom) => {
    if (newRoom) {
      form.roomQuantity = 1
    }
  })

  // Reset quantity when date changes
  watch(() => bookingDate.value, () => {
    form.roomQuantity = 1
  })

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================

  function validateStep1() {
    let isValid = true
    
    if (!form.name.trim()) {
      fieldErrors.name = 'This field is required'
      isValid = false
    } else {
      fieldErrors.name = ''
    }
    
    if (!form.email.trim()) {
      fieldErrors.email = 'This field is required'
      isValid = false
    } else if (!form.email.includes('@')) {
      fieldErrors.email = 'Email must contain "@"'
      isValid = false
    } else {
      fieldErrors.email = ''
    }
    
    const phoneStr = String(form.phone).trim()
    if (!phoneStr) {
      fieldErrors.phone = 'This field is required'
      isValid = false
    } else if (phoneStr.length < 10) {
      fieldErrors.phone = 'Phone number must be at least 10 digits'
      isValid = false
    } else {
      fieldErrors.phone = ''
    }
    
    // Validate quantity doesn't exceed available
    if (isCottage.value && form.roomQuantity > maxQuantity.value) {
      fieldErrors.roomQuantity = `Only ${maxQuantity.value} cottages available`
      isValid = false
    }
    
    return isValid
  }

  function validateStep2() {
    return true
  }

  function validateStep3() {
    let isValid = true
    
    if (!form.rfrncNumber.trim()) {
      fieldErrors.rfrncNumber = 'Reference number is required'
      isValid = false
    } else if (form.rfrncNumber.length < 13) {
      fieldErrors.rfrncNumber = 'Reference number must be 13 digits'
      isValid = false
    } else {
      fieldErrors.rfrncNumber = ''
    }
    
    return isValid
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function nextStep() {
    if (currentStep.value === 1 && !validateStep1()) {
      return
    }
    
    if (currentStep.value === 2 && !validateStep2()) {
      return
    }
    
    if (currentStep.value === 3) {
      if (!validateStep3()) {
        return
      }
      submitBooking()
      return
    }
    
    currentStep.value++
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  // ========================================
  // FORM SUBMISSION
  // ========================================

  async function submitBooking() {
    isSubmitting.value = true
    
    try {
      console.log('📤 Submitting booking...')
      
      const date = bookingDate.value
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`
      
      const reservationData = {
        fullName: form.name,
        email: form.email,
        phoneNumber: `+63${form.phone}`,
        guestQuantity: form.guestCount,
        specialRequests: form.specialReq || '',
        
        bookingDate: formattedDate,
        
        // Room details
        roomId: bookingRoom.value.roomId,
        roomName: bookingRoom.value.name,
        roomQuantity: isCottage.value ? form.roomQuantity : 1,
        
        // Reservation type
        reservationType: reservationType.value,
        
        // Pricing
        totalAmount: totalPrice.value,
        downpayment: form.payType === 'down' ? computeDownpayment.value : totalPrice.value,
        remainingBalance: computeRemainingBalance.value,
        
        // Payment
        paymentType: form.payType === 'down' ? 'Downpayment' : 'Full Payment',
        paymentMethod: 'GCash',
        referenceNumber: form.rfrncNumber,
        
        // Status
        status: 'Pending'
      }
      
      console.log('📦 Reservation Data:', reservationData)
      
      const response = await api.createReservation(reservationData)
      
      refNumber.value = response.data?.referenceNumber || response.referenceNumber || `REF${Date.now()}`
      submitted.value = true
      
    } catch (error) {
      console.error('❌ Booking submission failed:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      isSubmitting.value = false
    }
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  function preventTyping(event) {
    event.preventDefault()
  }

  function formatDate(dateString) {
    if (!dateString) return ''
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function resetForm() {
    form.name = ''
    form.email = ''
    form.phone = ''
    form.guestCount = 2
    form.specialReq = ''
    form.payType = 'down'
    form.rfrncNumber = ''
    form.roomQuantity = 1
    
    currentStep.value = 1
    submitted.value = false
    refNumber.value = ''
    
    Object.keys(fieldErrors).forEach(key => {
      fieldErrors[key] = ''
    })
  }

  function bookAnother() {
    resetForm()
    closeBooking()
  }

  watch(
  [
    () => bookingRoom.value,
    () => bookingDate.value,
    () => reservationType.value,
    () => reservations.value,
    () => reservations.value?.length,
    () => isOpen.value // Add isOpen to dependencies
  ],
  () => {
    console.log('🔄 Dependencies changed, recalculating availability', {
      room: bookingRoom.value?.id,
      date: bookingDate.value,
      type: reservationType.value,
      reservationsLength: reservations.value?.length,
      isOpen: isOpen.value,
      reservationsData: reservations.value
    })
    
    // Only calculate when modal is open and we have all data
    if (!isOpen.value) {
      console.log('⏸️ Modal not open, skipping calculation')
      return
    }
    
    isLoadingAvailability.value = true
    
    if (!bookingRoom.value || !bookingDate.value || !reservationType.value) {
      console.log('❌ Missing data for availability calculation')
      availableQuantity.value = bookingRoom.value?.quantity || 5
      maxQuantity.value = isCottage.value ? Math.max(1, availableQuantity.value) : 1
      isLoadingAvailability.value = false
      return
    }
    
    // Format date to YYYY-MM-DD
    const date = bookingDate.value
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    
    console.log('📅 Calculating availability with reservations:', {
      roomId: bookingRoom.value.id,
      date: formattedDate,
      type: reservationType.value,
      reservationsCount: reservations.value?.length,
      reservationsData: reservations.value
    })
    
    // Get available quantity
    const available = getAvailableQuantity(
      bookingRoom.value.id,
      formattedDate,
      reservationType.value,
      reservations.value || []
    )
    
    console.log('✅ Calculated available quantity:', available)
    
    availableQuantity.value = available
    maxQuantity.value = isCottage.value ? Math.max(1, available) : 1
    isLoadingAvailability.value = false
  },
  { 
    deep: true, 
    immediate: true
  }
)

  // ========================================
  // RETURN
  // ========================================

  return {
  stepLabels,
  currentStep,
  submitted,
  refNumber,
  fieldErrors,
  form,
  totalPrice,
  computeDownpayment,
  computeRemainingBalance,
  reservationTypeTime,
  nextStep,
  prevStep,
  resetForm,
  bookAnother,
  formatDate,
  preventTyping,
  isSubmitting,
  paymentCompleted,
  paymentLocked,
  // Updated exports
  isCottage,
  maxQuantity, // Now a ref
  availableQuantity, // Now a ref
  isLoadingAvailability,
  incrementQuantity,
  decrementQuantity
}
}