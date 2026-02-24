<!-- src/components/NavigationBar.vue -->
<template>
  <nav id="nav" :class="{ 'scrolled': isScrolled }">
    <div class="nav-logo">
      <router-link to="/">Vicky's <span>Resort</span></router-link>
    </div>
    <ul class="nav-links" :class="{ 'open': isMenuOpen }" ref="navLinks">
      <li><router-link to="/" @click="closeMenu">Home</router-link></li>
            <li><router-link to="/rooms" @click="closeMenu">Rooms</router-link></li>

      <li><router-link to="/rates" @click="closeMenu">Rates</router-link></li>
      <li><router-link to="/gallery" @click="closeMenu">Gallery</router-link></li>
      <li><router-link to="/about" @click="closeMenu">About Us</router-link></li>
      <li><router-link to="/" class="nav-book" @click="closeMenu">Book Now</router-link></li>
    </ul>
    <button 
      class="nav-hamburger" 
      :class="{ 'open': isMenuOpen }"
      @click="toggleMenu"
      aria-label="Toggle navigation"
    >
      <span></span><span></span><span></span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const navLinks = ref(null)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 60
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleClickOutside = (event) => {
  const nav = document.getElementById('nav')
  if (nav && !nav.contains(event.target) && isMenuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>