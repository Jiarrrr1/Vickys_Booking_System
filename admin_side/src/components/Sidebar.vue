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
      <router-link to="/admin/dashboard" class="sitem" :class="{ active: currentRoute === 'AdminDashboard' }">
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
      <router-link to="/admin/bookings" class="sitem" :class="{ active: currentRoute === 'AdminBookings' }">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        Bookings
        <span v-if="bookingsCount > 0" class="snbadge">{{ bookingsCount }}</span>
      </router-link>

      <!-- Payments -->
      <router-link to="/admin/payments" class="sitem" :class="{ active: currentRoute === 'AdminPayments' }">
        <svg viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
        Payments
                <span v-if="paymentsCount > 0" class="snbadge">{{ paymentsCount }}</span>

      </router-link>

      <!-- Feedbacks -->
      <router-link to="/admin/feedbacks" class="sitem" :class="{ active: currentRoute === 'AdminFeedbacks' }">
        <svg viewBox="0 0 24 24">
          <path d="M21 15C21 15.5 20.5 16 20 16H6L3 19V5C3 4.5 3.5 4 4 4H20C20.5 4 21 4.5 21 5V15Z"
            stroke="currentColor" fill="none" />
          <circle cx="8" cy="10" r="1.5" fill="currentColor" />
          <circle cx="12" cy="10" r="1.5" fill="currentColor" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" />
        </svg>
        Feedbacks
        <span v-if="feedbacksCount > 0" class="snbadge">{{ feedbacksCount }}</span>
      </router-link>

      

      

      <div class="sgroup">Finance</div>

      <!-- Revenue -->
      <router-link to="/admin/revenue" class="sitem" :class="{ active: currentRoute === 'AdminRevenue' }">
        <svg viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        Revenue
      </router-link>
      
      <div class="sgroup">Utility</div>

      <!-- Payments -->
      <router-link to="/admin/archives" class="sitem" :class="{ active: currentRoute === 'AdminArchives' }">
        <svg viewBox="0 0 24 24">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
        Trash
                <span v-if="trashCount > 0" class="snbadge">{{ trashCount  }}</span>

      </router-link>

      <!-- <div class="sgroup">Settings</div> -->

      <!-- Profile -->
      <!-- <router-link to="/admin/profile" class="sitem" :class="{ active: currentRoute === 'AdminProfile' }">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20v-2a7 7 0 0 1 14 0v2" />
        </svg>
        Profile
      </router-link> -->

      <!-- Settings -->
      <!-- <router-link to="/admin/settings" class="sitem" :class="{ active: currentRoute === 'AdminSettings' }">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.04.04A10 10 0 0 0 12 17.66a10 10 0 0 0 6.36-2.62z" />
          <path d="M16.5 6.5 19 9" />
          <path d="M7.5 6.5 5 9" />
        </svg>
        Settings
      </router-link> -->
    </nav>

    <!-- Logged-in User Chip -->
<div class="sfooter">
  <div class="uchip">
    <div class="uavatar" @click="goToProfile">{{ userInitial }}</div>
    <div class="user-info">
      <div class="uname">{{ userName }}</div>
      <div class="urole">{{ userRole }}</div>
    </div>
    <!-- Logout button - now properly positioned -->
    <button class="logout-btn" @click="handleLogout" title="Logout">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  </div>
</div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth'
import bookingsService from '@/services/bookingService'
import { useFeedbacksService } from '@/services/feedbackService'
import paymentsService from '@/services/paymentsService'
import { useDeletedItemsService } from '@/services/deletedItemsService'

const route = useRoute()
const router = useRouter()

// Current route name for active state
const currentRoute = computed(() => route.name)

// User info from auth service
const userName = computed(() => authService.user?.fullName || 'Admin User')
const userRole = computed(() => 'Administrator')
const userInitial = computed(() => {
  const name = userName.value
  return name ? name.charAt(0).toUpperCase() : 'A'
})
const feedbacksService = useFeedbacksService()
const deletedItemsService = useDeletedItemsService()

// Call the fetch function (don't assign to variable)
deletedItemsService.fetchDeletedItems()

// Use the reactive state directly
console.log('deleted:', deletedItemsService.deletedItems.value)


// Bookings count for badge
const bookingsCount = computed(() => bookingsService.totalBookings || 0)
const feedbacksCount = computed(() => feedbacksService.totalFeedbacks || 0)
const paymentsCount = computed(() => paymentsService.totalPayments || 0)
const trashCount = computed(() => deletedItemsService.deletedItems.value.length || 0)
// Go to profile page when clicking user chip
const goToProfile = () => {
  router.push('/admin/profile')
}

// Add logout function
const handleLogout = async () => {
  await authService.logout()
  router.push('/admin/login')
}
</script>

<style scoped>

/* Active route styling */
.sitem.active {
  background-color: var(--gold-light, #f5e6d3);
  color: var(--forest, #2c5f2d);
  font-weight: 600;
}

.sitem.active svg {
  stroke: var(--forest, #2c5f2d);
}

/* Badge styling */
.snbadge {
  background-color: var(--gold, #c4a77d);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: auto;
}


</style>