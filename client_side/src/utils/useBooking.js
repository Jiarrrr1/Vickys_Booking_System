// src/utils/useBooking.js
import { ref, reactive } from 'vue'

const isOpen = ref(false)
const isFilled = ref(false)

const bookingRoom = ref({
  id: null,
  name: '',
  icon: '',
  price: 0,
  capacity: '',
  roomId: '',
  quantity: 1,
  type: ''
})

const bookingDate = ref(null)
const reservationType = ref('Day Time')
const bookingReservations = ref([]) // Add this

export function useBooking() {
  function openBooking(room, date, type, reservations = []) {
    bookingRoom.value = {
      id: room.id,
      name: room.name,
      icon: room.icon ?? '🏨',
      price: room.price,
      capacity: room.capacity,
      roomId: room.roomId || `ROOM${room.id}`,
      quantity: room.quantity || 1,
      type: room.type || 'room'
    }
    
    bookingDate.value = date
    reservationType.value = type
    bookingReservations.value = reservations // Store reservations
    
    isOpen.value = true

    console.log('📖 Booking Modal Opened')
    console.log('🏠 Room:', bookingRoom.value)
    console.log('📅 Date:', date)
    console.log('⏰ Type:', type)
    console.log('📋 Reservations:', reservations.length)
  }

  function closeBooking() {
    isOpen.value = false
  }

  return { 
    isOpen, 
    isFilled, 
    bookingRoom, 
    bookingDate,        
    reservationType,
    bookingReservations, // Export this
    openBooking, 
    closeBooking,
    checkField: () => {}, // Add missing functions or implement them
    computeDownPayment: () => 0,
    computeRemainingBalance: () => 0
  }
}