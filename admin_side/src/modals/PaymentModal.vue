<!-- src/modals/PaymentModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Payment Details</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Modal Content -->
      <div v-if="payment" class="modal-content">
        <!-- Status Badge -->
        <div class="status-section">
          <span class="status-badge" :class="getStatusClass(payment.status)">
            {{ payment.status }}
          </span>
        </div>

        <!-- Payment Info Grid -->
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Booking ID</span>
            <span class="info-value">{{ payment.bookingId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Guest Name</span>
            <span class="info-value">{{ payment.guest }}</span>
          </div>
          <div class="info-item" style="border-bottom: 3px solid #ccc; padding-bottom: 1rem;">
            <span class="info-label">Room</span>
            <span class="info-value">{{ payment.room }}</span>
            
          </div>
          
          <div class="info-item" style="border-bottom: 3px solid #ccc; padding-bottom: 1rem;">
            <span class="info-label">Payment Date</span>
            <span class="info-value">{{ payment.date }}</span>
          </div>

          <div class="info-item" >
            <span class="info-label">Payment Type</span>
            <span class="info-value">{{ payment.paymentType}}</span>
          </div>
          
          <div class="info-item ">
            <span class="info-label amount-item">Amount:</span>
            <span class="info-value amount">₱{{ payment.amt.toLocaleString() }}</span>

          </div>
          
        </div>

        <!-- Payment Status Update Section -->
        <!-- <div class="status-update-section">
          <h3>Update Payment Status</h3>
          <div class="status-controls">
            <select 
              v-model="selectedStatus" 
              class="status-select"
              :class="getStatusClass(selectedStatus)"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            
            <button 
              class="update-btn" 
              @click="updateStatus"
              :disabled="selectedStatus === payment.status"
            >
              Update Status
            </button>
          </div>
        </div> -->

        <!-- Transaction Details -->
        <div class="transaction-details">
          <h3>Transaction Details</h3>
          <div class="details-grid">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">TXN-{{ String(payment.paymentId).replace('#', '') }}-2026</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Reference Number:</span>
              <span class="detail-value">{{ String(payment.referenceNumber) || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Channel:</span>
              <span class="detail-value">{{ payment.method }} - Online</span>
            </div>
          </div>
        </div>

        <!-- Additional Notes -->
        <!-- <div class="notes-section">
          <h3>Notes</h3>
          <textarea 
            v-model="notes" 
            placeholder="Add notes about this payment..."
            rows="3"
          ></textarea>
          <button class="save-notes-btn" @click="saveNotes">Save Notes</button>
        </div> -->
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">Close</button>
        <!-- <button class="btn-primary" @click="closeModal">Save Changes</button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  payment: Object
})

const emit = defineEmits(['close', 'update-status', 'save-notes'])

const selectedStatus = ref('')
const notes = ref('')

// Watch for payment changes to update local state
watch(() => props.payment, (newPayment) => {
  if (newPayment) {
    selectedStatus.value = newPayment.status || 'Paid'
    notes.value = newPayment.notes || ''
  }
}, { immediate: true })

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Paid': 'status-paid',
    'Pending': 'status-pending',
    'Failed': 'status-failed',
    'Refunded': 'status-refunded',
    'Partial': 'status-partial'
  }
  return classes[status] || 'status-pending'
}

// Close modal
const closeModal = () => {
  emit('close')
}

// Update status
const updateStatus = () => {
  if (selectedStatus.value !== props.payment.status) {
    emit('update-status', {
      paymentId: props.payment.paymentId,
      newStatus: selectedStatus.value
    })
  }
}

// Save notes
const saveNotes = () => {
  emit('save-notes', {
    paymentId: props.payment.id,
    notes: notes.value
  })
}

// Save all changes
const saveChanges = () => {
  updateStatus()
  saveNotes()
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0 8px;
}

.close-btn:hover {
  color: #333;
}

.modal-content {
  padding: 24px;
}

.status-section {
  margin-bottom: 24px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
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

.status-refunded {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.status-partial {
  background-color: #cce5ff;
  color: #004085;
  border: 1px solid #b8daff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  column-gap: 0;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
}



.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.amount-item  {
  font-size: 15px;
  color: #333;
  font-weight:1000;
}

.info-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.info-value.amount {
  color: #28a745;
  font-size: 18px;
  font-weight: 600;
}

.info-value.balance {
  color: #d71d30;
  font-size: 18px;
  font-weight: 700;
}

.status-update-section,
.transaction-details,
.notes-section {
  margin-bottom: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.status-update-section h3,
.transaction-details h3,
.notes-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
}

.status-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-select {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.status-select:focus {
  border-color: #4a90e2;
}

.update-btn,
.save-notes-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.update-btn {
  background-color: #4a90e2;
  color: white;
}

.update-btn:hover:not(:disabled) {
  background-color: #357abd;
}

.update-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.save-notes-btn {
  background-color: #28a745;
  color: white;
  margin-top: 8px;
}

.save-notes-btn:hover {
  background-color: #218838;
}

.details-grid {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #666;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.notes-section textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
}

.notes-section textarea:focus {
  border-color: #4a90e2;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: white;
  border-radius: 0 0 12px 12px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background-color: #357abd;
}
</style>