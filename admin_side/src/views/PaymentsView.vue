<!-- src/views/PaymentsView.vue -->
<!-- src/views/PaymentsView.vue -->
<template>
  <div class="payments-view">
    <section class="section fu">
      <!-- Summary Stat Cards -->
      <div class="stats-grid c3 fu1">
        <!-- Total Revenue -->
        <StatCard
          :value="`₱${paymentsService.totalRevenue.toLocaleString()}`"  <!-- ✅ Change to paymentsService -->
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
          :value="paymentsService.paidCount"  <!-- ✅ Change to paymentsService -->
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
          :value="`₱${paymentsService.totalDownpayments.toLocaleString()}`"  <!-- ✅ Change to paymentsService -->
          :label="`Downpayments (₱500 × ${paymentsService.payments.length})`"  <!-- ✅ Change to paymentsService -->
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
          <table v-if="!paymentsService.isLoading && filteredPayments.length > 0">  <!-- ✅ Change to paymentsService -->
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="payment in filteredPayments" 
                :key="payment.id"
                class="payment-row"
                @click="openPaymentModal(payment)"
              >
                <td class="tdm">{{ payment.id }}</td>
                <td class="tdn">{{ payment.guest }}</td>
                <td>{{ payment.room }}</td>
                <td class="tdm amount">₱{{ payment.amt.toLocaleString() }}</td>
                <td>
                  <span class="tag tag-g">{{ payment.method }}</span>
                </td>
                <td>{{ payment.date }}</td>
                <td @click.stop>
                  <span 
                    class="status-badge" 
                    :class="getStatusClass(payment.status)"
                  >
                    {{ payment.status }}
                  </span>
                </td>
                <td style="text-align: center;" @click.stop>
                  <button 
                    class="view-btn" 
                    @click="openPaymentModal(payment)"
                    title="View Details"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Loading State -->
          <div v-if="paymentsService.isLoading" class="empty-state">  <!-- ✅ Change to paymentsService -->
            <div class="loading-spinner"></div>
            <p style="margin-top: 16px;">Loading payments...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!paymentsService.isLoading && filteredPayments.length === 0" class="empty-state">  <!-- ✅ Change to paymentsService -->
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

    <!-- Payment Modal -->
    <PaymentModal
      :show="showModal"
      :payment="selectedPayment"
      @close="closeModal"
      @update-status="handleStatusUpdate"
      @save-notes="handleSaveNotes"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import paymentsService from '@/services/paymentsService'  // ✅ Default import
import StatCard from '@/components/StatCard.vue'
import PaymentModal from '@/modals/PaymentModal.vue'

const searchQuery = ref('')
const showModal = ref(false)
const selectedPayment = ref(null)

// Filtered payments based on search
const filteredPayments = computed(() => {
  if (!paymentsService.payments || paymentsService.payments.length === 0) {
    return []
  }
  
  if (!searchQuery.value) return paymentsService.payments

  const query = searchQuery.value.toLowerCase()
  return paymentsService.payments.filter(payment => {
    return (
      payment.guest.toLowerCase().includes(query) ||
      payment.id.toLowerCase().includes(query)
    )
  })
})

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Paid': 'status-paid',
    'Pending': 'status-pending',
    'Failed': 'status-failed',
    'Partial': 'status-partial'
  }
  return classes[status] || 'status-pending'
}

// Open payment modal
const openPaymentModal = (payment) => {
  selectedPayment.value = { ...payment }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
  selectedPayment.value = null
}

// Handle status update from modal
const handleStatusUpdate = async ({ paymentId, newStatus }) => {
  const payment = paymentsService.payments.find(p => p.id === paymentId)
  if (payment) {
    payment.status = newStatus
    
    if (selectedPayment.value && selectedPayment.value.id === paymentId) {
      selectedPayment.value.status = newStatus
    }
    
    console.log(`✅ Payment ${paymentId} status updated to ${newStatus}`)
  }
}

// Handle save notes from modal
const handleSaveNotes = ({ paymentId, notes }) => {
  const payment = paymentsService.payments.find(p => p.id === paymentId)
  if (payment) {
    payment.notes = notes
    
    if (selectedPayment.value && selectedPayment.value.id === paymentId) {
      selectedPayment.value.notes = notes
    }
    
    console.log(`✅ Notes saved for payment ${paymentId}`)
  }
}

const handleSearch = () => {
  paymentsService.setSearchQuery(searchQuery.value)
}

// Fetch payments on mount
onMounted(async () => {
  console.log('PaymentsView mounted, fetching payments...')
  try {
    await paymentsService.fetchPayments()
    console.log('Payments fetched:', paymentsService.payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
  }
})
</script>

<style scoped>
.payments-view {
  width: 100%;
  min-height: 100%;
}

.payment-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-row:hover {
  background-color: #f5f5f5;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 70px;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}



.view-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #357abd;
  transform: translateY(-1px);
}

.view-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}
</style>