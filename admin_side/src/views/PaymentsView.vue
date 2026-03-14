<!-- src/views/PaymentsView.vue -->
<template>
  <div class="payments-view">
    <section class="section fu">
      <!-- Summary Stat Cards -->
      <div class="stats-grid c3 fu1">
        <!-- Total Revenue -->
        <StatCard
          :value="`₱${formatNumber(paymentsService.totalRevenue)}`"
          label="Total Revenue"
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
          :value="paymentsService.paidCount"
          label="Paid Transactions"
          color-class="cb"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </template>
        </StatCard>

        <!-- Pending Transactions -->
        <StatCard
          :value="`₱${formatNumber(paymentsService.todaysRevenue)}`"
          label="Today's Revenue"
          color-class="ca"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </template>
        </StatCard>
      </div>

      <div class="card fu2">
      <div class="card-head">
      <div>
            <div class="card-title">All Payments</div>
            <div class="card-sub">View and manage payment transactions</div>
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
            placeholder="Search by guest, booking ID, or reference #..."
            @input="handleSearch"
          />
        </div>
        
        <!-- Status Filter -->
        <!-- <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select> -->

        <button class="create-btn" @click="openCreatePaymentModal">
  <svg viewBox="0 0 24 24" width="18" height="18">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
  Create Payment
</button>
      </div>
      </div>

      <!-- Payments Table -->
      <div class="card fu3">
        <div class="twrap">
          <table v-if="!paymentsService.isLoading && filteredPayments.length > 0">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Guest Name</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>Date</th>
                <th>Status</th>
                <!-- <th style="text-align: center;">View</th> -->
                <th style="text-align: center;">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="payment in paginatedPayments" 
                :key="payment.paymentId"
                class="payment-row"
                @click="openPaymentModal(payment)"
              >
                <td class="tdm">#{{ payment.paymentId }}</td>
                <td class="tdn">{{ payment.guest }}</td>
                <td class="tdm amount">₱{{ formatNumber(payment.amt) }}</td>
                <td class="tdm">{{ payment.paymentType || 'N/A' }}</td>
                <td>{{ payment.date }}</td>
                <td @click.stop>
                  <span 
                    class="status-badge" 
                    :class="getStatusClass(payment.status)"
                  >
                    {{ payment.status }}
                  </span>
                </td>
                <!-- <td style="text-align: center;" @click.stop>
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
                </td> -->
                <td style="text-align: center;" @click.stop>
                  <button 
                    class="delete-btn" 
                    @click="deletePayment(payment)"
                    title="Delete Payment"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Loading State -->
          <div v-if="paymentsService.isLoading" class="empty-state">
            <div class="loading-spinner"></div>
            <p style="margin-top: 16px;">Loading payments...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!paymentsService.isLoading && filteredPayments.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" fill="none"/>
              <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3>No Payments Found</h3>
            <p>{{ searchQuery ? 'Try a different search term.' : 'No payments have been recorded yet.' }}</p>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1 && !filteredPayments.isLoading">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
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

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      :title="`Delete Payment #${paymentToDelete?.paymentId}?`"
      :message="`Are you sure you want to delete this payment from ${paymentToDelete?.guest}?\n\nThis will move the payment to the trash.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="warning"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="showConfirmModal = false"
    />

    <CreatePaymentModal
  :show="showCreatePaymentModal"
  @close="closeCreatePaymentModal"
  @success="handleNewPayment"
/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import paymentsService from '@/services/paymentsService'
import StatCard from '@/components/StatCard.vue'
import PaymentModal from '@/modals/PaymentModal.vue'
import ConfirmationModal from '@/modals/confirmationModal.vue'
import CreatePaymentModal from '@/modals/createPaymentModal.vue'


// Stte
const searchQuery = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const selectedPayment = ref(null)

const currentPage = ref(1)
const itemsPerPage = 10

// Confirmation modal state
const showConfirmModal = ref(false)
const paymentToDelete = ref(null)
const showCreatePaymentModal = ref(false)


const openCreatePaymentModal = () => {
  showCreatePaymentModal.value = true
}

/**
 * Close the create payment modal
 */
const closeCreatePaymentModal = () => {
  showCreatePaymentModal.value = false
}

/**
 * Handle successful payment creation
 * @param {Object} newPayment - The newly created payment data
 */
const handleNewPayment = async (newPayment) => {
  console.log('✅ New payment created:', newPayment)
  
  // Show success message
  alert(`Payment of ₱${newPayment.amount.toLocaleString()} created successfully for ${newPayment.guestName}!`)
  
  // Refresh the payments list to show the new payment
  try {
    await paymentsService.fetchPayments()
    console.log('📋 Payments list refreshed')
  } catch (error) {
    console.error('❌ Error refreshing payments:', error)
  }
  
  // Close the modal
  closeCreatePaymentModal()
}

// Filtered payments based on search and status
const filteredPayments = computed(() => {
  if (!paymentsService.payments || paymentsService.payments.length === 0) {
    return []
  }
  
  let filtered = paymentsService.payments

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(payment => {
      return (
        payment.guest?.toLowerCase().includes(query) ||
        payment.paymentId?.toLowerCase().includes(query) ||
        payment.bookingId?.toLowerCase().includes(query) ||
        payment.referenceNumber?.toLowerCase().includes(query)
      )
    })
  }
  
  return filtered
})

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Paid': 'status-paid',
    'Pending': 'status-pending',
    'Failed': 'status-failed'
  }
  return classes[status] || 'status-pending'
}

// Format number with commas
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return num.toLocaleString('en-PH')
}

// Paginated feedbacks
const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPayments.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredPayments.value.length / itemsPerPage)
)

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

// Delete payment - show confirmation modal
const deletePayment = (payment) => {
  paymentToDelete.value = payment
  showConfirmModal.value = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!paymentToDelete.value) return
  
  const payment = paymentToDelete.value
  console.log(`Archiving payment #${payment.paymentId}`)
  
  const result = await paymentsService.deletePayment(payment.paymentId)
  
  if (result.success) {
    console.log(`✅ Payment #${payment.paymentId} archived successfully`)
  } else {
    console.error('❌ Failed to archive payment:', result.error)
  }
  
  // Clear
  paymentToDelete.value = null
}

// Cancel delete
const cancelDelete = () => {
  paymentToDelete.value = null
}

// Handle status update from modal
const handleStatusUpdate = async ({ paymentId, newStatus }) => {
  try {
    const result = await paymentsService.updatePaymentStatus(paymentId, newStatus)
    
    if (result.success) {
      console.log(`✅ Payment ${paymentId} status updated to ${newStatus}`)
      
      const payment = paymentsService.payments.find(p => p.paymentId === paymentId)
      if (payment) {
        payment.status = newStatus
        
        if (selectedPayment.value && selectedPayment.value.paymentId === paymentId) {
          selectedPayment.value.status = newStatus
        }
      }
    } else {
      console.error('Failed to update status:', result.error)
      alert(`Failed to update status: ${result.error}`)
    }
  } catch (error) {
    console.error('Error updating status:', error)
    alert('An error occurred while updating status')
  }
}

// Handle save notes from modal
const handleSaveNotes = async ({ paymentId, notes }) => {
  try {
    const payment = paymentsService.payments.find(p => p.paymentId === paymentId)
    if (!payment) return
    
    const result = await paymentsService.updatePayment(paymentId, { notes })
    
    if (result.success) {
      payment.notes = notes
      
      if (selectedPayment.value && selectedPayment.value.paymentId === paymentId) {
        selectedPayment.value.notes = notes
      }
      
      console.log(`✅ Notes saved for payment ${paymentId}`)
    } else {
      console.error('Failed to save notes:', result.error)
      alert(`Failed to save notes: ${result.error}`)
    }
  } catch (error) {
    console.error('Error saving notes:', error)
    alert('An error occurred while saving notes')
  }
}

// Handle search input
const handleSearch = () => {
  paymentsService.setSearchQuery(searchQuery.value)
}

// Reset pagination when filters change
watch([searchQuery, statusFilter], () => {
  // Could add pagination reset here if needed
})

// Fetch payments on mount
onMounted(async () => {
  console.log('PaymentsView mounted, fetching payments...')
  try {
    const result = await paymentsService.fetchPayments()
    if (result.success) {
      console.log('Payments fetched:', paymentsService.payments.length)
    } else {
      console.error('Failed to fetch payments:', result.error)
    }
  } catch (error) {
    console.error('Error fetching payments:', error)
  }
})
</script>

<style scoped>


/* Delete Button */
.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all var(--tr);
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.delete-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.payments-view {
  width: 100%;
  min-height: 100%;
  padding: 20px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.fsearch svg {
  width: 20px;
  height: 20px;
  stroke: #666;
  fill: none;
}

.fsearch input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 150px;
  cursor: pointer;
}

/* Table Styles */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.twrap {
  overflow-x: auto;
}

td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  color: #212529;
}

.payment-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.payment-row:hover {
  background-color: #f8f9fa;
}

.tdm {
  font-family: monospace;
  font-weight: 500;
}

.tdn {
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
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

.status-failed {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* View Button */
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

/* Loading State */
.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state svg {
  stroke: #999;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 8px 0;
  color: #333;
}

.empty-state p {
  font-size: 14px;
}
</style>