<template>
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <!-- Logo / Brand -->
    <div class="slogo">
      <div class="smark">
        <!-- Palm-tree icon -->
        <svg viewBox="0 0 24 24">
          <path d="M12 22V12"/>
          <path d="M12 12C12 8 9 5 5 4c1 3 3 5 7 8"/>
          <path d="M12 12c0-4 3-7 7-8-1 3-3 5-7 8"/>
          <path d="M9 22h6"/>
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
      <router-link 
        to="/" 
        class="sitem"
        :class="{ active: currentRoute === 'Dashboard' }"
      >
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        Dashboard
      </router-link>

      <!-- Bookings -->
      <router-link 
        to="/bookings" 
        class="sitem"
        :class="{ active: currentRoute === 'Bookings' }"
      >
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        Bookings
        <span v-if="bookingsCount > 0" class="snbadge">{{ bookingsCount }}</span>
      </router-link>

      <!-- Payments -->
      <router-link 
        to="/payments" 
        class="sitem"
        :class="{ active: currentRoute === 'Payments' }"
      >
        <svg viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <path d="M1 10h22"/>
        </svg>
        Payments
      </router-link>

      <!-- Revenue -->
      <router-link 
        to="/revenue" 
        class="sitem"
        :class="{ active: currentRoute === 'Revenue' }"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'

const route = useRoute()
const authStore = useAuthStore()
const bookingsStore = useBookingsStore()

// Current route name for active state
const currentRoute = computed(() => route.name)

// User info from auth store
const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)
const userInitial = computed(() => authStore.userInitial)

// Bookings count for badge
const bookingsCount = computed(() => bookingsStore.totalBookings)
</script>

<style scoped>
/* Sidebar styles are in base.css */
/* Component-specific styles can be added here if needed */
</style>