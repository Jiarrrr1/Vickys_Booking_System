<!-- FeedbackModal.vue - Payment Success Version -->
<template>
  <Transition name="modal-fade">
    <div v-if="show" class="feedback-modal-overlay" @click="handleOverlayClick">
      <div class="feedback-modal" @click.stop>
        <div class="feedback-modal-content">
          <div class="feedback-icon" :class="type">
            <svg v-if="type === 'success'" viewBox="0 0 24 24" width="48" height="48">
              <circle cx="12" cy="12" r="10" fill="#10b981" stroke="none"/>
              <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            <svg v-else-if="type === 'error'" viewBox="0 0 24 24" width="48" height="48">
              <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="none"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="white" stroke-width="2"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="white" stroke-width="2"/>
            </svg>
            <svg v-else-if="type === 'loading'" class="spinner" viewBox="0 0 24 24" width="48" height="48">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#667eea" stroke-width="2" stroke-dasharray="31.4 31.4">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
          
          <h3 class="feedback-title">{{ title }}</h3>
          <p class="feedback-message">{{ message }}</p>
          
          <!-- Payment Details Section -->
          <div v-if="type !== 'loading' && details" class="feedback-details">
            <!-- Payment ID - Highlighted -->
            <div class="detail-row highlight-row" v-if="details['Payment ID'] || details['paymentId']">
              <span class="detail-label">Payment ID:</span>
              <span class="detail-value highlight">#{{ details['Payment ID'] || details['paymentId'] }}</span>
            </div>
            
            <!-- Reservation ID -->
            <div class="detail-row" v-if="details['Reservation ID'] || details['bookingId']">
              <span class="detail-label">Reservation ID:</span>
              <span class="detail-value">#{{ details['Reservation ID'] || details['bookingId'] }}</span>
            </div>
            
            <!-- Guest Information -->
            <div class="detail-row" v-if="details['Guest Name'] || details['guest']">
              <span class="detail-label">Guest:</span>
              <span class="detail-value">{{ details['Guest Name'] || details['guest'] }}</span>
            </div>
            
            <!-- Room Information -->
            <div class="detail-row" v-if="details['Room'] || details['room']">
              <span class="detail-label">Room:</span>
              <span class="detail-value">{{ details['Room'] || details['room'] }}</span>
            </div>
            
            <!-- Payment Amount - Highlighted -->
            <div class="detail-row amount-row" v-if="details['Amount'] || details['amount'] || details['amt']">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value amount">
                ₱{{ formatAmount(details['Amount'] || details['amount'] || details['amt']) }}
              </span>
            </div>
            
            <!-- Payment Method -->
            <div class="detail-row" v-if="details['Payment Method'] || details['method']">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">
                <span class="method-badge" :class="getMethodClass(details['Payment Method'] || details['method'])">
                  {{ details['Payment Method'] || details['method'] }}
                </span>
              </span>
            </div>
            
            <!-- Reference Number (for GCash) -->
            <div class="detail-row" v-if="details['Reference Number'] || details['referenceNumber']">
              <span class="detail-label">Reference No.:</span>
              <span class="detail-value ref-number">{{ details['Reference Number'] || details['referenceNumber'] }}</span>
            </div>
            
            <!-- Payment Type -->
            <div class="detail-row" v-if="details['Payment Type'] || details['paymentType']">
              <span class="detail-label">Payment Type:</span>
              <span class="detail-value">{{ details['Payment Type'] || details['paymentType'] }}</span>
            </div>
            
            <!-- Payment Status -->
            <div class="detail-row" v-if="details['Status'] || details['status']">
              <span class="detail-label">Status:</span>
              <span class="detail-value">
                <span class="status-badge" :class="getStatusClass(details['Status'] || details['status'])">
                  {{ details['Status'] || details['status'] }}
                </span>
              </span>
            </div>
            
            <!-- Payment Date -->
            <div class="detail-row" v-if="details['Date'] || details['date']">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">{{ details['Date'] || details['date'] }}</span>
            </div>
            
            <!-- Notes (if any) -->
            <div class="detail-row notes-row" v-if="details['Notes'] || details['notes']">
              <span class="detail-label">Notes:</span>
              <span class="detail-value notes">{{ details['Notes'] || details['notes'] }}</span>
            </div>
          </div>
          
          <!-- Empty state message -->
          <div v-else-if="type !== 'loading'" class="no-details">
            <p>No additional details available</p>
          </div>
          
          <div class="feedback-actions">
            <button 
              v-if="type !== 'loading'" 
              class="feedback-btn" 
              :class="type"
              @click="handleClose"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'success' // 'success', 'error', 'loading'
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  details: {
    type: Object,
    default: null
  },
  buttonText: {
    type: String,
    default: 'Done'
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleOverlayClick = () => {
  if (props.type !== 'loading') {
    emit('close')
  }
}

const handleClose = () => {
  emit('confirm')
  emit('close')
}

// Helper function to format amount
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  const num = parseFloat(amount)
  return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Helper function to get status class
const getStatusClass = (status) => {
  const statusMap = {
    'Paid': 'status-paid',
    'Pending': 'status-pending',
    'Failed': 'status-failed',
    'Refunded': 'status-refunded'
  }
  return statusMap[status] || 'status-paid'
}

// Helper function to get method class
const getMethodClass = (method) => {
  const methodMap = {
    'GCash': 'method-gcash',
    'Cash': 'method-cash',
    'Credit Card': 'method-credit',
    'Bank Transfer': 'method-bank'
  }
  return methodMap[method] || 'method-other'
}
</script>

<style scoped>
.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.feedback-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.feedback-modal-content {
  padding: 32px 24px;
  text-align: center;
}

.feedback-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.feedback-icon.success svg circle {
  fill: #10b981;
}

.feedback-icon.error svg circle {
  fill: #ef4444;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.feedback-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.feedback-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.feedback-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.highlight-row {
  background: #f0f9ff;
  margin: -4px -4px 0 -4px;
  padding: 12px 8px;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #3b82f6;
}

.amount-row {
  background: #f0fdf4;
  padding: 12px 8px;
  border-radius: 8px;
  margin-top: 8px;
}

.notes-row {
  background: #fef9c3;
  padding: 12px 8px;
  border-radius: 8px;
  margin-top: 8px;
}

.detail-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.detail-value.highlight {
  color: #3b82f6;
  font-size: 16px;
}

.detail-value.amount {
  color: #059669;
  font-size: 18px;
  font-weight: 700;
}

.detail-value.ref-number {
  font-family: monospace;
  font-size: 13px;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.detail-value.notes {
  font-style: italic;
  color: #854d0e;
  font-weight: 400;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-failed {
  background: #fee2e2;
  color: #991b1b;
}

.status-refunded {
  background: #e0e7ff;
  color: #3730a3;
}

/* Method badges */
.method-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.method-gcash {
  background: #0057e0;
  color: white;
}

.method-cash {
  background: #059669;
  color: white;
}

.method-credit {
  background: #7c3aed;
  color: white;
}

.method-bank {
  background: #b45309;
  color: white;
}

.method-other {
  background: #6b7280;
  color: white;
}

.no-details {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #94a3b8;
  font-style: italic;
}

.feedback-actions {
  display: flex;
  justify-content: center;
}

.feedback-btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 140px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feedback-btn.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.feedback-btn.success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.feedback-btn.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.feedback-btn.error:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.feedback-btn:active {
  transform: translateY(0);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>