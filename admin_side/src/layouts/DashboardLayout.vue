<template>
  <!-- APP SHELL -->
  <div id="app-shell">
    <!-- Sidebar Component -->
    <Sidebar />

    <!-- Main Area -->
    <div class="main">
      <!-- Header Component -->
      <Header :title="pageTitle" :subtitle="pageSubtitle" />

      <!-- Content Area - Router View -->
      <div class="content">
        <router-view v-slot="{ Component }" :key="$route.fullPath" >
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

const route = useRoute()

// Page titles based on current route
const pageMeta = {
  Dashboard: {
    title: 'Dashboard',
    subtitle: "Welcome back! Here's what's happening today."
  },
  Bookings: {
    title: 'Bookings',
    subtitle: 'View and manage all guest reservations.'
  },
  Payments: {
    title: 'Payments',
    subtitle: 'Track all incoming payments and transaction records.'
  },
  Revenue: {
    title: 'Revenue',
    subtitle: 'Track income by month or full year.'
  }
}

const pageTitle = computed(() => {
  return pageMeta[route.name]?.title || 'Dashboard'
})

const pageSubtitle = computed(() => {
  return pageMeta[route.name]?.subtitle || 'Welcome back!'
})
</script>

<style scoped>
/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>