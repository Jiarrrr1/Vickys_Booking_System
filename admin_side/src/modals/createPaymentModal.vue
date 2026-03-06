<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="create-payment-modal" @click.stop>
        <div class="modal-header">
          <h2>Create New Payment</h2>
          <button class="close-btn" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- Reservation Selection -->
          <div class="form-section">
            <h3>Select Reservation</h3>
            
            <div class="form-group">
              <label for="reservationId">Reservation ID *</label>
              <input
                id="reservationId"
                v-model="formData.reservationId"
                type="text"
                required
                placeholder="Enter reservation ID..."
                @input="handleReservationInput"
                @blur="fetchReservationDetails"
                :class="{ 'error-input': searchError }"
              />
              <p v-if="searchError" class="error-message">{{ searchError }}</p>
              <p v-else class="help-text">Enter the reservation ID to link this payment</p>
            </div>

            <!-- Show reservation details if found -->
            <div v-if="reservationDetails" class="reservation-info">
              <div class="info-row">
                <span>Guest:</span>
                <strong>{{ reservationDetails.fullName }}</strong>
              </div>
              <div class="info-row">
                <span>Room:</span>
                <strong>{{ reservationDetails.roomName }}</strong>
              </div>
              <div class="info-row">
                <span>Total Amount:</span>
                <strong>₱{{ formatNumber(reservationDetails.totalAmount) }}</strong>
              </div>
              <div class="info-row highlight">
                <span>Remaining Balance:</span>
                <strong>₱{{ formatNumber(reservationDetails.remainingBalance) }}</strong>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="form-section">
            <h3>Payment Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="amount">Amount (₱) *</label>
                <input
                  id="amount"
                  v-model.number="formData.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  :max="reservationDetails?.remainingBalance"
                  @input="validateAmount"
                  :class="{ 'error-input': amountError }"
                />
                <p v-if="amountError" class="error-message">{{ amountError }}</p>
                <p v-else class="help-text">
                  Maximum: ₱{{ formatNumber(reservationDetails?.remainingBalance || 0) }}
                </p>
              </div>

              <div class="form-group">
                <label for="paymentMethod">Payment Method *</label>
                <select 
                  id="paymentMethod" 
                  v-model="formData.paymentMethod" 
                  required 
                  @change="handlePaymentMethodChange"
                >
                  <option value="GCash">GCash</option>
                  <option value="Cash">Cash</option>
                </select>
                <p class="help-text">Only GCash and Cash are accepted</p>
              </div>
            </div>

            <div class="form-row">
              <!-- Reference Number - Only show for GCash -->
              <div class="form-group" v-if="formData.paymentMethod === 'GCash'">
                <label for="referenceNumber">Reference Number <span class="required-star">*</span></label>
                <input
                  id="referenceNumber"
                  v-model="formData.referenceNumber"
                  type="text"
                  required
                  placeholder="Enter GCash reference number"
                  :class="{ 'error-input': referenceError }"
                  @input="validateReference"
                />
                <p v-if="referenceError" class="error-message">{{ referenceError }}</p>
                <p v-else class="help-text">Required for GCash payments</p>
              </div>

              <!-- Payment Type - Fixed to Balance Payment -->
              <div class="form-group">
                <label for="paymentType">Payment Type</label>
                <input
                  id="paymentType"
                  type="text"
                  value="Balance Payment"
                  disabled
                  class="readonly-field"
                />
              </div>
            </div>

            <!-- Hidden fields for API -->
            <input type="hidden" name="paymentType" value="Balance Payment" />
            <input type="hidden" name="status" value="Paid" />
          </div>

          <!-- Additional Notes -->
          <div class="form-section">
            <div class="form-group">
              <label for="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Any additional notes about this payment..."
              ></textarea>
            </div>
          </div>

          <!-- Summary Box -->
          <div class="summary-box">
            <h4>Payment Summary</h4>
            <div class="summary-item">
              <span>Payment Amount:</span>
              <strong class="amount-text">₱{{ formatNumber(formData.amount || 0) }}</strong>
            </div>
            <div class="summary-item">
              <span>Payment Method:</span>
              <strong>{{ formData.paymentMethod }}</strong>
            </div>
            <div class="summary-item">
              <span>Payment Type:</span>
              <strong>Balance Payment</strong>
            </div>
            <div class="summary-item">
              <span>Status:</span>
              <span class="status-badge status-paid">Paid</span>
            </div>
            <div v-if="formData.paymentMethod === 'GCash' && formData.referenceNumber" class="summary-item">
              <span>Reference No.:</span>
              <strong>{{ formData.referenceNumber }}</strong>
            </div>
            <div class="summary-item highlight">
              <span>New Balance:</span>
              <strong>₱{{ formatNumber(calculateNewBalance) }}</strong>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn-submit" 
              :disabled="isSubmitting || !isFormValid"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Payment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { adminClient, paymentsAPI } from '@/services/api' // Fix import

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const reservationDetails = ref(null)
const searchError = ref('')
const amountError = ref('')
const referenceError = ref('')

const formData = reactive({
  reservationId: '',
  guestName: '',
  email: '',
  phoneNumber: '',
  roomName: '',
  amount: 0,
  paymentMethod: 'GCash',
  referenceNumber: '',
  notes: ''
})

// Calculate new balance after payment
const calculateNewBalance = computed(() => {
  if (!reservationDetails.value) return 0
  const currentBalance = reservationDetails.value.remainingBalance || 0
  return Math.max(0, currentBalance - (formData.amount || 0))
})

// Form validation
const isFormValid = computed(() => {
  if (!reservationDetails.value) return false
  
  const isValidAmount = formData.amount > 0 && 
                       formData.amount <= reservationDetails.value.remainingBalance
  
  if (!isValidAmount) return false
  
  if (formData.paymentMethod === 'GCash') {
    return formData.referenceNumber && formData.referenceNumber.trim() !== ''
  }
  
  return true
})

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return Number(num).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleReservationInput = () => {
  searchError.value = ''
  if (!formData.reservationId) {
    reservationDetails.value = null
    clearFormFields()
  }
}

const clearFormFields = () => {
  formData.guestName = ''
  formData.email = ''
  formData.phoneNumber = ''
  formData.roomName = ''
  formData.amount = 0
  amountError.value = ''
}

// FIXED: Use adminClient instead of paymentsAPI
const fetchReservationDetails = async () => {
  if (!formData.reservationId) {
    reservationDetails.value = null
    searchError.value = ''
    clearFormFields()
    return
  }

  try {
    console.log('🔍 Fetching reservation:', formData.reservationId)
    const response = await adminClient.get(`/getReservation/${formData.reservationId}`)
    
    if (response.data) {
      reservationDetails.value = response.data
      searchError.value = ''
      
      formData.guestName = response.data.fullName
      formData.email = response.data.email
      formData.phoneNumber = response.data.phoneNumber
      formData.roomName = response.data.roomName
      formData.amount = response.data.remainingBalance || 0
      
      console.log('✅ Reservation found:', response.data)
    }
  } catch (error) {
    console.error('❌ Reservation not found:', error)
    reservationDetails.value = null
    searchError.value = 'Reservation not found. Please check the ID.'
    clearFormFields()
    formData.reservationId = ''
  }
}

const validateAmount = () => {
  if (!reservationDetails.value) {
    amountError.value = 'Please select a reservation first'
    return false
  }
  
  if (formData.amount <= 0) {
    amountError.value = 'Amount must be greater than 0'
    return false
  }
  
  if (formData.amount > reservationDetails.value.remainingBalance) {
    amountError.value = `Amount cannot exceed remaining balance of ₱${formatNumber(reservationDetails.value.remainingBalance)}`
    return false
  }
  
  amountError.value = ''
  return true
}

const validateReference = () => {
  if (formData.paymentMethod === 'GCash' && !formData.referenceNumber) {
    referenceError.value = 'Reference number is required for GCash payments'
    return false
  }
  referenceError.value = ''
  return true
}

const handlePaymentMethodChange = () => {
  if (formData.paymentMethod === 'Cash') {
    formData.referenceNumber = ''
    referenceError.value = ''
  }
}

watch(() => formData.paymentMethod, (newValue) => {
  if (newValue === 'Cash') {
    formData.referenceNumber = ''
    referenceError.value = ''
  }
})

watch(() => reservationDetails.value?.remainingBalance, (newBalance) => {
  if (newBalance) {
    formData.amount = newBalance
    validateAmount()
  }
})

watch(() => formData.amount, () => {
  validateAmount()
})

watch(() => formData.referenceNumber, () => {
  if (formData.paymentMethod === 'GCash') {
    validateReference()
  }
})

const handleOverlayClick = () => {
  emit('close')
}

// FIXED: Use paymentsAPI.create correctly
const handleSubmit = async () => {
  if (!formData.reservationId) {
    searchError.value = 'Please enter a reservation ID'
    return
  }

  if (!validateAmount()) return
  
  if (formData.paymentMethod === 'GCash' && !validateReference()) return

  isSubmitting.value = true
  
  try {
    const paymentData = {
      guestName: formData.guestName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      roomName: formData.roomName,
      amount: formData.amount,
      balance: calculateNewBalance.value,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.paymentMethod === 'GCash' ? formData.referenceNumber : '',
      paymentType: 'Balance Payment',
      status: 'Paid',
      notes: formData.notes
    }

    console.log('💰 Creating payment:', paymentData)
    
    // FIXED: Use paymentsAPI.create correctly (it's a function, not an object)
    const response = await paymentsAPI.create(formData.reservationId, paymentData)
    
    if (response.data?.success) {
      console.log('✅ Payment created:', response.data)
      emit('success', response.data.data)
      emit('close')
      resetForm()
    } else {
      throw new Error(response.data?.message || 'Failed to create payment')
    }
  } catch (error) {
    console.error('❌ Error creating payment:', error)
    alert(`Failed to create payment: ${error.response?.data?.message || error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'number') {
      formData[key] = 0
    } else if (typeof formData[key] === 'string') {
      formData[key] = ''
    }
  })
  formData.paymentMethod = 'GCash'
  reservationDetails.value = null
  searchError.value = ''
  amountError.value = ''
  referenceError.value = ''
}
</script>

<style scoped>
/* Add these new styles */
.highlight {
  background: #f0f9ff;
  padding: 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.highlight strong {
  color: #2563eb;
  font-size: 16px;
}

/* Required star */
.required-star {
  color: #ef4444;
  margin-left: 2px;
}

/* Readonly field */
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

/* Error styling */
.error-input {
  border-color: #ef4444 !important;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.create-payment-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.close-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.modal-body {
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
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
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.reservation-info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.info-row span {
  color: #6b7280;
  font-size: 14px;
}

.info-row strong {
  color: #1f2937;
  font-size: 14px;
}

.summary-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-box h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item span {
  color: #6b7280;
  font-size: 14px;
}

.summary-item strong {
  color: #1f2937;
  font-size: 14px;
}

.amount-text {
  color: #10b981;
  font-size: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f9fafb;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-submit {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>