// src/composables/useBookingModal.js
import { ref, reactive, computed, watch } from 'vue'
import { reservations } from '@/data/reservations'

export function useBookingModal(bookingRoom, isOpen, closeBooking) {
  const stepLabels = ['Guest Info', 'Booking Date', 'Payment', 'Confirm']
  const currentStep = ref(1)
  const submitted = ref(false)
  const refNumber = ref('')
  const checkInInput = ref(null)
  const checkOutInput = ref(null)
  const checkInError = ref('')
  const checkOutError = ref('')
  const isSubmitting = ref(false)
  
  // Field validation errors
  const fieldErrors = reactive({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    rfrncNumber: ''
  })

  // Use reservations from data file
  const existingReservations = ref(reservations)

  // Form data
  const form = reactive({
    name: '',
    email: '',
    phone: '',
    guestCount: 2,
    specialReq: '',
    checkIn: '',
    checkOut: '',
    notes: '',
    payType: 'down',
    rfrncNumber: '',
    totalNights: 0
  })

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================

  const minDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const maxCheckInDate = computed(() => {
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    return oneYearFromNow.toISOString().split('T')[0]
  })

  const maxCheckOutDate = computed(() => {
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    return oneYearFromNow.toISOString().split('T')[0]
  })

  const minCheckOutDate = computed(() => {
    if (!form.checkIn) return ''
    const checkIn = new Date(form.checkIn)
    const nextDay = new Date(checkIn)
    nextDay.setDate(nextDay.getDate() + 1)
    return nextDay.toISOString().split('T')[0]
  })

  const blockedDateRanges = computed(() => {
    if (!bookingRoom.id) return []
    return existingReservations.value.filter(
      res => res.roomId === bookingRoom.id
    )
  })

  // Calculate total nights between check-in and check-out
  const totalNights = computed(() => {
    if (!form.checkIn || !form.checkOut) {
      form.totalNights = 0
      return 0
    }
    
    const checkIn = new Date(form.checkIn)
    const checkOut = new Date(form.checkOut)
    
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    const totalNightsValue = nights > 0 ? nights : 0
    form.totalNights = totalNightsValue
    return totalNightsValue
  })

  // Calculate total price based on room rate and number of nights
  const totalPrice = computed(() => {
    const roomPrice = bookingRoom.price || 0
    const nights = totalNights.value || 0
    return roomPrice * nights
  })

  // Calculate downpayment (50% of total price or full payment)
  const computeDownpayment = computed(() => {
    
    // Downpayment is 50% of total price
    return Math.round(totalPrice.value * 0.5)
  })

  // Calculate remaining balance after downpayment
  const computeRemainingBalance = computed(() => {
    const total = totalPrice.value
    const paid = computeDownpayment.value
    const remaining = total - paid
    return remaining > 0 ? remaining : 0
  })

  // ========================================
  // DATE BLOCKING FUNCTIONS
  // ========================================

  function getBlockedDatesSet(roomId) {
    const blockedDates = new Set()
    
    const roomReservations = existingReservations.value.filter(
      res => res.roomId === roomId
    )
    
    roomReservations.forEach(reservation => {
      const start = new Date(reservation.checkIn)
      const end = new Date(reservation.checkOut)
      
      const current = new Date(start)
      while (current < end) {
        blockedDates.add(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
    })
    
    return blockedDates
  }

  function isDateBlocked(date, roomId) {
    const blockedDates = getBlockedDatesSet(roomId)
    return blockedDates.has(date)
  }

  function hasBlockedDatesInRange(startDate, endDate, roomId) {
    const blockedDates = getBlockedDatesSet(roomId)
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

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================

  function validateCheckIn() {
    checkInError.value = ''
    fieldErrors.checkIn = ''
    
    if (!form.checkIn || !bookingRoom.id) return
    
    const selectedDate = new Date(form.checkIn)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      checkInError.value = 'Cannot select a past date'
      fieldErrors.checkIn = 'Cannot select a past date'
      form.checkIn = ''
      return
    }
    
    if (isDateBlocked(form.checkIn, bookingRoom.id)) {
      checkInError.value = 'This date is not available. Please select another date.'
      fieldErrors.checkIn = 'This date is not available. Please select another date.'
      form.checkIn = ''
      return
    }
    
    if (form.checkOut) {
      if (form.checkOut <= form.checkIn) {
        form.checkOut = ''
        checkOutError.value = ''
        fieldErrors.checkOut = ''
      } else {
        validateCheckOut()
      }
    }
  }

  function validateCheckOut() {
    checkOutError.value = ''
    fieldErrors.checkOut = ''
    
    if (!form.checkIn || !form.checkOut || !bookingRoom.id) return
    
    if (form.checkOut <= form.checkIn) {
      checkOutError.value = 'Check-out must be after check-in date'
      fieldErrors.checkOut = 'Check-out must be after check-in date'
      form.checkOut = ''
      return
    }
    
    if (hasBlockedDatesInRange(form.checkIn, form.checkOut, bookingRoom.id)) {
      checkOutError.value = 'Your selected dates overlap with an existing reservation'
      fieldErrors.checkOut = 'Your selected dates overlap with an existing reservation'
      form.checkOut = ''
      return
    }
  }

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
    
    if (!form.phone || !String(form.phone).trim()) {
      fieldErrors.phone = 'This field is required'
      isValid = false
    } else if (String(form.phone).trim().length !== 10) {
      fieldErrors.phone = 'Phone number must be 10 characters'
      isValid = false
    } else {
      fieldErrors.phone = ''
    }
    
    return isValid
  }

  function validateStep2() {
    let isValid = true
    
    if (!form.checkIn) {
      fieldErrors.checkIn = 'This field is required'
      checkInError.value = 'This field is required'
      isValid = false
    } else if (checkInError.value) {
      isValid = false
    } else {
      fieldErrors.checkIn = ''
    }
    
    if (!form.checkOut) {
      fieldErrors.checkOut = 'This field is required'
      checkOutError.value = 'This field is required'
      isValid = false
    } else if (checkOutError.value) {
      isValid = false
    } else {
      fieldErrors.checkOut = ''
    }
    
    return isValid
  }

  function validateStep3() {
    let isValid = true
    
    if (!form.rfrncNumber) {
      fieldErrors.rfrncNumber = 'This field is required'
      isValid = false
    } else if (form.rfrncNumber.toString().length !== 13) {
      fieldErrors.rfrncNumber = 'Reference number must be 13 digits'
      isValid = false
    } else {
      fieldErrors.rfrncNumber = ''
    }
    
    return isValid
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  function preventTyping(event) {
    if ([46, 8, 9, 27, 13].indexOf(event.keyCode) !== -1 ||
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true)) {
      return
    }
    event.preventDefault()
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // ========================================
  // API FUNCTIONS
  // ========================================

  async function fetchReservations(roomId) {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/reservations?roomId=${roomId}`)
      // const data = await response.json()
      // existingReservations.value = data
      
      console.log('Fetching reservations for room:', roomId)
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
  }

  // ========================================
  // NAVIGATION FUNCTIONS
  // ========================================

  async function nextStep() {
    // Validate based on current step
    if (currentStep.value === 1) {
      if (!validateStep1()) {
        return
      }
    }
    
    if (currentStep.value === 2) {
      if (!validateStep2()) {
        return
      }
    }
    
    if (currentStep.value === 3) {
      if (!validateStep3()) {
        return
      }
    }
    
    if (currentStep.value < 4) {
      currentStep.value++
    } else {
      // Final step (step 4) - submit booking
      isSubmitting.value = true
      
      // Simulate API call delay (remove this in production)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate reference number
      refNumber.value = 'VR-' + Math.floor(100000 + Math.random() * 900000)
      submitted.value = true
      
      console.log('=== BOOKING SUBMITTED ===')
      console.log('Submitted:', submitted.value)
      console.log('Reference Number:', refNumber.value)
      console.log('Form Data:', JSON.stringify(form, null, 2))
      console.log('========================')
      
      // Hide loading state
      isSubmitting.value = false
      
      // Show success - modal will display success view
      // It will auto-close after 3 seconds
      setTimeout(() => {
        closeBooking()
      }, 3000)
    }
  }

  function prevStep() {
    if (currentStep.value > 1) currentStep.value--
  }

  function bookAnother() {
    // Reset to initial state
    submitted.value = false
    currentStep.value = 1
    checkInError.value = ''
    checkOutError.value = ''
    
    Object.assign(fieldErrors, {
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      rfrncNumber: ''
    })
    
    Object.assign(form, {
      name: '', 
      email: '', 
      phone: '', 
      guestCount: 2,
      specialReq: '', 
      checkIn: '', 
      checkOut: '', 
      notes: '', 
      payType: 'down', 
      rfrncNumber: '',
      totalNights: 0
    })
    
    // Close the modal
    closeBooking()
  }

  function resetForm() {
    submitted.value = false
    currentStep.value = 1
    checkInError.value = ''
    checkOutError.value = ''
    refNumber.value = ''
    
    Object.assign(fieldErrors, {
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      rfrncNumber: ''
    })
    
    Object.assign(form, {
      name: '', 
      email: '', 
      phone: '', 
      guestCount: 2,
      specialReq: '', 
      checkIn: '', 
      checkOut: '', 
      notes: '', 
      payType: 'down', 
      rfrncNumber: '',
      totalNights: 0
    })
  }

  // ========================================
  // WATCHERS
  // ========================================

  // Watch for room changes
  watch(() => bookingRoom.id, (newRoomId) => {
    if (newRoomId) {
      fetchReservations(newRoomId)
      // Clear date fields when room changes
      form.checkIn = ''
      form.checkOut = ''
      checkInError.value = ''
      checkOutError.value = ''
      fieldErrors.checkIn = ''
      fieldErrors.checkOut = ''
    }
  })

  // ========================================
  // RETURN PUBLIC API
  // ========================================

  return {
    // State
    stepLabels,
    currentStep,
    submitted,
    refNumber,
    checkInInput,
    checkOutInput,
    checkInError,
    checkOutError,
    fieldErrors,
    existingReservations,
    form,
    isSubmitting,
    
    // Computed
    minDate,
    blockedDateRanges,
    maxCheckInDate,
    maxCheckOutDate,
    minCheckOutDate,
    totalNights,
    totalPrice,
    computeDownpayment,
    computeRemainingBalance,
    
    // Methods
    validateCheckIn,
    validateCheckOut,
    preventTyping,
    formatDate,
    nextStep,
    prevStep,
    bookAnother,
    resetForm,
    fetchReservations
  }
}