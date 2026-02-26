// src/data/reservations.js

export const reservations = [
  {
    id: 1,
    roomId: 1,
    roomName: 'Deluxe Suite',
    checkIn: '2026-02-26',
    checkOut: '2026-02-28',
    guestName: 'John Doe',
    status: 'confirmed'
  },
  {
    id: 2,
    roomId: 1,
    roomName: 'Deluxe Suite',
    checkIn: '2026-03-01',
    checkOut: '2026-03-05',
    guestName: 'Jane Smith',
    status: 'confirmed'
  },
  {
    id: 3,
    roomId: 2,
    roomName: 'Family Room',
    checkIn: '2026-02-27',
    checkOut: '2026-03-02',
    guestName: 'Bob Johnson',
    status: 'confirmed'
  },
  {
    id: 4,
    roomId: 1,
    roomName: 'Deluxe Suite',
    checkIn: '2026-03-10',
    checkOut: '2026-03-15',
    guestName: 'Alice Brown',
    status: 'confirmed'
  },
  {
    id: 5,
    roomId: 3,
    roomName: 'Standard Room',
    checkIn: '2026-03-20',
    checkOut: '2026-03-25',
    guestName: 'Charlie Wilson',
    status: 'confirmed'
  }
]

// Export for backward compatibility
export const existingReservations = reservations