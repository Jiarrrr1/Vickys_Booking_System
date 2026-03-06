<!-- src/views/RevenueView.vue - FIXED for monthly/yearly filtering -->
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
            <select class="rev-sel" id="rev-year" v-model.number="selectedYear">
              <option :value="2026">2026</option>
              <option :value="2025">2025</option>
              <option :value="2024">2024</option>
              <option :value="2023">2023</option>
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
              v-model.number="selectedMonth"
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
                @click="viewMode = 'monthly'"
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
                @click="viewMode = 'yearly'"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Yearly
              </button>
            </div>
          </div>

          <!-- Search box (only visible in monthly view) -->
          <div class="rev-table-search" v-if="viewMode === 'monthly'">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search guest or booking ID..." 
              v-model="searchQuery"
            >
          </div>
        </div>
      </div>


      <!-- Loading State -->
      <div v-if="paymentsService.isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading revenue data...</p>
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
              :value="formatAmount(paymentsService.totalRevenue)"
              label="Total Revenue" 
              color-class="ca"
              badge="+12.5%"
            >
              <template #icon>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </template>
            </StatCard>

            <StatCard 
              :value="totalBookingsCount.toString()"
              label="Total Bookings" 
              color-class="ca"
              badge="+8.3%"
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
              :value="formatAmount(viewMode === 'monthly' ? monthlyRevenue : yearlyRevenue)"
              :label="viewMode === 'monthly' ? `${months[selectedMonth]} Revenue` : `${selectedYear} Revenue`" 
              color-class="cb"
              badge="+15.2%"
            >
              <template #icon>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </template>
            </StatCard>

            <StatCard 
              :value="(viewMode === 'monthly' ? monthlyBookings : yearlyBookings).toString()"
              :label="viewMode === 'monthly' ? `${months[selectedMonth]} Bookings` : `${selectedYear} Bookings`" 
              color-class="cb"
              badge="+10.1%"
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
            <table v-if="viewMode === 'monthly' && filteredPaymentsByMonth.length > 0">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Guest Name</th>
                  <th>Room</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in filteredPaymentsByMonth" :key="payment.paymentId">
                  <td class="tdm">#{{ payment.paymentId }}</td>
                  <td class="tdn">{{ payment.guest || '—' }}</td>
                  <td>{{ payment.room || '—' }}</td>
                  <td class="tdm">{{ formatAmount(payment.amt) }}</td>
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
                  <td colspan="3" style="text-align:right;padding-right:15px;">
                    <strong>Total Revenue This Month</strong>
                  </td>
                  <td class="tdm"><strong>{{ formatAmount(monthlyRevenue) }}</strong></td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>

            <!-- Yearly View Table -->
            <table v-else-if="viewMode === 'yearly'">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Avg per Booking</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="month in yearlyBreakdown" 
                  :key="month.monthIndex"
                  :class="{ 'row-no-data': month.bookings === 0 }"
                >
                  <td class="tdn">{{ month.month }}</td>
                  <td style="text-align:center;">{{ month.bookings || '—' }}</td>
                  <td class="tdm">{{ month.revenue ? formatAmount(month.revenue) : '—' }}</td>
                  <td>{{ month.avgPerBooking ? formatAmount(month.avgPerBooking) : '—' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="tr-total">
                  <td><strong>TOTAL {{ selectedYear }}</strong></td>
                  <td style="text-align:center;"><strong>{{ yearlyBookings || 0 }}</strong></td>
                  <td class="tdm"><strong>{{ formatAmount(yearlyRevenue) }}</strong></td>
                  <td><strong>{{ formatAmount(yearlyAvgPerBooking) }}</strong></td>
                </tr>
              </tfoot>
            </table>

            <!-- Empty State -->
            <div
              v-if="viewMode === 'monthly' && filteredPaymentsByMonth.length === 0"
              class="empty-state"
            >
              <svg viewBox="0 0 24 24" width="48" height="48">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>No Payments Found</h3>
              <p v-if="searchQuery">No payments match "{{ searchQuery }}"</p>
              <p v-else>No payment records for {{ months[selectedMonth] }} {{ selectedYear }}</p>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import bookingsService from '@/services/bookingService'
import paymentsService from '@/services/paymentsService'
import StatCard from '@/components/StatCard.vue'

// Local state
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth()) // 0 = January, 1 = February, etc.
const viewMode = ref('monthly')
const searchQuery = ref('')

// Months array
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Helper function to parse date safely
const parsePaymentDate = (payment) => {
  // Try different date fields
  const dateStr = payment.date || payment.paymentDate || payment.createdAt
  if (!dateStr) return null
  
  // Handle different date formats
  let date = new Date(dateStr)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Try parsing custom format like "March 4 2026"
    const parts = dateStr.split(' ')
    if (parts.length === 3) {
      const monthIndex = months.indexOf(parts[0])
      if (monthIndex !== -1) {
        date = new Date(parseInt(parts[2]), monthIndex, parseInt(parts[1]))
      }
    }
  }
  
  return isNaN(date.getTime()) ? null : date
}

// ==========================================
// COMPUTED: Payments by date
// ==========================================

const paymentsByMonth = computed(() => {
  if (!paymentsService.payments?.length) {
    return []
  }
  
  console.log(`Filtering payments for ${months[selectedMonth.value]} ${selectedYear.value}...`)
  
  const filtered = paymentsService.payments.filter(payment => {
    const paymentDate = parsePaymentDate(payment)
    if (!paymentDate) return false
    
    // Don't filter by status to see all payments
    const matches = paymentDate.getFullYear() === selectedYear.value && 
                    paymentDate.getMonth() === selectedMonth.value
    
    if (matches) {
      console.log('✅ Matched payment:', {
        id: payment.paymentId,
        date: payment.date,
        parsedDate: paymentDate.toISOString(),
        amount: payment.amt,
        status: payment.status
      })
    }
    
    return matches
  })
  
  console.log(`Found ${filtered.length} payments for ${months[selectedMonth.value]} ${selectedYear.value}`)
  return filtered
})

const filteredPaymentsByMonth = computed(() => {
  if (!searchQuery.value) return paymentsByMonth.value
  
  const query = searchQuery.value.toLowerCase()
  return paymentsByMonth.value.filter(payment => 
    payment.guest?.toLowerCase().includes(query) ||
    payment.paymentId?.toLowerCase().includes(query) ||
    payment.bookingId?.toLowerCase().includes(query)
  )
})

const paymentsByYear = computed(() => {
  if (!paymentsService.payments?.length) return []
  
  return paymentsService.payments.filter(payment => {
    const paymentDate = parsePaymentDate(payment)
    if (!paymentDate) return false
    
    return paymentDate.getFullYear() === selectedYear.value
    // Don't filter by status
  })
})

const bookingsByMonth = computed(() => {
  if (!bookingsService.bookings?.length) return []
  
  return bookingsService.bookings.filter(booking => {
    if (!booking.checkIn) return false
    const checkInDate = new Date(booking.checkIn)
    return !isNaN(checkInDate.getTime()) &&
           checkInDate.getFullYear() === selectedYear.value && 
           checkInDate.getMonth() === selectedMonth.value
  })
})

const bookingsByYear = computed(() => {
  if (!bookingsService.bookings?.length) return []
  
  return bookingsService.bookings.filter(booking => {
    if (!booking.checkIn) return false
    const checkInDate = new Date(booking.checkIn)
    return !isNaN(checkInDate.getTime()) &&
           checkInDate.getFullYear() === selectedYear.value
  })
})

// ==========================================
// COMPUTED: Revenue calculations
// ==========================================

const monthlyRevenue = computed(() => {
  return paymentsByMonth.value.reduce((sum, p) => sum + (p.amt || 0), 0)
})

const yearlyRevenue = computed(() => {
  return paymentsByYear.value.reduce((sum, p) => sum + (p.amt || 0), 0)
})

const totalBookingsCount = computed(() => bookingsService.bookings?.length || 0)
const monthlyBookings = computed(() => bookingsByMonth.value.length)
const yearlyBookings = computed(() => bookingsByYear.value.length)

const yearlyAvgPerBooking = computed(() => {
  return yearlyBookings.value > 0 ? yearlyRevenue.value / yearlyBookings.value : 0
})

// Yearly breakdown by month
const yearlyBreakdown = computed(() => {
  if (!paymentsService.payments?.length && !bookingsService.bookings?.length) {
    return months.map((monthName, index) => ({
      month: monthName,
      monthIndex: index,
      bookings: 0,
      revenue: 0,
      avgPerBooking: 0
    }))
  }
  
  return months.map((monthName, index) => {
    // Get payments for this month
    const payments = paymentsService.payments?.filter(payment => {
      const paymentDate = parsePaymentDate(payment)
      if (!paymentDate) return false
      return paymentDate.getFullYear() === selectedYear.value && 
             paymentDate.getMonth() === index
      // Don't filter by status
    }) || []
    
    // Get bookings for this month
    const bookings = bookingsService.bookings?.filter(booking => {
      if (!booking.checkIn) return false
      const checkInDate = new Date(booking.checkIn)
      return !isNaN(checkInDate.getTime()) &&
             checkInDate.getFullYear() === selectedYear.value && 
             checkInDate.getMonth() === index
    }) || []
    
    const revenue = payments.reduce((sum, p) => sum + (p.amt || 0), 0)
    const bookingCount = bookings.length
    
    return {
      month: monthName,
      monthIndex: index,
      bookings: bookingCount,
      revenue,
      avgPerBooking: bookingCount > 0 ? revenue / bookingCount : 0
    }
  })
})

// ==========================================
// METHODS
// ==========================================

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '₱0'
  return `₱${Math.round(amount).toLocaleString('en-PH')}`
}

// Load data on mount
const loadData = async () => {
  try {
    console.log('🔄 Loading revenue data...')
    
    // Load both services
    await bookingsService.fetchBookings()
    console.log('✅ Bookings loaded:', bookingsService.bookings?.length || 0)
    
    await paymentsService.fetchPayments()
    console.log('✅ Payments loaded:', paymentsService.payments?.length || 0)
    
    // Log sample payment for debugging
    if (paymentsService.payments?.length > 0) {
      console.log('Sample payment:', paymentsService.payments[0])
    }
    
  } catch (error) {
    console.error('❌ Error loading revenue data:', error)
  }
}

// Watch for changes
watch([selectedYear, selectedMonth, viewMode], () => {
  console.log('Filters changed:', {
    year: selectedYear.value,
    month: selectedMonth.value,
    monthName: months[selectedMonth.value],
    mode: viewMode.value
  })
})

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.revenue-view {
  width: 100%;
  min-height: 100%;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state svg {
  stroke: #999;
  fill: none;
  stroke-width: 2;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 8px 0;
  color: #333;
}

.tag-g {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.badge-paid {
  background-color: #d4edda;
  color: #155724;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tr-total {
  font-weight: bold;
  background-color: #f8f9fa;
}

.row-no-data {
  opacity: 0.5;
}

.tdm {
  font-family: monospace;
  font-weight: 500;
}

.tdn {
  font-weight: 500;
}
</style>