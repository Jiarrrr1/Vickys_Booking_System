<template>
  <div>
    <div v-if="isOpen" id="booking-overlay">
      <!-- ─── SUCCESS STATE WITH PAYMENT SUMMARY ─── -->
      <div v-if="submitted" class="success-view">
        <!-- Close button -->
        <button class="success-close-btn" @click="closeSuccessModal">✕</button>
        
        <div class="success-icon">✓</div>
        <div class="success-title">Booking Submitted!</div>
        <div class="success-subtitle">Your reservation has been submitted successfully</div>
        
        <!-- Payment Summary in Success Modal -->
        <div class="success-payment-summary">
          <h3 class="summary-title">Payment Summary</h3>
          
          <div class="summary-row">
            <span>Room:</span>
            <strong>{{ bookingRoom.name }}</strong>
          </div>
          <div class="summary-row">
            <span>Check-in:</span>
            <strong>{{ formatDate(form.checkIn) }}</strong>
          </div>
          <div class="summary-row">
            <span>Check-out:</span>
            <strong>{{ formatDate(form.checkOut) }}</strong>
          </div>
          <div class="summary-row">
            <span>Total Nights:</span>
            <strong>{{ totalNights }}</strong>
          </div>
          
          <div class="summary-divider"></div>
          
          <div class="summary-row total-row">
            <span>Total Amount:</span>
            <strong>₱{{ totalPrice.toLocaleString() }}</strong>
          </div>
          <div class="summary-row paid-row">
            <span>Amount Paid:</span>
            <strong>₱{{ (form.payType === 'down' ? computeDownpayment : totalPrice).toLocaleString() }}</strong>
          </div>
          <div v-if="form.payType === 'down'" class="summary-row balance-row">
            <span>Remaining Balance:</span>
            <strong>₱{{ computeRemainingBalance.toLocaleString() }}</strong>
          </div>
          <div v-else class="summary-row paid-row">
            <span>Status:</span>
            <strong>✓ Fully Paid</strong>
          </div>
          
          <div class="reference-box">
            <div class="summary-row">
              <span>Reference No.:</span>
              <strong>{{ form.rfrncNumber || 'N/A' }}</strong>
            </div>
            <div class="summary-row">
              <span>Payment Method:</span>
              <strong>GCash</strong>
            </div>
          </div>
        </div>
        <div style="color: #333; padding-bottom: 10px; font-size: 12px;">
          <strong>Wait for our confirmation email. <br>Thank you for choosing us!</strong>
        </div>
        <div class="success-refnum">Booking #: {{ refNumber }}</div>
        
        <button class="success-done-btn" @click="closeSuccessModal">
          Done
        </button>
      </div>
      
      <div v-if="!submitted" class="booking-modal">
        <!-- ─── LOADING STATE ─── -->
        <div v-if="isSubmitting" class="loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">Submitting your booking...</div>
        </div>

        <!-- ─── FORM VIEW ─── -->
        <div v-else>
          <div class="modal-topbar">
            <div class="room-pill">
              <span class="room-pill-icon">{{ bookingRoom.icon }}</span>
              <span class="room-pill-name">{{ bookingRoom.name }}</span>
              <span class="room-pill-price">· ₱{{ bookingRoom.price.toLocaleString() }}</span>
            </div>
            <button class="modal-close" @click="closeBooking">✕</button>
          </div>

          <div class="modal-progress">
            <div class="prog-steps">
              <div v-for="(label, i) in stepLabels" :key="i" class="prog-step" :class="{
                done: currentStep > i + 1,
                active: currentStep === i + 1
              }">
                <div class="prog-dot">{{ currentStep > i + 1 ? '✓' : i + 1 }}</div>
                <span class="prog-label">{{ label }}</span>
              </div>
            </div>
          </div>

          <div style="overflow-y: auto;" class="modal-body">
            <!-- STEP 1 — Guest Info -->
            <div v-show="currentStep === 1" class="form-step">
              <div class="step-title">Guest Information</div>
              <div class="step-sub">Tell us about who's staying.</div>
              <div class="fgrp">
                <label>Full Name</label>
                <input v-model="form.name" type="text" placeholder="e.g. Maria Santos" required>
                <small v-if="fieldErrors.name" style="color: #e74c3c; display: block; margin-top: 4px;">
                  {{ fieldErrors.name }}
                </small>
              </div>
              <div class="fg2">
                <div class="fgrp">
                  <label>Email Address</label>
                  <input v-model="form.email" type="email" placeholder="you@example.com">
                  <small v-if="fieldErrors.email" style="color: #e74c3c; display: block; margin-top: 4px;">
                    {{ fieldErrors.email }}
                  </small>
                </div>
                <div class="fgrp">
                  <label>Contact Number</label>
                  <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                    <div>+63</div>
                    <input v-model="form.phone" type="number" placeholder="9XX XXX XXXX">
                  </div>
                  <small v-if="fieldErrors.phone"
                    style="color: #e74c3c; display: block; margin-left: 30px; margin-top: 4px;">
                    {{ fieldErrors.phone }}
                  </small>
                </div>
              </div>
              <div class="fgrp">
                <label>Number of Guests</label>
                <input v-model="form.guestCount" type="number" min="1" max="15">
              </div>
              <div class="fgrp">
                <label>Special Requests
                  <span style="font-weight:400;letter-spacing:0;text-transform:none;color:#bbb;">(optional)</span>
                </label>
                <textarea v-model="form.specialReq" placeholder="Any special arrangements or notes…"></textarea>
              </div>
            </div>

            <!-- STEP 2 — Booking Date -->
            <div v-show="currentStep === 2" class="form-step">
              <div class="step-title">Booking Details</div>
              <div class="step-sub">When would you like to stay?</div>
              <div class="fgrp">
                <label>Check-In Date</label>
                <input v-model="form.checkIn" type="date" :min="minDate" :max="maxCheckInDate" @input="validateCheckIn"
                  @keydown="preventTyping" ref="checkInInput">
                <small v-if="checkInError"
                  style="color: #e74c3c; display: block; margin-top: 4px; margin-bottom: 4px; ">
                  {{ checkInError }}
                </small>

                <label>Check-Out Date</label>
                <input v-model="form.checkOut" type="date" :min="minCheckOutDate" :max="maxCheckOutDate"
                  :disabled="!form.checkIn" @input="validateCheckOut" @keydown="preventTyping" ref="checkOutInput">
                <small v-if="checkOutError" style="color: #e74c3c; display: block; margin-top: 4px;">
                  {{ checkOutError }}
                </small>
              </div>
            </div>

            <!-- STEP 3 — Review -->
            <div v-show="currentStep === 3" class="form-step">
              <div class="step-title">Review Your Booking</div>
              <div class="step-sub">Review your details before proceeding to payment.</div>
              
              <div class="sum-card">
                <div class="sum-card-head">
                  <span class="sum-head-label">Booking Summary</span>
                  <span class="sum-head-room">{{ bookingRoom.name }}</span>
                </div>
                <div class="sum-rows">
                  <div class="sum-row"><span>Guest Name</span><strong>{{ form.name || '—' }}</strong></div>
                  <div class="sum-row"><span>Email</span><strong>{{ form.email || '—' }}</strong></div>
                  <div class="sum-row"><span>Contact Number</span><strong>+63 {{ form.phone || '—' }}</strong></div>
                  <div class="sum-row"><span>Number of Guests</span><strong>{{ form.guestCount }}</strong></div>
                  <div class="sum-row"><span>Check-In</span><strong>{{ form.checkIn || '—' }}</strong></div>
                  <div class="sum-row"><span>Check-Out</span><strong>{{ form.checkOut || '—' }}</strong></div>
                  <div class="sum-row"><span>Total Nights</span><strong>{{ totalNights }} {{ totalNights === 1 ? 'night' : 'nights' }}</strong></div>
                </div>
                <div class="sum-total" style="margin-top: 15px;">
                  <div style="display: flex; justify-content: space-between; font-size: 18px;">
                    <span class="sum-total-label">Total Amount</span>
                    <span class="sum-total-amt" style="font-weight: bold;">₱{{ totalPrice.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <div class="terms-box">
                <p>By proceeding to payment, you agree to our resort <a>terms and policies</a>.</p>
              </div>
            </div>

            <!-- STEP 4 — Payment -->
            <div v-show="currentStep === 4" class="form-step">
              <div class="step-title">Payment</div>
              <div class="step-sub">Complete your payment to confirm booking</div>
              
              <div class="gcash-badge">
                <div class="gcash-icon">📱</div>
                <div>
                  <div class="gcash-name">GCash Payment</div>
                  <div class="gcash-sub">Scan QR code or enter reference number</div>
                </div>
              </div>

              <div class="qr-code" style="text-align: center; margin: 20px 0;">        
                Scan the QR code to pay
                <img src="../assets/images/QRCode.svg" alt="" width="200px" style="display: block; margin: 10px auto;">
              </div>
              
              <div class="fgrp">
                <label>Payment Type</label>
                <div class="pay-cards">
                  <div class="pay-card" :class="{ selected: form.payType === 'down' }" @click="form.payType = 'down'">
                    <div class="pay-card-check">✓</div>
                    <span class="pay-card-label">Downpayment (50%)</span>
                    <span class="pay-card-amount">₱{{ computeDownpayment?.toLocaleString() ?? '0'}}</span>
                  </div>
                  <div class="pay-card" :class="{ selected: form.payType === 'full' }" @click="form.payType = 'full'">
                    <div class="pay-card-check">✓</div>
                    <span class="pay-card-label">Full Payment</span>
                    <span class="pay-card-amount">₱{{ totalPrice.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <div class="fgrp">
                <label>Reference Number</label>
                <input v-model="form.rfrncNumber" type="text" placeholder="Enter GCash reference number">
                <small v-if="fieldErrors.rfrncNumber" style="color: #e74c3c;">{{ fieldErrors.rfrncNumber }}</small>
                <small v-else class="help-text">Enter the 13-digit reference number from your GCash receipt</small>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-back" :style="{ visibility: currentStep === 1 ? 'hidden' : 'visible' }"
              @click="prevStep">← Back</button>
            <button class="btn-next" @click="nextStep">
              {{ currentStep === 4 ? 'Confirm Booking' : 'Continue →' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBooking } from '@/utils/useBooking'
import { useBookingModal } from '@/utils/useBookingModal'
import { computed } from 'vue'

const { isOpen, bookingRoom, closeBooking } = useBooking()

const {
  stepLabels,
  currentStep,
  submitted,
  refNumber,
  checkInInput,
  checkOutInput,
  checkInError,
  checkOutError,
  fieldErrors,
  form,
  minDate,
  blockedDateRanges,
  maxCheckInDate,
  maxCheckOutDate,
  minCheckOutDate,
  totalNights,
  totalPrice,
  computeDownpayment,
  computeRemainingBalance,
  getReservation,
  validateCheckIn,
  validateCheckOut,
  preventTyping,
  formatDate,
  nextStep,
  prevStep,
  resetForm,
  bookAnother,
  isSubmitting,
  paymentCompleted,
  paymentLocked,
} = useBookingModal(bookingRoom, isOpen, closeBooking)



const closeSuccessModal = () => {
  closeBooking()
  resetForm()
}
</script>

<style scoped>  
/* Success View - Compact Version */
.success-view {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;
  max-width: 450px;
  margin: 0 auto;
  background-color: var(--white);
  border-radius: 12px;
}

.success-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
}

.success-close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.success-icon {
  width: 50px;
  height: 50px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 15px;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.success-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

/* Payment Summary */
.success-payment-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  width: 100%;
  max-width: 350px;
  margin: 0 auto 15px;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.summary-title {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.summary-row span {
  color: #666;
}

.summary-row strong {
  color: #333;
  font-weight: 600;
}

.summary-divider {
  border-top: 2px solid #4a90e2;
  margin: 12px 0;
}

.total-row {
  font-size: 15px;
  margin-bottom: 8px;
  font-weight: 600;
}

.total-row span {
  color: #333;
  font-weight: 500;
}

.total-row strong {
  color: #333;
  font-size: 16px;
}

.paid-row {
  color: #28a745;
  margin-bottom: 5px;
}

.paid-row span {
  color: #28a745;
}

.paid-row strong {
  color: #28a745;
  font-weight: 600;
}

.balance-row {
  color: #dc3545;
  margin-bottom: 5px;
}

.balance-row span {
  color: #dc3545;
}

.balance-row strong {
  color: #dc3545;
  font-weight: 600;
}

/* Reference Box */
.reference-box {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.reference-box .summary-row {
  margin-bottom: 5px;
}

.reference-box .summary-row:last-child {
  margin-bottom: 0;
}

.reference-box span {
  color: #1976d2;
  font-size: 12px;
}

.reference-box strong {
  color: #0d47a1;
  font-size: 13px;
  font-weight: 600;
}

/* Booking Reference */
.success-refnum {
  font-size: 16px;
  font-weight: 600;
  color: #4a90e2;
  background: #e3f2fd;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 15px;
  display: inline-block;
}

/* Done Button */
.success-done-btn {
  padding: 10px 30px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
}

.success-done-btn:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.success-done-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
}

/* Help text */
.help-text {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}
</style>