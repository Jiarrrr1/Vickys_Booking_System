<template>
  <div class="flex min-h-screen">
    <Sidebar
      :active-section="activeSection"
      @navigate="handleNavigate"
      @logout="handleLogout"
    />
    <main class="flex-1 bg-neutral-50 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const route = useRoute()

const activeSection = computed(() => {
  const routeToSection = {
    'Dashboard': 'dashboard',
    'Bookings': 'bookings',
    'Rooms': 'rooms',
    'Customers': 'customers',
    'Payments': 'payments',
    'Reports': 'reports'
  }
  return routeToSection[route.name] || 'dashboard'
})

const handleNavigate = (section) => {
  const sectionToRoute = {
    'dashboard': '/',
    'bookings': '/bookings',
    'rooms': '/rooms',
    'customers': '/customers',
    'payments': '/payments',
    'feedbacks': '/Feedbacks'
  }
  router.push(sectionToRoute[section] || '/')
}

const handleLogout = () => {
  // Clear any stored auth
  localStorage.removeItem('isAuthenticated')
  // Redirect to login
  router.push('/login')
}
</script>