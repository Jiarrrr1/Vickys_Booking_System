// ============================================
// ROOM IMAGES DATA
// ============================================
// File: src/data/roomImages.js

import roseImg1 from '../assets/photos/rose.png'
// import roseImg2 from '../assets/photos/rose-2.png'
// import roseImg3 from '../assets/photos/rose-3.png'
import tulipImg1 from '../assets/photos/tulip.png'
// import tulipImg2 from '../assets/photos/tulip-2.png'
// import tulipImg3 from '../assets/photos/tulip-3.png'
import callalilyImg1 from '../assets/photos/callalily.png'
// import callalilyImg2 from '../assets/photos/callalily-2.png'
// import callalilyImg3 from '../assets/photos/callalily-3.png'
import stargazerImg1 from '../assets/photos/stargazer.png'
// import stargazerImg2 from '../assets/photos/stargazer-2.png'
// import stargazerImg3 from '../assets/photos/stargazer-3.png'
import cottageImg1 from '../assets/photos/c8f4899a1049ae567526db58d5798351c77b5c94.png'
// import cottageImg2 from '../assets/photos/cottage-2.png'
// import cottageImg3 from '../assets/photos/cottage-3.png'

export const roomImages = {
  // Rose Room
  'ROSE001': [
    { id: 1, url: roseImg1, alt: 'Rose Room Main View', isMain: true },
    { id: 2, url: tulipImg1, alt: 'Rose Room Bed Area' },
    { id: 3, url: roseImg1, alt: 'Rose Room Private Pool' }
  ],
  
  // Tulip Room
  'TULIP002': [
    { id: 1, url: tulipImg1, alt: 'Tulip Room Main View', isMain: true },
    { id: 2, url: tulipImg1, alt: 'Tulip Room Interior' },
    { id: 3, url: tulipImg1, alt: 'Tulip Room Garden View' }
  ],
  
  // Callalily
  'CALLA003': [
    { id: 1, url: callalilyImg1, alt: 'Callalily Main View', isMain: true },
    { id: 2, url: callalilyImg1, alt: 'Callalily Bed Area' },
    { id: 3, url: callalilyImg1, alt: 'Callalily Private Cottage' }
  ],
  
  // Stargazer
  'STAR004': [
    { id: 1, url: stargazerImg1, alt: 'Stargazer Main View', isMain: true },
    { id: 2, url: stargazerImg1, alt: 'Stargazer Living Area' },
    { id: 3, url: stargazerImg1, alt: 'Stargazer Mini Kitchen' }
  ],
  
  // Garden Cottage
  'COTTAGE': [
    { id: 1, url: cottageImg1, alt: 'Garden Cottage Exterior', isMain: true },
    { id: 2, url: cottageImg1, alt: 'Garden Cottage Seating Area' },
    { id: 3, url: cottageImg1, alt: 'Garden Cottage Grill Area' }
  ]
}

// Helper function to get images by room ID
export function getRoomImages(roomId) {
  return roomImages[roomId] || []
}

// Helper function to get main image for a room
export function getMainRoomImage(roomId) {
  const images = roomImages[roomId]
  if (!images) return null
  return images.find(img => img.isMain) || images[0]
}

// Helper function to get all room IDs that have images
export function getRoomsWithImages() {
  return Object.keys(roomImages)
}

export default roomImages