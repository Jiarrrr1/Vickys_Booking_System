// ============================================
// ROOMS & COTTAGES DATA - COMPLETE
// ============================================
// File: src/data/rooms.js



export const rooms = [
  {
    id: 1,
    roomId: 'ROSE001',
    img: null,
    icon: '🌹',
    name: 'Rose Room',
    shortName: 'Rose Room',
    type: 'room', // ✅ NEW
    quantity: 1,  // ✅ NEW: Only 1 Rose Room
    description: 'Find tranquility in the Rose Room...',
    capacity: '5–8 pax',
    badge: 'Featured Room',

    // for rooms showcase section
    amenities: ['Air Conditioning', 'Double Deck Bed', 'Private Pool Access', 'Garden View'],
    price: 1000,

    // for rates section
    wide: false,
    prices: [
      { amount: 1000, label: 'per night' }
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: 'Double Deck Bed' }
    ]
  },
  {
    id: 2,
    roomId: 'TULIP002',
    img: null,
    icon: '🌷',
    name: 'Tulip Room',
    shortName: 'Tulip Room',
    type: 'room', // ✅ NEW
    quantity: 1,  // ✅ NEW
    description: 'The Tulip Room offers a bright and welcoming space...',
    capacity: '5–6 pax',
    badge: 'Featured Room',

    amenities: ['Air Conditioning', 'Double Deck Bed', 'Private Pool Access', 'Garden View'],
    price: 1000,

    wide: false,
    prices: [
      { amount: 1000, label: 'per night' }
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: 'Double Deck Bed' }
    ]
  },
  {
    id: 3,
    roomId: 'CALLA003',
    img: null,
    icon: '🌸',
    name: 'Callalily',
    shortName: 'Callalily Room',
    type: 'room', // ✅ NEW
    quantity: 1,  // ✅ NEW
    description: 'Designed for small groups seeking a quiet getaway...',
    capacity: '5–6 pax',
    badge: 'Featured Room',

    amenities: ['Air Conditioning', 'Double Deck Bed', 'Private Pool Access', 'Garden View'],
    price: 1000,

    wide: false,
    prices: [
      { amount: 1000, label: 'room rate' },
      { amount: 500,  label: 'cottage only', small: true }
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: 'Double Deck Bed' },
      { icon: '🛖', label: 'Private Cottage' },
      { icon: '🚿', label: 'Comfort Room' }
    ]
  },
  {
    id: 4,
    roomId: 'STAR004',
    img: null,
    icon: '⭐',
    name: 'Stargazer',
    shortName: 'Stargazer Room',
    type: 'room', // ✅ NEW
    quantity: 1,  // ✅ NEW
    description: 'Our largest room built for bigger groups...',
    capacity: '10–20 pax',
    badge: 'Featured Room',

    amenities: ['Air Conditioning', '2 Double Deck Beds', 'Private Pool Access', 'Garden View'],
    price: 1500,

    wide: false,
    prices: [
      { amount: 1500, label: 'per night' }
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: '2× Double Deck Beds' },
      { icon: '🛌', label: '1 Regular Bed' },
      { icon: '📺', label: 'Television' },
      { icon: '🚿', label: 'Comfort Room' },
      { icon: '🍳', label: 'Mini Kitchen' }
    ]
  },
  // ✅ NEW: COTTAGE ADDITION
  {
    id: 5,
    roomId: 'COTTAGE',
    img: null, // Add cottage image if you have one
    icon: '🏡',
    name: 'Garden Cottage',
    shortName: 'Cottage',
    type: 'cottage', // ✅ NEW TYPE
    quantity: 5,      // ✅ NEW: 5 cottages available
    description: 'Open-air garden cottages perfect for day trips and gatherings...',
    capacity: '8–12 pax',
    badge: 'Popular',

    amenities: ['Open Air', 'Tables & Chairs', 'Grill Area', 'Sink', 'Pool Access'],
    price: 800,

    wide: false,
    prices: [
      { amount: 800, label: 'per day' }
    ],
    features: [
      { icon: '🏡', label: 'Garden Setting' },
      { icon: '🪑', label: 'Tables & Chairs' },
      { icon: '🔥', label: 'Grill Area' },
      { icon: '💧', label: 'Water & Sink' },
      { icon: '🏊', label: 'Pool Access' }
    ]
  }
]

// ============================================
// BOOKING CONFIGURATION
// ============================================

export const BOOKING_CONFIG = {
  leadDays: 3,
  maxNights: 14,
  minGuests: 1,
  maxGuests: 20
}

// ✅ NEW: RESERVATION TYPES
export const RESERVATION_TYPES = {
  DAY_TIME: 'Day Time',
  NIGHT_TIME: 'Night Time',
  FULL_DAY: 'Full Day'
}

export const RESERVATION_TYPE_INFO = {
  'Day Time': {
    label: 'Day Time',
    icon: '🌞',
    startTime: '6:00 AM',
    endTime: '6:00 PM',
    duration: '12 hours'
  },
  'Night Time': {
    label: 'Night Time',
    icon: '🌙',
    startTime: '6:00 PM',
    endTime: '6:00 AM (next day)',
    duration: '12 hours'
  },
  'Full Day': {
    label: 'Full Day',
    icon: '☀️🌙',
    startTime: '6:00 AM',
    endTime: '6:00 AM (next day)',
    duration: '24 hours'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRoomById(id) {
  return rooms.find(r => r.id === id)
}

export function getRoomByRoomId(roomId) {
  return rooms.find(r => r.roomId === roomId)
}

export function getRoomByName(name) {
  return rooms.find(r => r.name === name)
}

export function getAllRoomNames() {
  return rooms.map(r => r.name)
}

export function getRoomsByType(type) {
  return rooms.filter(r => r.type === type)
}

export function calculateRoomPrice(roomId, nights = 1) {
  const room = getRoomById(roomId)
  if (!room) return 0
  return room.price * nights
}

export function calculateDownpayment(totalAmount) {
  return Math.round(totalAmount * 0.5)
}

export function calculateRemainingBalance(totalAmount, downpayment) {
  return totalAmount - downpayment
}

// ============================================
// ✅ QUANTITY & AVAILABILITY FUNCTIONS
// ============================================

/**
 * Helper function to safely format a date to YYYY-MM-DD (LOCAL date, not UTC)
 */
function formatLocalDate(date) {
  if (!date) return null;
  
  try {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.warn('⚠️ Invalid date value:', date);
      return null;
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('⚠️ Error formatting date:', date, error);
    return null;
  }
}

/**
 * Get available quantity for a room/cottage on a specific date and reservation type
 */
// In src/data/rooms.js

/**
 * Get available quantity for a specific room
 */
export function getAvailableQuantity(roomId, date, reservationType, existingReservations = []) {
  const room = getRoomById(roomId)
  if (!room) return 0
  
  const targetDate = typeof date === 'string' 
    ? date 
    : date instanceof Date 
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : String(date)
  
  console.log(`🔍 Checking availability for ${room.name} (ID: ${roomId}) on ${targetDate}`)
  
  // Get reservations for this room on this date
  const roomReservations = existingReservations.filter(res => {
    if (res.isDeleted || res.status === 'Cancelled') return false
    
    // Match by roomId or roomName
    const matchesRoom = (res.roomId === room.roomId) || (res.roomName === room.name)
    if (!matchesRoom) return false
    
    const bookingDate = res.bookingDate || res.checkIn
    return bookingDate === targetDate
  })
  
  console.log(`   Found ${roomReservations.length} reservations for this room`)
  
  // Count Full Day bookings (these block everything for that unit)
  const fullDayCount = roomReservations.filter(res => 
    res.reservationType === 'Full Day'
  ).length
  
  if (fullDayCount > 0) {
    console.log(`   ${fullDayCount} Full Day bookings - each blocks one unit`)
    // Each Full Day booking blocks one unit
    return Math.max(0, (room.quantity || 1) - fullDayCount)
  }
  
  // Count specific type bookings
  const specificTypeCount = roomReservations.filter(res => 
    res.reservationType === reservationType
  ).length
  
  console.log(`   ${specificTypeCount} ${reservationType} bookings`)
  
  return Math.max(0, (room.quantity || 1) - specificTypeCount)
}
/**
 * Check if a room/cottage is fully booked for a specific type
 */
export function isFullyBooked(roomId, date, reservationType, existingReservations = []) {
  const available = getAvailableQuantity(roomId, date, reservationType, existingReservations)
  return available === 0
}
/**
 * Check if ALL rooms and cottages are fully booked on a date
 */
export function isDateFullyBooked(date, reservationType, existingReservations = []) {
  const targetDate = formatLocalDate(date)
  if (!targetDate) return false
  
  return rooms.every(room => 
    isFullyBooked(room.id, targetDate, reservationType, existingReservations)
  )
}

/**
 * Get total available capacity for a date (for "All Rooms" view)
 */
export function getTotalAvailableCapacity(date, reservationType, existingReservations = []) {
  const details = getAvailabilityDetails(date, reservationType, existingReservations)
  
  // Sum up available quantities for ALL rooms
  const total = details.reduce((sum, room) => sum + room.availableQuantity, 0)
  
  console.log(`📊 Total available for ${date} (${reservationType}): ${total}`)
  
  return total
}
/**
 * Get total capacity (maximum bookable units)
 */
export function getTotalCapacity() {
  return rooms.reduce((total, room) => total + room.quantity, 0)
}

// In src/data/rooms.js

// In src/data/rooms.js

/**
 * Get availability details for all rooms/cottages on a date
 * @param {string} date - Date to check (YYYY-MM-DD)
 * @param {string} reservationType - 'Day Time', 'Night Time', or 'Full Day'
 * @param {Array} existingReservations - Array of existing reservations
 * @returns {Array} Array of rooms with availability info
 */
/**
 * Get availability details for all rooms/cottages on a date
 */
export function getAvailabilityDetails(date, reservationType, existingReservations = []) {
  const targetDate = typeof date === 'string' 
    ? date 
    : date instanceof Date 
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : String(date)
  
  console.log(`📊 getAvailabilityDetails for ${targetDate} (${reservationType})`)
  console.log(`📋 Total reservations: ${existingReservations.length}`)
  
  return rooms.map(room => {
    // Get all reservations for this room on this date
    const roomReservations = existingReservations.filter(res => {
      if (res.isDeleted || res.status === 'Cancelled') return false
      
      // Match by roomId or roomName
      const matchesRoom = (res.roomId === room.roomId) || (res.roomName === room.name)
      if (!matchesRoom) return false
      
      const bookingDate = res.bookingDate || res.checkIn
      return bookingDate === targetDate
    })
    
    console.log(`🏠 ${room.name} (${room.roomId}): ${roomReservations.length} reservations on ${targetDate}`)
    
    // Check if there's a Full Day booking
    const hasFullDay = roomReservations.some(res => res.reservationType === 'Full Day')
    
    // Count how many of the current type are booked
    const specificTypeCount = roomReservations.filter(res => 
      res.reservationType === reservationType
    ).length
    
    // Count how many Full Day bookings
    const fullDayCount = roomReservations.filter(res => 
      res.reservationType === 'Full Day'
    ).length
    
    // Calculate available quantity
    let availableQuantity = room.quantity || 1
    
    if (hasFullDay) {
      // Full Day bookings block this room completely
      // If there are multiple units, Full Day bookings reduce availability
      availableQuantity = Math.max(0, (room.quantity || 1) - fullDayCount)
      console.log(`   🔴 ${fullDayCount} Full Day booking(s) - ${availableQuantity} remaining`)
    } else {
      // No Full Day, check specific type
      availableQuantity = Math.max(0, (room.quantity || 1) - specificTypeCount)
      console.log(`   🟢 ${specificTypeCount} ${reservationType} booking(s) - ${availableQuantity} available`)
    }
    
    return {
      ...room,
      availableQuantity,
      bookedQuantity: (room.quantity || 1) - availableQuantity,
      isAvailable: availableQuantity > 0,
      isFullyBooked: availableQuantity === 0,
      availabilityPercentage: Math.round((availableQuantity / (room.quantity || 1)) * 100),
      // Debug info
      hasFullDay,
      fullDayCount,
      specificTypeCount,
      roomReservations: roomReservations.map(r => ({
        type: r.reservationType,
        id: r.reservationId
      }))
    }
  })
}
// ============================================
// EXPORT DEFAULT (for backward compatibility)
// ============================================

export default {
  rooms,
  BOOKING_CONFIG,
  RESERVATION_TYPES,
  RESERVATION_TYPE_INFO,
  getRoomById,
  getRoomByRoomId,
  getRoomByName,
  getAllRoomNames,
  getRoomsByType,
  calculateRoomPrice,
  calculateDownpayment,
  calculateRemainingBalance,
  getAvailableQuantity,
  isFullyBooked,
  isDateFullyBooked,
  getTotalAvailableCapacity,
  getTotalCapacity,
  getAvailabilityDetails
}