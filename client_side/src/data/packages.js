// src/data/packages.js
export const packages = [
  {
    id: 1,
    icon: '🏖️',
    name: 'Full Venue',
    capacity: '70–100 guests',
    subtitle: 'Private Rent · Complete Resort Access',
    inclusions: [
      'Room A or B',
      'Kubo Cottages',
      'Tables, Chairs, Grill & Videoke',
      'Full Venue Exclusive Use'
    ],
    featured: true,
    featuredLabel: 'Best Value',
    rates: {
      day: { label: 'Day Time', hours: '8:00 AM – 5:00 PM', price: 9500 },
      night: { label: 'Night Time', hours: '5:00 PM – 12:00 AM', price: 10000 }
    }
  },
  {
    id: 2,
    icon: '🌊',
    name: 'Upper Pool',
    capacity: '50–70 guests',
    subtitle: 'Kiddy Pool & Cottages',
    inclusions: [
      'Kiddy Pool Access',
      'Kubo Cottages',
      'Tables, Chairs, Grill & Videoke'
    ],
    featured: false,
    featuredLabel: null,
    rates: {
      day: { label: 'Day Time', hours: '8:00 AM – 5:00 PM', price: 6500 },
      night: { label: 'Night Time', hours: '5:00 PM – 12:00 AM', price: 7000 }
    }
  },
  {
    id: 3,
    icon: '🎢',
    name: 'Lower Pool',
    capacity: '30–50 guests',
    subtitle: 'Covered Pool with Slide',
    inclusions: [
      'Covered Pool with Water Slide',
      'Callalily Cottages',
      'Tables, Chairs, Grill & Videoke'
    ],
    featured: false,
    featuredLabel: null,
    rates: {
      day: { label: 'Day Time', hours: '8:00 AM – 5:00 PM', price: 5500 },
      night: { label: 'Night Time', hours: '5:00 PM – 12:00 AM', price: 6000 }
    }
  }
]