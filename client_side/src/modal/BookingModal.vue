<template>
  <div>
    <div v-if="isOpen" id="booking-overlay">
      <div class="booking-modal">
        
        <!-- ─── LOADING STATE ─── -->
        <div v-if="isSubmitting" class="loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">Submitting your booking...</div>
        </div>

        <!-- ─── SUCCESS STATE ─── -->
        <div v-else-if="submitted" class="success-view">
          <div class="success-icon">✓</div>
          <div class="success-title">Booking Confirmed!</div>
          <div class="success-subtitle">Your reservation has been submitted successfully</div>
          <div class="success-refnum">Reference Number: {{ refNumber }}</div>
          <div class="success-message">
            We'll contact you shortly at <strong>{{ form.email }}</strong> to confirm your booking.
          </div>
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

          <div class="modal-body">
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
                  <small v-if="fieldErrors.phone" style="color: #e74c3c; display: block; margin-left: 30px; margin-top: 4px;">
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
                <input v-model="form.checkIn" type="date" :min="minDate" :max="maxCheckInDate"
                  @input="validateCheckIn" @keydown="preventTyping" ref="checkInInput">
                <small v-if="checkInError" style="color: #e74c3c; display: block; margin-top: 4px; margin-bottom: 4px; ">
                  {{ checkInError }}
                </small>

                <label>Check-Out Date</label>
                <input v-model="form.checkOut" type="date" :min="minCheckOutDate" :max="maxCheckOutDate"
                  :disabled="!form.checkIn" @input="validateCheckOut" @keydown="preventTyping" ref="checkOutInput">
                <small v-if="checkOutError" style="color: #e74c3c; display: block; margin-top: 4px;">
                  {{ checkOutError }}
                </small>
              </div>
              <div class="fgrp">
                <label>Additional Notes
                  <span style="font-weight:400;letter-spacing:0;text-transform:none;color:#bbb;">(optional)</span>
                </label>
                <textarea v-model="form.notes" placeholder="Any additional information about your booking..."></textarea>
              </div>
            </div>

            <!-- STEP 3 — Payment -->
            <div v-show="currentStep === 3" class="form-step">
              <div class="step-title">Payment</div>
              <div class="step-sub">We accept GCash payments only</div>
              <div class="gcash-badge">
                <div class="gcash-icon">📱</div>
                <div>
                  <div class="gcash-name">JU****** J* H.</div>
                  <div class="gcash-sub"> 0970-940-6573 </div>
                </div>
              </div>

              <div class="qr-code">        
                  You may send your payment in the account above
                  <br> or <br>
                  Scan the QR code below to complete your payment
                  <img src="../assets//images/QRCode.svg" alt="" width="250px">
              </div>
              
              <div class="fgrp">
                <label>Payment Type</label>
                <div class="pay-cards">
                  <div class="pay-card" :class="{ selected: form.payType === 'down' }"
                    @click="form.payType = 'down'">
                    <div class="pay-card-check">✓</div>
                    <span class="pay-card-label">Downpayment</span>
                    <span class="pay-card-amount">₱{{ computeDownpayment?.toLocaleString() ?? '0'}}</span>
                    <span class="pay-card-note">50% of Total</span>
                  </div>
                  <div class="pay-card" :class="{ selected: form.payType === 'full' }"
                    @click="form.payType = 'full'">
                    <div class="pay-card-check">✓</div>
                    <span class="pay-card-label">Full Payment</span>
                    <span class="pay-card-amount">₱{{ totalPrice.toLocaleString() }}</span>
                    <span class="pay-card-note">Total Amount</span>
                  </div>
                </div>
              </div>

              <div class="fgrp">
                  <label>Reference Number</label>
                  <input v-model="form.rfrncNumber" type="number" placeholder="Please input transaction reference number">
                  <small v-if="fieldErrors.rfrncNumber" style="color: #e74c3c; display: block; margin-top: 4px;">
                    {{ fieldErrors.rfrncNumber }}
                  </small>
              </div>
            </div>

            <!-- STEP 4 — Confirm (FINAL STEP) -->
            <div v-show="currentStep === 4" class="form-step">
              <div class="step-title">Confirm Booking</div>
              <div class="step-sub">Review your details before submitting.</div>
              
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
                  <div class="sum-row"><span>Payment Method</span><strong>GCash</strong></div>
                  <div class="sum-row"><span>Reference Number</span><strong>{{ form.rfrncNumber || '—' }}</strong></div>
                  <div class="sum-row"><span>Payment Type</span><strong>{{ form.payType === 'down' ? 'Downpayment' : 'Full Payment' }}</strong></div>
                </div>
                <div class="sum-total">
                  <div style="border-bottom: solid 2px black;">
                    <span class="sum-total-label">Amount Paid</span>
                    <span class="sum-total-amt" style="font-size: 16px; color: black;">₱{{ computeDownpayment?.toLocaleString() ?? '0' }}</span>
                  </div>
                  <div>
                    <span class="sum-total-label">Remaining Balance</span>
                    <span class="sum-total-amt">₱{{ computeRemainingBalance.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <div class="terms-box">
                <p>By proceeding with your booking, you agree to our resort <a>terms and policies</a>. Cancellations are not allowed, but rebooking to another available date is permitted by coordinating with our resort staff.</p>
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
  validateCheckIn,
  validateCheckOut,
  preventTyping,
  formatDate,
  nextStep,
  prevStep,
  bookAnother,
  isSubmitting
} = useBookingModal(bookingRoom, isOpen, closeBooking)
</script>

<style scoped>
/* Loading Overlay */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a9e8e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 18px;
  color: #555;
  font-weight: 500;
}

/* Success View */
.success-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.success-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.success-refnum {
  font-size: 20px;
  font-weight: 600;
  color: #3498db;
  background: #e3f2fd;
  padding: 12px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-message {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  max-width: 400px;
}
</style>