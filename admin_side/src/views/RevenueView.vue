<!-- src/views/RevenueView.vue -->
<template>
  <div class="revenue-view">
    <section class="section fu">
      <!-- Filter Options Panel -->
      <div class="rev-control-panel fu1">
        <!-- Panel heading row -->
        <div class="rev-cp-header">
          <div class="rev-cp-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <span>Filter Options</span>
        </div>

        <!-- Panel controls row -->
        <div class="rev-cp-body">
          <!-- Step 1: Select Year -->
          <div class="rev-filter-group">
            <label class="rev-filter-label" for="rev-year">
              <span class="step-num">1</span> Year
            </label>
            <select class="rev-sel" id="rev-year" v-model="selectedYear" @change="handleYearChange">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <!-- Step 2: Select Month -->
          <div class="rev-filter-group">
            <label class="rev-filter-label" for="rev-month">
              <span class="step-num">2</span> Month
            </label>
            <select 
              class="rev-sel" 
              id="rev-month" 
              v-model="selectedMonth" 
              @change="handleMonthChange"
              :disabled="viewMode === 'yearly'"
            >
              <option v-for="(month, index) in months" :key="index" :value="index">
                {{ month }}
              </option>
            </select>
          </div>

          <!-- Vertical divider -->
          <div class="rev-cp-divider"></div>

          <!-- Step 3: Choose View Mode -->
          <div class="rev-filter-group">
            <label class="rev-filter-label">
              <span class="step-num">3</span> View Mode
            </label>
            <div class="rev-mode-tabs">
              <button 
                class="rev-mode-tab" 
                :class="{ active: viewMode === 'monthly' }"
                @click="switchViewMode('monthly')"
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <path d="M16 2v4M8 2v4M3 10h18"></path>
                </svg>
                Monthly
              </button>
              <button 
                class="rev-mode-tab" 
                :class="{ active: viewMode === 'yearly' }" 
                @click="switchViewMode('yearly')"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Yearly
              </button>
            </div>
          </div>

          <!-- Search box (only visible in monthly view) -->
          <div class="rev-table-search" id="rev-search-box" v-if="viewMode === 'monthly'">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              id="rev-search-input" 
              placeholder="Search guest or booking ID..." 
              v-model="searchQuery"
              @input="handleSearch"
            >
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="revenueService.isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading revenue data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="revenueService.error" class="error-container">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
        <h3>Error Loading Data</h3>
        <p>{{ revenueService.error }}</p>
        <button class="retry-btn" @click="loadData">Retry</button>
      </div>

      <!-- Revenue Data -->
      <template v-else>
        <!-- Overall Records Section -->
        <div class="stat-head">
          <div>
            <div class="card-title">Overall Records</div>
          </div>
        </div>

        <div class="summary-section">
          <div class="upper-grid">
            <StatCard 
              :value="revenueService.summaryStats.totalRevenue.value"
              :label="revenueService.summaryStats.totalRevenue.label" 
              color-class="ca"
              :badge="`${revenueService.summaryStats.totalRevenue.growth.toFixed(1)}%`"
            >
              <template #icon>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </template>
            </StatCard>

            <StatCard 
              :value="revenueService.summaryStats.totalBookings.value"
              :label="revenueService.summaryStats.totalBookings.label" 
              color-class="ca"
              :badge="`${revenueService.summaryStats.totalBookings.growth.toFixed(1)}%`"
            >
              <template #icon>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </template>
            </StatCard>
          </div>

          <!-- Monthly/Yearly Summary Section -->
          <div class="stat-head">
            <div>
              <div class="card-title">
                {{ viewMode === 'monthly' ? 'Monthly Summary' : 'Yearly Summary' }}
              </div>
            </div>
          </div>

          <div class="stats-grid cr">
            <StatCard 
              :value="viewMode === 'monthly' ? revenueService.summaryStats.thisMonth.value : revenueService.summaryStats.thisYear.value"
              :label="viewMode === 'monthly' ? revenueService.summaryStats.thisMonth.label : revenueService.summaryStats.thisYear.label" 
              color-class="cb"
              :badge="`${viewMode === 'monthly' ? revenueService.summaryStats.thisMonth.growth.toFixed(1) : revenueService.summaryStats.thisYear.growth.toFixed(1)}%`"
            >
              <template #icon>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </template>
            </StatCard>

            <StatCard 

              :value="viewMode === 'monthly' ? revenueService.summaryStats.monthlyBookings.value : revenueService.summaryStats.yearlyBookings.value"
              :label="viewMode === 'monthly' ? revenueService.summaryStats.monthlyBookings.label : revenueService.summaryStats.yearlyBookings.label" 
              color-class="cb"
              :badge="`${viewMode === 'monthly' ? revenueService.summaryStats.monthlyBookings.growth.toFixed(1) : revenueService.summaryStats.yearlyBookings.growth.toFixed(1)}%`"
            >
              <template #icon>
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </template>
            </StatCard>
          </div>
        </div>

        <!-- Revenue Table -->
        <div class="card fu2">
          <div class="card-head">
            <div>
              <div class="card-title">
                {{ viewMode === 'monthly' ? 'Monthly Revenue Breakdown' : 'Yearly Revenue Breakdown' }}
              </div>
              <div class="card-sub">
                {{ viewMode === 'monthly' ? months[selectedMonth] : 'Full Year' }} {{ selectedYear }}
              </div>
            </div>
          </div>

          <div class="twrap">
            <!-- Monthly View Table -->
            <table
              v-if="viewMode === 'monthly' && revenueService.paymentsByMonth && revenueService.paymentsByMonth.length > 0"
            >
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Guest Name</th>
                  <th>Room</th>
                  <th>Nights</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in revenueService.paymentsByMonth" :key="payment.id">
                  <td class="tdm">{{ payment.id || '—' }}</td>
                  <td class="tdn">{{ payment.guest || '—' }}</td>
                  <td>{{ payment.room || '—' }}</td>
                  <td style="text-align:center;">{{ payment.nights || 1 }}</td>
                  <td class="tdm">{{ revenueService.formatAmount(payment.amt) }}</td>
                  <td>
                    <span class="tag tag-g">{{ payment.method || 'GCash' }}</span>
                  </td>
                  <td>{{ payment.date || '—' }}</td>
                  <td>
                    <span class="badge-paid">{{ payment.status || 'Paid' }}</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tr-total">
                  <td colspan="4" style="text-align:right;padding-right:15px;">
                    Total Revenue This Month
                  </td>
                  <td class="tdm">{{ revenueService.formatAmount(revenueService.monthlyRevenue) }}</td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>

            <!-- Yearly View Table -->
            <table v-else-if="viewMode === 'yearly' && revenueService.filteredMonthlyBreakdown">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Avg per Booking</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="month in revenueService.filteredMonthlyBreakdown" 
                  :key="month.monthIndex"
                  :class="{ 'row-no-data': month.bookings === 0 }"
                >
                  <td class="tdn">{{ month.month }}</td>
                  <td style="text-align:center;">{{ month.bookings || '—' }}</td>
                  <td class="tdm">{{ month.revenue ? revenueService.formatAmount(month.revenue) : '—' }}</td>
                  <td>{{ month.avgPerBooking ? revenueService.formatAmount(month.avgPerBooking) : '—' }}</td>
                  <td>
                    <span 
                      v-if="month.growth && month.growth !== 0" 
                      class="pill"
                      :class="month.growth > 0 ? 'confirmed' : 'pending'"
                    >
                      {{ month.growth > 0 ? '+' : '' }}{{ month.growth.toFixed(1) }}%
                    </span>
                    <span v-else>—</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tr-total">
                  <td>TOTAL {{ selectedYear }}</td>
                  <td style="text-align:center;">{{ revenueService.yearlyBookings || 0 }}</td>
                  <td class="tdm">{{ revenueService.formatAmount(revenueService.yearlyRevenue) }}</td>
                  <td>{{ revenueService.formatAmount(revenueService.yearlyAvgPerBooking) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <!-- Empty State -->
            <div
              v-if="viewMode === 'monthly' && (!revenueService.paymentsByMonth || revenueService.paymentsByMonth.length === 0)"
              class="empty-state"
            >
              <svg viewBox="0 0 24 24" width="48" height="48">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>No Payments Found</h3>
              <p>No payment records for {{ months[selectedMonth] }} {{ selectedYear }}</p>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<!-- src/views/RevenueView.vue -->
<script setup>
import { ref, onMounted, watch } from 'vue'
import revenueService from '@/services/revenueService'  // ✅ Default import - no curly braces
import bookingsService from '@/services/bookingService'
import paymentsService from '@/services/paymentsService'
import StatCard from '@/components/StatCard.vue'

// Use the services directly - they're already instances
// No need to call userevenueService() etc.

// Local state
const selectedYear = ref(revenueService.selectedYear)
const selectedMonth = ref(revenueService.selectedMonth)
const viewMode = ref(revenueService.viewMode)
const searchQuery = ref(revenueService.searchQuery)

// Months array
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Load data on mount
const loadData = async () => {
  // Make sure bookings and payments are loaded first
  await bookingsService.fetchBookings()
  await paymentsService.fetchPayments()
  
  // Then load revenue data if needed
  // If revenueService has a fetch method, call it
  if (revenueService.fetchRevenueData) {
    await revenueService.fetchRevenueData()
  }
}

// Handle year change
const handleYearChange = () => {
  revenueService.setSelectedYear(selectedYear.value)
}

// Handle month change
const handleMonthChange = () => {
  revenueService.setSelectedMonth(selectedMonth.value)
}

// Switch view mode
const switchViewMode = (mode) => {
  viewMode.value = mode
  revenueService.setViewMode(mode)
}

// Handle search
const handleSearch = () => {
  revenueService.setSearchQuery(searchQuery.value)
}

// Watch for store changes
watch(() => revenueService.selectedYear, (newYear) => {
  selectedYear.value = newYear
})

watch(() => revenueService.selectedMonth, (newMonth) => {
  selectedMonth.value = newMonth
})

watch(() => revenueService.viewMode, (newMode) => {
  viewMode.value = newMode
})

// Initialize
onMounted(async () => {
  await loadData()
})
</script>
