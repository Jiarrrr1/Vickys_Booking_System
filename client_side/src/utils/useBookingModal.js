// src/utils/useBookingModal.js
import { ref, reactive, computed, watch } from 'vue'
import { api } from '../services/api'

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
  
  // ⚠️ ADD THIS MISSING REF ⚠️
  const isLoadingReservations = ref(false)
  
  // Field validation errors
  const fieldErrors = reactive({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    rfrncNumber: ''
  })

  // Existing reservations from backend
  const existingReservations = ref([])

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
    if (!bookingRoom.name || !existingReservations.value.length) return []
    return existingReservations.value.filter(
      res => res.roomName === bookingRoom.name
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

  // Calculate downpayment (50% of total price)
  const computeDownpayment = computed(() => {
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

  function getBlockedDatesSet() {
    const blockedDates = new Set()
    
    const roomReservations = existingReservations.value.filter(
      res => res.roomName === bookingRoom.name
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

  function isDateBlocked(date) {
    if (!bookingRoom.name) return false
    const blockedDates = getBlockedDatesSet()
    return blockedDates.has(date)
  }

  function hasBlockedDatesInRange(startDate, endDate) {
    if (!bookingRoom.name) return false
    const blockedDates = getBlockedDatesSet()
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
    
    if (!form.checkIn || !bookingRoom.name) return
    
    const selectedDate = new Date(form.checkIn)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      checkInError.value = 'Cannot select a past date'
      fieldErrors.checkIn = 'Cannot select a past date'
      form.checkIn = ''
      return
    }
    
    if (isDateBlocked(form.checkIn)) {
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
    
    if (!form.checkIn || !form.checkOut || !bookingRoom.name) return
    
    if (form.checkOut <= form.checkIn) {
      checkOutError.value = 'Check-out must be after check-in date'
      fieldErrors.checkOut = 'Check-out must be after check-in date'
      form.checkOut = ''
      return
    }
    
    if (hasBlockedDatesInRange(form.checkIn, form.checkOut)) {
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
      fieldErrors.phone = 'Phone number must be 10 digits'
      isValid = false
    } else {
      fieldErrors.phone = ''
    }
    
    return isValid
  }

  function validateStep2() {
    let isValid = true
    
    if (!form.checkIn) {
      fieldErrors.checkIn = 'Check-in date is required'
      checkInError.value = 'Check-in date is required'
      isValid = false
    } else if (checkInError.value) {
      isValid = false
    } else {
      fieldErrors.checkIn = ''
    }
    
    if (!form.checkOut) {
      fieldErrors.checkOut = 'Check-out date is required'
      checkOutError.value = 'Check-out date is required'
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
      fieldErrors.rfrncNumber = 'Reference number is required'
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
    if (!dateString) return ''
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

  async function fetchReservations() {
    console.log('📋 Fetching all reservations')
    isLoadingReservations.value = true
    
    try {
      const response = await api.getAllReservations()
      console.log('📥 Reservations response:', response)
      
      // Handle response (it might be { data: [...] } or direct array)
      const reservationsData = response.data || response
      
      if (Array.isArray(reservationsData)) {
        existingReservations.value = reservationsData
        console.log(`✅ Found ${existingReservations.value.length} total reservations`)
        
        // Log filtered for current room
        const roomReservations = existingReservations.value.filter(
          res => res.roomName === bookingRoom.name
        )
        console.log(`🏨 Found ${roomReservations.length} reservations for room:`, bookingRoom.name)
      } else {
        existingReservations.value = []
        console.warn('⚠️ Unexpected response format:', reservationsData)
      }
    } catch (error) {
      console.error('❌ Error fetching reservations:', error)
      existingReservations.value = []
    } finally {
      isLoadingReservations.value = false
    }
  }

  async function getReservation(id){
    isLoadingReservations.value = true
    
    try {
      const response = await api.getReservation(id)
      return response.reservationId
    } catch (error) {
      console.error('❌ Error fetching reservations:', error)

    }finally {
      isLoadingReservations.value = false
    }
  }

  async function submitReservation() {
    try {
      isSubmitting.value = true
      
      const reservationData = {
        fullName: form.name,
        email: form.email,
        phoneNumber: form.phone,
        guests: form.guestCount,
        request: form.specialReq || "",
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        rfrncNumber: form.rfrncNumber,
        roomId: bookingRoom.id,
        roomName: bookingRoom.name,
        totalNights: totalNights.value,
        total: totalPrice.value,
        downpayment: computeDownpayment.value,
        remainingBalance: computeRemainingBalance.value,
        paymentMethod: form.payType,
        status: 'Confirmed'
      }
      
      console.log('📦 Submitting reservation:', reservationData)
      
      const response = await api.createReservation(reservationData)
      console.log('✅ Reservation response:', response)
      
      refNumber.value = 'VR-' + Math.floor(100000 + Math.random() * 900000)
      submitted.value = true
      
      // Refresh reservations list to update blocked dates
      await fetchReservations()
      
      setTimeout(() => {
        closeBooking()
        resetForm()
      }, 3000)
      
    } catch (error) {
      console.error('❌ Error submitting reservation:', error)
      alert('Failed to create reservation: ' + error.message)
    } finally {
      isSubmitting.value = false
    }
  }

  // ========================================
  // NAVIGATION FUNCTIONS
  // ========================================

  async function nextStep() {
    if (currentStep.value === 1 && !validateStep1()) {
      return
    }
    
    if (currentStep.value === 2 && !validateStep2()) {
      return
    }
    
    if (currentStep.value === 3 && !validateStep3()) {
      return
    }
    
    if (currentStep.value < 4) {
      currentStep.value++
    } else {
      await submitReservation()
    }
  }

  function prevStep() {
    if (currentStep.value > 1) currentStep.value--
  }

  function resetForm() {
    submitted.value = false
    currentStep.value = 1
    checkInError.value = ''
    checkOutError.value = ''
    refNumber.value = ''
    isSubmitting.value = false
    isLoadingReservations.value = false
    
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
      console.log('🔄 Room changed, fetching reservations...')
      fetchReservations()
      form.checkIn = ''
      form.checkOut = ''
      checkInError.value = ''
      checkOutError.value = ''
      fieldErrors.checkIn = ''
      fieldErrors.checkOut = ''
    }
  })

  // Watch modal open state
  watch(isOpen, (newVal) => {
    if (newVal && bookingRoom.id) {
      console.log('🔄 Modal opened, fetching reservations...')
      fetchReservations()
      resetForm()
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
    isLoadingReservations, // ⚠️ DON'T FORGET TO RETURN THIS ⚠️
    
    // Computed
    minDate,
    maxCheckInDate,
    maxCheckOutDate,
    minCheckOutDate,
    totalNights,
    totalPrice,
    computeDownpayment,
    computeRemainingBalance,
    blockedDateRanges,
    
    // Methods
    validateCheckIn,
    validateCheckOut,
    preventTyping,
    formatDate,
    nextStep,
    prevStep,
    resetForm,
    fetchReservations,
    getReservation
  }
}