<!-- src/components/Accomodations.vue -->
<template>
  <section id="rooms">
    <div class="rooms-inner">
      <div class="rooms-header fade-up visible">
        <div>
          <div class="section-label"><span>Accommodations</span></div>
          <h2>Our Rooms</h2>
        </div>
        <p>Cozy, clean, and designed for rest — each room is your private sanctuary during your stay.</p>
      </div>

      <div class="fade-up visible">
        <div class="rooms-track">
          <!-- Slides container -->
          <div class="rooms-slides" ref="track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <!-- Loop through rooms -->
            <div v-for="room in rooms" :key="room.id" class="room-slide">
              <div class="room-card">
                <div class="room-info">
                  <span class="room-badge">{{ room.badge }}</span>
                  <h3 class="room-name">{{ room.name }}</h3>
                  <p class="room-capacity">✦ Good for {{ room.capacity }}</p>
                  <p class="room-desc-text">{{ room.description }}</p>
                  <div class="room-amenities">
                    <div v-for="(amenity, index) in room.amenities" :key="index" class="amenity-row">
                      <span class="amenity-icon">
                        {{ amenity.includes('Air') ? '❄' : 
                           amenity.includes('Bed') ? '🛏' : 
                           amenity.includes('Pool') ? '🏊' : '🌿' }}
                      </span> 
                      {{ amenity }}
                    </div>
                  </div>
                  <div class="room-price-area">
                    <div>
                      <div class="room-price">₱{{ room.price.toLocaleString() }}</div>
                      <div class="room-price-label">per night</div>
                    </div>
                    <a :href="`/rooms.html#${room.name.toLowerCase().replace(' ', '-')}`" class="btn-book">Book Now</a>
                  </div>
                </div>
                <div class="room-img-panel">
                  <img :src="room.img" :alt="room.name">
                  <div class="room-img-label">{{ room.name.split(' ')[0] }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider controls -->
        <div class="rooms-controls">
          <div class="rooms-counter">
            <strong>{{ currentSlideDisplay }}</strong>&nbsp;/&nbsp;04
          </div>
          <div class="rooms-arrows">
            <button 
              class="rooms-arrow" 
              @click="prevSlide"
              :disabled="currentSlide === 0"
            >←</button>
            <button 
              class="rooms-arrow" 
              @click="nextSlide"
              :disabled="currentSlide === rooms.length - 1"
            >→</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { rooms } from '@/data/rooms'  // Import the rooms data

// State
const currentSlide = ref(0)
const track = ref(null)
const touchStartX = ref(0)
const MOBILE_BREAKPOINT = 768
const isMobile = ref(false)

// Computed
const currentSlideDisplay = computed(() => {
  return String(currentSlide.value + 1).padStart(2, '0')
})

// Check if mobile view
const checkMobile = () => {
  isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT
}

// Navigation methods
const goToSlide = (n) => {
  currentSlide.value = Math.max(0, Math.min(n, rooms.length - 1))
}

const prevSlide = () => {
  goToSlide(currentSlide.value - 1)
}

const nextSlide = () => {
  goToSlide(currentSlide.value + 1)
}

// Touch handlers
const handleTouchStart = (e) => {
  if (isMobile.value) return
  touchStartX.value = e.touches[0].clientX
}

const handleTouchEnd = (e) => {
  if (isMobile.value) return
  
  const touchEndX = e.changedTouches[0].clientX
  const diffX = touchEndX - touchStartX.value
  
  if (Math.abs(diffX) > 50) {
    if (diffX < 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
}

// Keyboard navigation
const handleKeyDown = (e) => {
  const roomsSection = document.getElementById('rooms')
  if (!roomsSection) return
  
  const rect = roomsSection.getBoundingClientRect()
  const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
  
  if (isInViewport && !isMobile.value) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prevSlide()
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextSlide()
    }
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', handleKeyDown)
  
  if (track.value) {
    track.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    track.value.addEventListener('touchend', handleTouchEnd)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', handleKeyDown)
  
  if (track.value) {
    track.value.removeEventListener('touchstart', handleTouchStart)
    track.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>