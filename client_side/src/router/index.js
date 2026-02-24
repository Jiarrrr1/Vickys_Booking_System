// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import RoomPage from '@/views/RoomPage.vue'
import RatesPage from '@/views/RatesPage.vue'
import AboutPage from '@/views/AboutPage.vue'
import GalleryPage from '@/views/GalleryPage.vue'

// Import other pages as needed

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: RoomPage
  },
  {
    path: '/rates',
    name: 'Rates',
    component: RatesPage
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: GalleryPage
  },

  // Add more routes as needed
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to top when navigating to a new page
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router