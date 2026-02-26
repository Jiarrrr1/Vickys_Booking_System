// src/utils/useBooking.js
import { ref, reactive } from 'vue'

const isOpen = ref(false)
const isFilled = ref(false)

const bookingRoom = reactive({
  id: null,
  name: '',
  icon: '',
  price: 0,
  capacity: ''
})

export function useBooking() {
  function openBooking(room) {
    bookingRoom.id = room.id
    bookingRoom.name = room.name
    bookingRoom.icon = room.icon ?? '🏨'
    bookingRoom.price = room.price
    bookingRoom.capacity = room.capacity
    isOpen.value = true

    console.log('Modal State:',isOpen.value);

  }

  function closeBooking() {
    isOpen.value = false
    console.log('Modal State:',isOpen.value);
    
  }

  function checkField(payload){
    if (!payload){
        isFilled.value = true
    }
  }

  function computeDownPayment(){
    const downPayment = .5 * bookingRoom.price
    return downPayment
}

function computeRemainingBalance( ){
    const downPayment = .5 * bookingRoom.price
    const balance = bookingRoom.price - downPayment
    return balance
}

  return { isOpen, isFilled, bookingRoom, openBooking, closeBooking, checkField, computeDownPayment, computeRemainingBalance }
}