<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Booking Details</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- Modal Content -->
      <div v-if="booking" class="modal-content">
        <!-- Status Badge -->
        <div class="status-section">
          <span class="status-badge" :class="getStatusClass(booking.status)">
            {{ booking.status }}
          </span>
        </div>

        <!-- Booking Info Grid -->
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Booking ID</span>
            <span class="info-value">#{{ booking.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Guest Name</span>
            <span class="info-value">{{ booking.guest }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Room</span>
            <span class="info-value">{{ booking.room }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Number of Guests</span>
            <span class="info-value">{{ booking.guests }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Check-in Date</span>
            <span class="info-value">{{ formatDate(booking.checkIn) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Check-out Date</span>
            <span class="info-value">{{ formatDate(booking.checkOut) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Nights</span>
            <span class="info-value">{{ calculateNights(booking.checkIn, booking.checkOut) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Amount</span>
            <span class="info-value">₱{{ Number(booking.totalAmount).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="contact-section">
          <h3>Contact Information</h3>
          <div class="contact-grid">
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ booking.email || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ booking.phoneNumber || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="payment-section">
          <h3>Payment Information</h3>
          <div class="payment-grid">
            <div class="info-item">
              <span class="info-label">Payment Method</span>
              <span class="info-value">{{ booking.paymentMethod || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Reference Number</span>
              <span class="info-value">{{ booking.referenceNumber || 'N/A' }}</span>
            </div>
            <div class="info-item" v-if="booking.downpayment">
              <span class="info-label">Downpayment</span>
              <span class="info-value">₱{{ booking.downpayment.toLocaleString() }}</span>
            </div>
            <div class="info-item highlight-balance">
              <span class="info-label">Remaining Balance</span>
              <span class="info-value balance-amount">₱{{ booking.remainingBalance?.toLocaleString() || '0' }}</span>
            </div>
          </div>
        </div>

        <!-- Special Request -->
        <div v-if="booking.request" class="request-section">
          <h3>Special Request</h3>
          <div class="request-box">
            {{ booking.request }}
          </div>
        </div>

        <!-- Pay Balance Section - Only show if there's remaining balance -->
        <div v-if="booking.remainingBalance > 0" class="pay-balance-section">
          <h3>Pay Balance</h3>
          
          <!-- Payment Form -->
          <div class="payment-form">
            <div class="form-row">
              <div class="form-group">
                <label for="payAmount">Amount (₱) *</label>
                <input
                  id="payAmount"
                  v-model.number="paymentForm.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  :max="booking.remainingBalance"
                  @input="validatePaymentAmount"
                  :class="{ 'error-input': paymentErrors.amount }"
                />
                <p v-if="paymentErrors.amount" class="error-message">{{ paymentErrors.amount }}</p>
                <p v-else class="help-text">
                  Maximum: ₱{{ formatNumber(booking.remainingBalance) }}
                </p>
              </div>

              <div class="form-group">
                <label for="payMethod">Payment Method *</label>
                <select 
                  id="payMethod" 
                  v-model="paymentForm.method" 
                  required 
                  @change="handlePaymentMethodChange"
                >
                  <option value="GCash">GCash</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <!-- Reference Number - Only show for GCash -->
              <div class="form-group" v-if="paymentForm.method === 'GCash'">
                <label for="payReference">Reference Number <span class="required-star">*</span></label>
                <input
                  id="payReference"
                  v-model="paymentForm.referenceNumber"
                  type="text"
                  required
                  placeholder="Enter GCash reference number"
                  :class="{ 'error-input': paymentErrors.reference }"
                  @input="validateReference"
                />
                <p v-if="paymentErrors.reference" class="error-message">{{ paymentErrors.reference }}</p>
                <p v-else class="help-text">Required for GCash payments</p>
              </div>

              <!-- Payment Type - Fixed to Balance Payment -->
              <div class="form-group">
                <label>Payment Type</label>
                <input
                  type="text"
                  value="Balance Payment"
                  disabled
                  class="readonly-field"
                />
              </div>
            </div>

            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="summary-item">
                <span>Payment Amount:</span>
                <strong class="amount-text">₱{{ formatNumber(paymentForm.amount || 0) }}</strong>
              </div>
              <div class="summary-item">
                <span>Payment Method:</span>
                <strong>{{ paymentForm.method }}</strong>
              </div>
              <div class="summary-item highlight">
                <span>New Balance:</span>
                <strong>₱{{ formatNumber(calculateNewBalance) }}</strong>
              </div>
            </div>

            <!-- Pay Button -->
            <button 
              class="pay-btn" 
              @click="processPayment"
              :disabled="isProcessingPayment || !isPaymentValid"
            >
              <span v-if="!isProcessingPayment">Process Payment</span>
              <span v-else class="loading-dots">Processing</span>
            </button>
          </div>
        </div>

        <!-- Status Update Section -->
        <div class="status-update-section">
          <h3>Update Status</h3>
          <div class="status-controls">
            <select 
              v-model="selectedStatus" 
              class="status-select"
              :class="getStatusClass(selectedStatus)"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-in">Checked-in</option>
              <option value="Checked-out">Checked-out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <button 
              class="update-btn" 
              @click="updateStatus"
              :disabled="isUpdatingStatus || selectedStatus === booking.status"
              :class="{
                'btn-success': isUpdatingStatus === 'success',
                'btn-error': isUpdatingStatus === 'error'
              }"
            >
              <span v-if="!isUpdatingStatus">Update Status</span>
              <span v-else-if="isUpdatingStatus === 'success'">✓ Updated!</span>
              <span v-else-if="isUpdatingStatus === 'error'">✗ Failed</span>
              <span v-else class="loading-dots">Updating</span>
            </button>
          </div>
        </div>

        <!-- Admin Notes -->
        <div class="notes-section">
          <h3>Admin Notes</h3>
          <textarea 
            v-model="adminNotes" 
            placeholder="Add private notes about this booking..."
            rows="3"
          ></textarea>
          <button 
            class="save-notes-btn" 
            @click="saveNotes"
            :disabled="isSavingNotes"
          >
            {{ isSavingNotes ? 'Saving...' : 'Save Notes' }}
          </button>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue'
import bookingsService from '@/services/bookingService'
import { paymentsAPI } from '@/services/api'

const props = defineProps({
  show: Boolean,
  booking: Object
})

const emit = defineEmits(['close', 'update-status', 'save-notes', 'payment-success'])

const selectedStatus = ref('')
const adminNotes = ref('')
const isSavingNotes = ref(false)
const isUpdatingStatus = ref(false)

// Payment form state
const paymentForm = reactive({
  amount: 0,
  method: 'GCash',
  referenceNumber: ''
})

const paymentErrors = reactive({
  amount: '',
  reference: ''
})

const isProcessingPayment = ref(false)

// Calculate new balance after payment
const calculateNewBalance = computed(() => {
  if (!props.booking) return 0
  const currentBalance = props.booking.remainingBalance || 0
  return Math.max(0, currentBalance - (paymentForm.amount || 0))
})

// Validate payment form
const isPaymentValid = computed(() => {
  if (!props.booking) return false
  
  const isValidAmount = paymentForm.amount > 0 && 
                       paymentForm.amount <= props.booking.remainingBalance
  
  if (!isValidAmount) return false
  
  if (paymentForm.method === 'GCash') {
    return paymentForm.referenceNumber && paymentForm.referenceNumber.trim() !== ''
  }
  
  return true
})

// Watch for booking changes to update local state
watch(() => props.booking, (newBooking) => {
  if (newBooking) {
    selectedStatus.value = newBooking.status || 'Pending'
    adminNotes.value = newBooking.notes || ''
    
    // Reset payment form
    paymentForm.amount = newBooking.remainingBalance || 0
    paymentForm.method = 'GCash'
    paymentForm.referenceNumber = ''
    paymentErrors.amount = ''
    paymentErrors.reference = ''
    
    console.log('Loading booking:', {
      id: newBooking.id,
      guest: newBooking.guest,
      remainingBalance: newBooking.remainingBalance
    })
  }
}, { immediate: true })

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

// Calculate nights between dates
const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 'N/A'
  try {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch (e) {
    return 'N/A'
  }
}

// Format number
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return Number(num).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Checked-in': 'status-checkedin',
    'Checked-out': 'status-checkedout',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

// Close modal
const closeModal = () => {
  emit('close')
}

// Validate payment amount
const validatePaymentAmount = () => {
  if (!props.booking) {
    paymentErrors.amount = 'Booking not found'
    return false
  }
  
  if (paymentForm.amount <= 0) {
    paymentErrors.amount = 'Amount must be greater than 0'
    return false
  }
  
  if (paymentForm.amount > props.booking.remainingBalance) {
    paymentErrors.amount = `Amount cannot exceed remaining balance of ₱${formatNumber(props.booking.remainingBalance)}`
    return false
  }
  
  paymentErrors.amount = ''
  return true
}

// Validate reference number
const validateReference = () => {
  if (paymentForm.method === 'GCash' && !paymentForm.referenceNumber) {
    paymentErrors.reference = 'Reference number is required for GCash payments'
    return false
  }
  paymentErrors.reference = ''
  return true
}

// Handle payment method change
const handlePaymentMethodChange = () => {
  if (paymentForm.method === 'Cash') {
    paymentForm.referenceNumber = ''
    paymentErrors.reference = ''
  }
}

// Process payment
const processPayment = async () => {
  if (!validatePaymentAmount()) return
  if (paymentForm.method === 'GCash' && !validateReference()) return

  isProcessingPayment.value = true

  try {
    const paymentData = {
      guestName: props.booking.guest,
      email: props.booking.email,
      phoneNumber: props.booking.phoneNumber,
      roomName: props.booking.room,
      amount: paymentForm.amount,
      paymentMethod: paymentForm.method,
      referenceNumber: paymentForm.method === 'GCash' ? paymentForm.referenceNumber : '',
      paymentType: 'Balance Payment',
      notes: `Balance payment for booking #${props.booking.id}`
    }

    console.log('💰 Processing payment:', paymentData)
    
    const response = await paymentsAPI.create(props.booking.id, paymentData)
    
    if (response.data?.success) {
      console.log('✅ Payment successful:', response.data)
      
      // Update local booking data
      if (props.booking) {
        props.booking.remainingBalance = calculateNewBalance.value
      }
      
      // Emit success event
      emit('payment-success', {
        bookingId: props.booking.id,
        amount: paymentForm.amount,
        newBalance: calculateNewBalance.value
      })
      
      // Reset payment form
      paymentForm.amount = props.booking.remainingBalance || 0
      paymentForm.referenceNumber = ''
      paymentErrors.reference = ''
      
      // Show success message
      alert(`Payment of ₱${formatNumber(paymentForm.amount)} processed successfully!\nNew balance: ₱${formatNumber(calculateNewBalance.value)}`)
    } else {
      throw new Error(response.data?.message || 'Failed to process payment')
    }
  } catch (error) {
    console.error('❌ Payment failed:', error)
    alert(`Payment failed: ${error.response?.data?.message || error.message}`)
  } finally {
    isProcessingPayment.value = false
  }
}

// Update status with loading state
const updateStatus = async () => {
  if (selectedStatus.value === props.booking.status) return
  
  isUpdatingStatus.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    emit('update-status', {
      bookingId: props.booking.id,
      newStatus: selectedStatus.value
    })
    
    isUpdatingStatus.value = 'success'
    await new Promise(resolve => setTimeout(resolve, 300))
    
  } catch (error) {
    console.error('Error updating status:', error)
    isUpdatingStatus.value = 'error'
    await new Promise(resolve => setTimeout(resolve, 300))
  } finally {
    isUpdatingStatus.value = false
  }
}

// Save notes
const saveNotes = async () => {
  if (!props.booking) return
  
  isSavingNotes.value = true
  
  try {
    console.log('Saving notes for booking:', props.booking.id, adminNotes.value)
    
    const result = await bookingsService.updateBookingNotes(
      props.booking.id, 
      adminNotes.value
    )
    
    if (result.success) {
      console.log('✅ Notes saved successfully')
      
      if (props.booking) {
        props.booking.notes = adminNotes.value
      }
    } else {
      console.error('❌ Failed to save notes:', result.error)
      alert('Failed to save notes: ' + (result.error || 'Unknown error'))
    }
  } catch (error) {
    console.error('Error saving notes:', error)
    alert('Error saving notes: ' + error.message)
  } finally {
    await new Promise(resolve => setTimeout(resolve, 500))
    isSavingNotes.value = false
  }
}
</script>

<style scoped>
/* Add payment section styles */
.pay-balance-section {
  margin-bottom: 24px;
  padding-top: 20px;
  border-top: 2px solid #4a90e2;
}

.pay-balance-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.payment-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.readonly-field {
  padding: 10px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  cursor: not-allowed;
}

.error-input {
  border-color: #ef4444 !important;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.help-text {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.payment-summary {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin: 16px 0;
  border: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.highlight {
  background: #f0f9ff;
  padding: 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.summary-item span {
  color: #6b7280;
  font-size: 13px;
}

.summary-item strong {
  color: #1f2937;
  font-size: 14px;
}

.amount-text {
  color: #10b981;
  font-size: 16px;
  font-weight: 600;
}

.highlight strong {
  color: #2563eb;
  font-size: 16px;
}

.pay-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.highlight-balance {
  background: #f0f9ff;
  padding: 8px;
  border-radius: 4px;
}

.balance-amount {
  color: #2563eb;
  font-size: 18px !important;
  font-weight: 700 !important;
}

/* Rest of your existing styles */
.update-btn.btn-success {
  background-color: #28a745;
}

.update-btn.btn-error {
  background-color: #dc3545;
}

.loading-dots:after {
  content: '...';
  animation: dots 1.5s steps(4, end) infinite;
  display: inline-block;
  width: 20px;
  text-align: left;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-family: 'Cormorant Garamond', serif;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  padding: 0 8px;
  line-height: 1;
  transition: color 0.2s;
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
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.status-confirmed {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-checkedin {
  background-color: #cce5ff;
  color: #004085;
  border: 1px solid #b8daff;
}

.status-checkedout {
  background-color: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.contact-section,
.status-update-section,
.notes-section {
  margin-bottom: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.contact-section h3,
.status-update-section h3,
.notes-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.status-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-select {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.3s;
}

.status-select:focus {
  border-color: var(--blue);
}

.update-btn,
.save-notes-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.update-btn {
  background-color: var(--blue);
  color: white;
}

.update-btn:hover:not(:disabled) {
  background-color: #1d4d7a;
}

.update-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.save-notes-btn {
  background-color: var(--green);
  color: white;
  margin-top: 12px;
  width: 100%;
}

.save-notes-btn:hover {
  background-color: #1e8449;
}

.notes-section textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
}

.notes-section textarea:focus {
  border-color: var(--blue);
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

.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

@media (max-width: 768px) {
  .info-grid,
  .contact-grid,
  .payment-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .status-controls {
    flex-direction: column;
  }

  .update-btn {
    width: 100%;
  }
}
</style>