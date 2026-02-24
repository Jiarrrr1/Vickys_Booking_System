<!-- src/components/HeroSection.vue -->
<template>
  <section id="hero">
    <div class="hero-slides">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="hero-slide" 
        :class="{ 'active': currentSlide === index }"
      >
        <img :src="slide.image" :alt="slide.alt">
      </div>
    </div>
    
    <div class="hero-overlay"></div>
    
    <div class="hero-content">
      <p class="hero-eyebrow">✦ &nbsp; Bustos, Bulacan &nbsp; ✦</p>
      <h1 class="hero-title">Escape the Noise.<br><em>Embrace the Calm.</em></h1>
      <p class="hero-sub">A peaceful countryside retreat perfect for families, barkada getaways, and unforgettable celebrations — just 45 minutes from the city.</p>
      <div class="hero-btns">
        <a href="#rooms" class="btn-primary">Book Your Stay</a>
        <a href="#experience" class="btn-secondary">Explore Resort</a>
      </div>
    </div>
    
    <!-- Slideshow dot indicators -->
    <div class="hero-indicators">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="hero-dot" 
        :class="{ 'active': currentSlide === index }"
        @click="goToSlide(index)"
      ></div>
    </div>
    
    <div class="hero-scroll">Scroll to Explore</div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Solution A: Import images directly (recommended for Vite)
import img1 from '@/assets/images/6e6b6e5e3b19d5deb5ed88163212117e89cba45e.png'
import img2 from '@/assets/images/2fd1796e17c43057572d335d66f75a8c0e858f0c.png'
import img3 from '@/assets/images/8c46d9e3240c9aa2319246299ed08a3b82280d99.png'

// Slides data with imported images
const slides = ref([
  {
    image: img1,
    alt: 'Resort Pool'
  },
  {
    image: img2,
    alt: 'Resort Garden'
  },
  {
    image: img3,
    alt: 'Pool View'
  }
])

// State
const currentSlide = ref(0)
let slideTimer = null

// Go to specific slide
const goToSlide = (index) => {
  currentSlide.value = index
  resetTimer()
}

// Next slide (with wrap-around)
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

// Reset and restart timer
const resetTimer = () => {
  if (slideTimer) {
    clearInterval(slideTimer)
  }
  slideTimer = setInterval(() => {
    nextSlide()
  }, 5000)
}

// Lifecycle hooks
onMounted(() => {
  // Start the slideshow
  resetTimer()
})

onUnmounted(() => {
  // Clean up timer when component is destroyed
  if (slideTimer) {
    clearInterval(slideTimer)
  }
})
</script>

