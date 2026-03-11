// src/utils/useBooking.js
import { ref, reactive } from 'vue'

const isOpen = ref(false)
const isFilled = ref(false)

const bookingRoom = reactive({
  id: null,
  name: '',
  icon: '',
  price: 0,
  capacity: '',
  roomId: '' // ✅ Added for backend
})

// ✅ NEW: Store selected date and reservation type
const bookingDate = ref(null)
const reservationType = ref('Day Time')

export function useBooking() {
  // ✅ UPDATED: Accept room, date, and reservationType
  function openBooking(room, date, type) {
    bookingRoom.id = room.id
    bookingRoom.name = room.name
    bookingRoom.icon = room.icon ?? '🏨'
    bookingRoom.price = room.price
    bookingRoom.capacity = room.capacity
    bookingRoom.roomId = room.roomId || `ROOM${room.id}` // ✅ Added
    
    // ✅ NEW: Store date and reservation type
    bookingDate.value = date
    reservationType.value = type
    
    isOpen.value = true

    console.log('📖 Booking Modal Opened')
    console.log('🏠 Room:', bookingRoom.name)
    console.log('📅 Date:', date)
    console.log('⏰ Type:', type)
  }

  function closeBooking() {
    isOpen.value = false
    console.log('📕 Booking Modal Closed')
  }

  function checkField(payload){
    if (!payload){
      isFilled.value = true
    }
  }

  function computeDownPayment(){
    const downPayment = 0.5 * bookingRoom.price
    return downPayment
  }

  function computeRemainingBalance(){
    const downPayment = 0.5 * bookingRoom.price
    const balance = bookingRoom.price - downPayment
    return balance
  }

  return { 
    isOpen, 
    isFilled, 
    bookingRoom, 
    bookingDate,        // ✅ NEW
    reservationType,    // ✅ NEW
    openBooking, 
    closeBooking, 
    checkField, 
    computeDownPayment, 
    computeRemainingBalance 
  }
}