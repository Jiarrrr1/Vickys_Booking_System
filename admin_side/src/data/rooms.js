// src/data/rooms.js
// Static room data for the resort

export const rooms = [
  {
    id: 1,
    roomId: 'ROSE001',
    icon: '🌹',
    name: 'Rose Room',
    shortName: 'Rose Room',
    capacity: '5–8 pax',
    price: 1000,
    badge: 'Featured Room',
    available: true,
    amenities: [
      'Air Conditioning', 
      'Double Deck Bed', 
      'Private Pool Access', 
      'Garden View'
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: 'Double Deck Bed' }
    ],
    prices: [
      { amount: 1000, label: 'per night' }
    ]
  },
  {
    id: 2,
    roomId: 'TULIP001',
    icon: '🌷',
    name: 'Tulip Room',
    shortName: 'Tulip Room',
    capacity: '5–6 pax',
    price: 1000,
    badge: 'Featured Room',
    available: true,
    amenities: [
      'Air Conditioning', 
      'Double Deck Bed', 
      'Private Pool Access', 
      'Garden View'
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: 'Double Deck Bed' }
    ],
    prices: [
      { amount: 1000, label: 'per night' }
    ]
  },
  {
    id: 3,
    roomId: 'CALLA001',
    icon: '🌸',
    name: 'Callalily Room',
    shortName: 'Callalily Room',
    capacity: '5–6 pax',
    price: 1000,
    badge: 'Featured Room',
    available: true,
    amenities: [
      'Air Conditioning', 
      'Double Deck Bed', 
      'Private Pool Access', 
      'Garden View'
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: 'Double Deck Bed' },
      { icon: '🛖', label: 'Private Cottage' },
      { icon: '🚿', label: 'Comfort Room' }
    ],
    prices: [
      { amount: 1000, label: 'room rate' },
      { amount: 500, label: 'cottage only', small: true }
    ]
  },
  {
    id: 4,
    roomId: 'STAR001',
    icon: '⭐',
    name: 'Stargazer Room',
    shortName: 'Stargazer Room',
    capacity: '10–20 pax',
    price: 1500,
    badge: 'Featured Room',
    available: true,
    amenities: [
      'Air Conditioning', 
      '2 Double Deck Beds', 
      'Private Pool Access', 
      'Garden View'
    ],
    features: [
      { icon: '❄', label: 'Air Conditioning' },
      { icon: '🛏', label: '2× Double Deck Beds' },
      { icon: '🛌', label: '1 Regular Bed' },
      { icon: '📺', label: 'Television' },
      { icon: '🚿', label: 'Comfort Room' },
      { icon: '🍳', label: 'Mini Kitchen' }
    ],
    prices: [
      { amount: 1500, label: 'per night' }
    ]
  }
]

// Booking configuration constants
export const BOOKING_CONFIG = {
  leadDays: 3,      // Minimum days in advance to book
  maxNights: 14,    // Maximum consecutive nights
  minGuests: 1,     // Minimum number of guests
  maxGuests: 20     // Maximum number of guests
}

// Helper function to get room by ID
export function getRoomById(id) {
  return rooms.find(room => room.id === id)
}

// Helper function to get room by roomId
export function getRoomByRoomId(roomId) {
  return rooms.find(room => room.roomId === roomId)
}

// Helper function to get room by name
export function getRoomByName(name) {
  return rooms.find(room => room.name === name)
}

// Helper function to get all room names
export function getAllRoomNames() {
  return rooms.map(room => room.name)
}

// Helper function to calculate room price for given nights
export function calculateRoomPrice(roomId, nights) {
  const room = getRoomById(roomId)
  if (!room) return 0
  return room.price * nights
}

// Helper function to calculate downpayment (50%)
export function calculateDownpayment(totalAmount) {
  return Math.round(totalAmount * 0.5)
}

// Helper function to calculate remaining balance
export function calculateRemainingBalance(totalAmount, downpayment) {
  return totalAmount - downpayment
}