<template>
  <section class="section fu">
    <!-- Section Header -->
    <div class="shead">
      <div class="stitle">Payment Monitoring</div>
      <div class="sdesc">Track all transactions and payment records</div>
    </div>

    <!-- Summary Stat Cards -->
    <div class="stats-grid c3 fu1">
      <!-- Total Revenue -->
      <StatCard
        :value="`₱${paymentsStore.totalRevenue.toLocaleString()}`"
        label="Total Revenue (GCash)"
        color-class="cg"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </template>
      </StatCard>

      <!-- Paid Transactions -->
      <StatCard
        :value="paymentsStore.paidCount"
        label="Paid Transactions"
        color-class="cb"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </template>
      </StatCard>

      <!-- Total Downpayments -->
      <StatCard
        :value="`₱${paymentsStore.totalDownpayments.toLocaleString()}`"
        :label="`Downpayments (₱500 × ${paymentsStore.payments.length})`"
        color-class="ca"
      >
        <template #icon>
          <svg viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Filter Bar -->
    <div class="fbar fu2">
      <div class="fsearch">
        <svg viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search guest or booking ID…"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Payments Table -->
    <div class="card fu3">
      <div class="twrap">
        <table v-if="!paymentsStore.isLoading && filteredPayments.length > 0">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td class="tdm">{{ payment.id }}</td>
              <td class="tdn">{{ payment.guest }}</td>
              <td>{{ payment.room }}</td>
              <td class="tdm">₱{{ payment.amt.toLocaleString() }}</td>
              <td>
                <span class="tag tag-g">{{ payment.method }}</span>
              </td>
              <td>{{ payment.date }}</td>
              <td>
                <span class="pill paid">{{ payment.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading State -->
        <div v-if="paymentsStore.isLoading" class="empty-state">
          <div class="loading-spinner"></div>
          <p style="margin-top: 16px;">Loading payments...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!paymentsStore.isLoading && filteredPayments.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No Payments Found</h3>
          <p>Try a different search term.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import StatCard from '@/components/StatCard.vue'

const paymentsStore = usePaymentsStore()

const searchQuery = ref('')

// Filtered payments based on search
const filteredPayments = computed(() => {
  if (!searchQuery.value) return paymentsStore.payments

  const query = searchQuery.value.toLowerCase()
  return paymentsStore.payments.filter(payment => {
    return (
      payment.guest.toLowerCase().includes(query) ||
      payment.id.toLowerCase().includes(query)
    )
  })
})

const handleSearch = () => {
  paymentsStore.setSearchQuery(searchQuery.value)
}

// Fetch payments on mount
onMounted(async () => {
  await paymentsStore.fetchPayments()
})
</script>

<style scoped>
/* Payments specific styles */
</style>