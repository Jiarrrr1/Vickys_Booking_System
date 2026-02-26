// src/data/rooms.js
import roseImg from '@/assets/photos/rose.png'
import tulipImg from '@/assets/photos/tulip.png'
import callalilyImg from '@/assets/photos/callalily.png'
import stargazerImg from '@/assets/photos/stargazer.png'



export const rooms = [
  {
    id: 1,
    img: roseImg,
    icon: '🌹',
    name: 'Rose Room',
    shortName: 'Rose Room',
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
    img: tulipImg,
    icon: '🌷',
    name: 'Tulip Room',
    shortName: 'Tulip Room',
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
    img: callalilyImg,
    icon: '🌸',
    name: 'Callalily',
    shortName: 'Callalily Room',
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
    img: stargazerImg,
     icon: '⭐',
    name: 'Stargazer ',
    shortName: 'Stargazer Room',
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
  }
]