<template>
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <!-- Logo / Brand -->
    <div class="slogo">
      <div class="smark">
        <!-- Palm-tree icon -->
        <svg viewBox="0 0 24 24">
          <path d="M12 22V12" />
          <path d="M12 12C12 8 9 5 5 4c1 3 3 5 7 8" />
          <path d="M12 12c0-4 3-7 7-8-1 3-3 5-7 8" />
          <path d="M9 22h6" />
        </svg>
      </div>
      <div>
        <div class="sbname">Vicky's Resort</div>
        <div class="sbsub">Admin Dashboard</div>
      </div>
    </div>

    <!-- Navigation Items -->
    <nav class="snav">
      <div class="sgroup">Main</div>

      <!-- Dashboard -->
      <router-link to="/dashboard" class="sitem" :class="{ active: currentRoute === 'Dashboard' }">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        Dashboard
      </router-link>

      <div class="sgroup">Operations</div>

      <!-- Bookings -->
      <router-link to="/bookings" class="sitem" :class="{ active: currentRoute === 'Bookings' }">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        Bookings
        <span v-if="bookingsCount > 0" class="snbadge">{{ bookingsCount }}</span>
      </router-link>



      <!-- Payments -->
      <router-link to="/payments" class="sitem" :class="{ active: currentRoute === 'Payments' }">
        <svg viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
        Payments
      </router-link>

      <router-link to="/feedbacks" class="sitem" :class="{ active: currentRoute === 'Feedbacks' }">
        <svg viewBox="0 0 24 24">
          <path d="M21 15C21 15.5 20.5 16 20 16H6L3 19V5C3 4.5 3.5 4 4 4H20C20.5 4 21 4.5 21 5V15Z"
            stroke="currentColor" fill="none" />
          <circle cx="8" cy="10" r="1.5" fill="currentColor" />
          <circle cx="12" cy="10" r="1.5" fill="currentColor" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
        </svg>
        Feedbacks
      </router-link>
      <div class="sgroup">Finance</div>

      <!-- Revenue -->
      <router-link to="/revenue" class="sitem" :class="{ active: currentRoute === 'Revenue' }">
        <svg viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        Revenue
      </router-link>
    </nav>

    <!-- Logged-in User Chip -->
    <div class="sfooter">
      <div class="uchip">
        <div class="uavatar">{{ userInitial }}</div>
        <div>
          <div class="uname">{{ userName }}</div>
          <div class="urole">{{ userRole }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import authService from '@/services/auth'  // ✅ Default import - correct
import bookingsService from '@/services/bookingService'  // ✅ Default import - fixed

const route = useRoute()

// Current route name for active state
const currentRoute = computed(() => route.name)

// User info from auth service
const userName = computed(() => authService.user?.name || 'Admin User')
const userRole = computed(() => authService.user?.role || 'Administrator')
const userInitial = computed(() => {
  const name = userName.value
  return name ? name.charAt(0).toUpperCase() : 'A'
})

// Bookings count for badge - use the service directly
const bookingsCount = computed(() => bookingsService.totalBookings || 0)
</script>

<style scoped>
/* Sidebar styles are in base.css */
/* Component-specific styles can be added here if needed */
</style>