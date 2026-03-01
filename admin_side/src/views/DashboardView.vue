<template>
  <section class="section fu">
    <!-- Section Header -->
    <div class="shead">
      <div class="stitle">Dashboard Overview</div>
      <div class="sdesc">Welcome back! Here's what's happening at Vicky's Resort today.</div>
    </div>

    <!-- Stat Cards Row -->
    <div class="stats-grid">
      <!-- Total Bookings -->
      <StatCard
        :value="142"
        label="Total Bookings"
        color-class="cb"
        badge="+15%"
        class="fu1"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </template>
      </StatCard>

      <!-- Today's Bookings -->
      <StatCard
        :value="8"
        label="Today's Bookings"
        color-class="cg"
        badge="+12%"
        class="fu2"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </template>
      </StatCard>

      <!-- Upcoming Check-ins -->
      <StatCard
        :value="12"
        label="Upcoming Check-ins"
        color-class="ca"
        badge="+4"
        class="fu3"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </template>
      </StatCard>

      <!-- Available Rooms -->
      <StatCard
        :value="7"
        label="Available Rooms"
        color-class="cg"
        badge="+2"
        class="fu4"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Recent Bookings Table -->
    <div class="dash-grid-single fu5">
      <div class="card">
        <!-- Card Header -->
        <div class="card-head">
          <div>
            <div class="card-title">Recent Bookings</div>
            <div class="card-sub">Sorted by booking date — most recently booked first</div>
          </div>
          <router-link to="/bookings" class="btn-g">
            View all
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </router-link>
        </div>

        <!-- Table -->
        <div class="twrap">
          <table>
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="tdn">Miguel Ramos</td>
                <td>Standard Room</td>
                <td>Mar 28, 2026</td>
                <td>Mar 30, 2026</td>
                <td><span class="pill confirmed">Confirmed</span></td>
              </tr>
              <tr>
                <td class="tdn">Daniel Cruz</td>
                <td>Family Suite</td>
                <td>Apr 12, 2026</td>
                <td>Apr 15, 2026</td>
                <td><span class="pill confirmed">Confirmed</span></td>
              </tr>
              <tr>
                <td class="tdn">Sofia Valdez</td>
                <td>Garden View</td>
                <td>Apr 5, 2026</td>
                <td>Apr 8, 2026</td>
                <td><span class="pill confirmed">Confirmed</span></td>
              </tr>
              <tr>
                <td class="tdn">Elena Torres</td>
                <td>Deluxe Suite</td>
                <td>Mar 25, 2026</td>
                <td>Mar 28, 2026</td>
                <td><span class="pill confirmed">Confirmed</span></td>
              </tr>
              <tr>
                <td class="tdn">Roberto Aquino</td>
                <td>Mountain View</td>
                <td>Mar 18, 2026</td>
                <td>Mar 21, 2026</td>
                <td><span class="pill confirmed">Confirmed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth if needed
  if (authStore.token) {
    authStore.initializeAuth()
  }
})
</script>

<style scoped>
.dash-grid-single {
  margin-top: 24px;
}
</style>