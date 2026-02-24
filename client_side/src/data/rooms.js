// src/data/rooms.js
import roseImg from '@/assets/photos/rose.png'
import tulipImg from '@/assets/photos/tulip.png'
import callalilyImg from '@/assets/photos/callalily.png'
import stargazerImg from '@/assets/photos/stargazer.png'

export const rooms = [
  {
    id: 1,
    img: roseImg,
    name: 'Rose Room',
    description: 'Find tranquility in the Rose Room...',
    capacity: '5–8 pax',
    amenities: ['Air Conditioning', 'Double Deck Bed', 'Private Pool Access', 'Garden View'],
    price: 1000,
    badge: 'Featured Room'
  },
  {
    id: 2,
    img: tulipImg,
    name: 'Tulip Room',
    description: 'The Tulip Room offers a bright and welcoming space...',
    capacity: '5–6 pax',
    amenities: ['Air Conditioning', 'Double Deck Bed', 'Private Pool Access', 'Garden View'],
    price: 1000,
    badge: 'Featured Room'
  },
  {
    id: 3,
    img: callalilyImg,
    name: 'Callalily Room',
    description: 'Designed for small groups seeking a quiet getaway...',
    capacity: '5–6 pax',
    amenities: ['Air Conditioning', 'Double Deck Bed', 'Private Pool Access', 'Garden View'],
    price: 1000,
    badge: 'Featured Room'
  },
  {
    id: 4,
    img: stargazerImg,
    name: 'Stargazer Room',
    description: 'Our largest room built for bigger groups...',
    capacity: '10–15 pax',
    amenities: ['Air Conditioning', '2 Double Deck Beds', 'Private Pool Access', 'Garden View'],
    price: 1700,
    badge: 'Featured Room'
  }
]