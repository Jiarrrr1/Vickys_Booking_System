// src/utils/useBookingModal.js
import { ref, reactive, computed } from 'vue'
import { api } from '../services/api'

export function useBookingModal(bookingRoom, bookingDate, reservationType, isOpen, closeBooking) {
  // ✅ UPDATED: 3 steps instead of 4
  const stepLabels = ['Guest Info', 'Review', 'Payment'] 
  const currentStep = ref(1)
  const submitted = ref(false)
  const refNumber = ref('')
  const isSubmitting = ref(false)
  const paymentLocked = ref(false)
  const paymentCompleted = ref(false)
  
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
    rfrncNumber: ''
  })

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================

  // ✅ UPDATED: Total price is just the room price (no nights)
  const totalPrice = computed(() => {
    return bookingRoom.price || 0
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

  // ✅ NEW: Get reservation type time display
  const reservationTypeTime = computed(() => {
    const times = {
      'Day Time': '6:00 AM - 6:00 PM',
      'Night Time': '6:00 PM - 6:00 AM (next day)',
      'Full Day': '6:00 AM - 6:00 AM (24 hours)'
    }
    return times[reservationType.value] || ''
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
    
    // Convert phone to string if it's a number
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
    
    return isValid
  }

  function validateStep2() {
    // Step 2 is now Review, no validation needed
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
    // Validate current step
    if (currentStep.value === 1 && !validateStep1()) {
      console.log('❌ Step 1 validation failed')
      return
    }
    
    if (currentStep.value === 2 && !validateStep2()) {
      console.log('❌ Step 2 validation failed')
      return
    }
    
    // If on payment step, submit the booking
    if (currentStep.value === 3) {
      if (!validateStep3()) {
        console.log('❌ Step 3 validation failed')
        return
      }
      submitBooking()
      return
    }
    
    // Move to next step
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

// In useBookingModal.js - submitBooking function
async function submitBooking() {
  isSubmitting.value = true
  
  try {
    console.log('📤 Submitting booking...')
    
    // Format the date as YYYY-MM-DD using local date components
    const date = bookingDate.value
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    
    console.log('📅 Booking date (local):', formattedDate)
    
    const reservationData = {
      fullName: form.name,
      email: form.email,
      phoneNumber: `+63${form.phone}`,
      guestQuantity: form.guestCount,
      specialRequests: form.specialReq || '',
      
      // ✅ Use the manually formatted date string
      bookingDate: formattedDate,
      
      // Room details
      roomId: bookingRoom.roomId,
      roomName: bookingRoom.name,
      
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
    
    console.log('✅ Booking submitted successfully:', response)
    
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
    form.payType = 'Downpayment'
    form.rfrncNumber = ''
    
    currentStep.value = 1
    submitted.value = false
    refNumber.value = ''
    
    // Clear errors
    Object.keys(fieldErrors).forEach(key => {
      fieldErrors[key] = ''
    })
  }

  function bookAnother() {
    resetForm()
    closeBooking()
  }

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
    reservationTypeTime, // ✅ NEW
    nextStep,
    prevStep,
    resetForm,
    bookAnother,
    formatDate,
    preventTyping,
    isSubmitting,
    paymentCompleted,
    paymentLocked
  }
}