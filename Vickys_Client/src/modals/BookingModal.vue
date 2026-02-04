<template>
  <!-- Modal Backdrop -->
  <div v-if="isVisible" class="modal-backdrop" @click="closeModal">
    <!-- Modal Content -->
    <div class="modal-content" @click.stop>

      <div class="step-header">
        <h2>Book {{ roomName }}</h2>
      </div>
      
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="steps-container">
          <div 
            v-for="(step, index) in steps" 
            :key="step.id"
            class="step-item"
            :class="{ 
              'active': currentStep === step.id,
              'completed': stepCompleted(step.id)
            }"
          >
            <div class="step-number"></div>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <button class="close-btn" @click="closeModal">&times;</button>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Step 1: Personal Details -->
        <div v-if="currentStep === 1" class="step-pane">
          <form @submit.prevent="goToNextStep">
            <div class="form-group">
              <label for="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName" 
                v-model="formData.fullName" 
                placeholder="Enter your full name" 
                
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                v-model="formData.email" 
                placeholder="Enter your email address" 
                
              />
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="formData.phone" 
                placeholder="Enter your phone number" 
                
              />
            </div>
            
            <div class="step-buttons">
              <button type="submit" class="btn-primary">Continue</button>
            </div>
          </form>
        </div>

       <!-- Step 2: Dates & Guests -->
<div v-else-if="currentStep === 2" class="step-pane">
  <form @submit.prevent="goToNextStep">
    <div class="form-group">
      <label for="checkIn">Check-in Date</label>
      <input 
        type="date" 
        id="checkIn" 
        v-model="formData.checkIn" 
        :min="minDate"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="checkOut">Check-out Date</label>
      <input 
        type="date" 
        id="checkOut" 
        v-model="formData.checkOut" 
        :min="minCheckOutDate"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="guests">Number of Guests</label>
      <div class="guest-selector">
        
        <!-- OR Alternative: Simple number input -->
        <input 
          type="number" 
          id="guests" 
          v-model.number="formData.guests"
          min="1" 
          max="10"
          @input="validateGuests"
        >
      </div>
    </div>

    <div class="form-group">
      <label for="request">Special Request</label>
      <input 
        type="text"
        id="request"
        v-model="formData.request"
        placeholder="Any special requests?"
      >
    </div>
    
    <div class="step-buttons">
      <button type="button" class="btn-secondary" @click="goToPreviousStep">Back</button>
      <button type="submit" class="btn-primary">Continue</button>
    </div>
  </form>
</div>

        <!-- Step 3: Payment Method -->
        <div v-else-if="currentStep === 3" class="step-pane">
          <div class="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div class="payment-options">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="payment-option"
                :class="{ 'selected': formData.paymentMethod === method.id }"
              >
                <input 
                  type="radio" 
                  :value="method.id"
                  v-model="formData.paymentMethod"
                  
                />
                <div class="payment-content">
                  <div class="payment-icon">
                    <span v-html="method.icon"></span>
                  </div>
                  <div class="payment-info">
                    <div class="payment-name">{{ method.name }}</div>
                    <div class="payment-desc">{{ method.description }}</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <!-- Booking Summary -->
          <div class="booking-summary">
            <h3>Booking Summary</h3>
            <div class="summary-details">
              <div class="summary-row">
                <span>Room:</span>
                <span>{{ roomName }}</span>
              </div>
              <div class="summary-row">
                <span>Check-in:</span>
                <span>{{ formatDate(formData.checkIn) }}</span>
              </div>
              <div class="summary-row">
                <span>Check-out:</span>
                <span>{{ formatDate(formData.checkOut) }}</span>
              </div>
              <div class="summary-row">
                <span>Guest{{ formData.guests > 1 ? 's' : '' }}:</span>
                <span>{{ formData.guests }}</span>
              </div>
              <div class="summary-row">
                <span>Nights:</span>
                <span>{{ calculateNights }}</span>
              </div>
              <div class="summary-row">
                <span>Special Request:</span>
                <span>{{ formData.request }}</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span class="total-amount">₱{{ calculateTotal }}</span>
              </div>
            </div>
          </div>
          
          <div class="step-buttons">
            <button type="button" class="btn-secondary" @click="goToPreviousStep">Back</button>
            <button type="button" class="btn-primary" @click="submitBooking">Continue</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reservationApi } from '@/services/api';
export default {
  name: 'BookingModal',
  props: {
    roomName: {
      type: String,
      default: 'Rose Room'
    }
  },
  data() {
    return {
      isVisible: false,
      currentStep: 1,
      steps: [
        { id: 1, label: 'Details' },
        { id: 2, label: 'Dates' },
        { id: 3, label: 'Payment' }
      ],
      formData: {
        fullName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        request: '',
        paymentMethod: 'gcash'
      },
       paymentMethods: [
      { 
        id: 'gcash', 
        name: 'GCash', 
        value: 'GCash', // Add this
        description: 'Pay using GCash app',
        icon: '💳'
      },
      { 
        id: 'onHand', 
        name: 'Cash', 
        value: 'Cash', // Add this
        description: 'Pay using Cash',
        icon: '💳'
      },
    ],
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    lineStyle() {
      const completedSteps = this.currentStep - 1
      const totalSteps = this.steps.length - 1
      const width = (completedSteps / totalSteps) * 100
      return { width: `${width}%` }
    },
    minDate() {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    },
    minCheckOutDate() {
      if (!this.formData.checkIn) return ''
      const checkIn = new Date(this.formData.checkIn)
      const nextDay = new Date(checkIn)
      nextDay.setDate(nextDay.getDate() + 1)
      return nextDay.toISOString().split('T')[0]
    },
    calculateNights() {
      if (!this.formData.checkIn || !this.formData.checkOut) return 0
      const checkIn = new Date(this.formData.checkIn)
      const checkOut = new Date(this.formData.checkOut)
      const diffTime = checkOut.getTime() - checkIn.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },
    calculateTotal() {
      const nights = this.calculateNights
      const pricePerNight = 1000 // ₱1,000 per night
      return (nights * pricePerNight).toLocaleString()
    }
  },
  methods: {
    openModal() {
      this.isVisible = true
      this.currentStep = 1
      this.resetForm()
      document.body.style.overflow = 'hidden'
    },
    closeModal() {
      this.isVisible = false
      document.body.style.overflow = 'auto'
    },
    resetForm() {
      this.formData = {
        fullName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: '',
        paymentMethod: 'gcash'
      }
    },
    goToNextStep() {
      if (this.currentStep < this.steps.length) {
        this.currentStep++
      }
    },
    goToPreviousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    stepCompleted(stepId) {
      return this.currentStep > stepId
    },
    increaseGuests() {
      if (this.formData.guests < 6) {
        this.formData.guests++
      }
    },
    decreaseGuests() {
      if (this.formData.guests > 1) {
        this.formData.guests--
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'Not set'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
   async submitBooking() {


      // Validate form
      const validation = this.validateForm();
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

       

      try {
        // Map payment method to proper value
     const paymentMethodMap = {
      'gcash': 'GCash',
      'onHand': 'Cash'
    };
        // Prepare data for backend
        const reservationData = {
          fullName: this.formData.fullName,
          email: this.formData.email,
          phoneNumber: this.formData.phone,
          checkIn: this.formData.checkIn,
          checkOut: this.formData.checkOut,
          guests: parseInt(this.formData.guests), // Ensure it's a number
          request: this.formData.request,
          paymentMethod: paymentMethodMap[this.formData.paymentMethod] || this.formData.paymentMethod,
          roomName: this.roomName,
          total: this.calculateTotal,
          nights: this.calculateNights,
          bookingDate: new Date().toISOString()
        };

        // Send to backend
        const response = await reservationApi.createReservation(reservationData);
        
        if (response.data.success) {
          this.successMessage = response.data.message;
          
          // Emit event to parent with response data
          this.$emit('booking-submitted', {
            ...reservationData,
            reservationId: response.data.data.reservationId,
            status: 'pending'
          });
          
          // Show success message
          alert(`✅ ${response.data.message}\nReservation ID: ${response.data.data.reservationId}`);
          
          // Reset form and close modal after delay
          setTimeout(() => {
            this.closeModal();
            this.resetForm();
          }, 2000);
        } else {
          throw new Error(response.data.message || 'Failed to create reservation');
        }
      } catch (error) {
        console.error('Booking error:', error);
        this.errorMessage = error.response?.data?.message || error.message || 'Failed to submit booking';
        alert(`❌ ${this.errorMessage}`);
      } finally {
        this.isLoading = false;
      }
    },

    validateForm() {
      // Step 1 validation
      if (!this.formData.fullName.trim()) {
        return { isValid: false, message: 'Please enter your full name' }
      }
      if (!this.formData.email.trim()) {
        return { isValid: false, message: 'Please enter your email address' }
      }
      if (!this.formData.phone.trim()) {
        return { isValid: false, message: 'Please enter your phone number' }
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        return { isValid: false, message: 'Please enter a valid email address' }
      }
      
      // Step 2 validation
      if (!this.formData.checkIn) {
        return { isValid: false, message: 'Please select check-in date' }
      }
      if (!this.formData.checkOut) {
        return { isValid: false, message: 'Please select check-out date' }
      }
      if (this.formData.checkOut <= this.formData.checkIn) {
        return { isValid: false, message: 'Check-out date must be after check-in date' }
      }
      
      return { isValid: true, message: '' }
    }
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.closeModal()
      }
    })
  }
}
</script>

<style scoped>
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Modal Content - Reduced padding for smaller text */
.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 480px; /* Slightly narrower */
  padding: 1.5rem; /* Reduced from 2rem */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  position: relative;
  max-height: 100vh;
  overflow-y:auto;
}

/* Close Button - Smaller */
.close-btn {
  position: absolute;
  top: 0.8rem; /* Adjusted */
  right: 0.8rem; /* Adjusted */
  background: none;
  border: none;
  font-size: 1.5rem; /* Reduced from 2rem */
  color: #999;
  cursor: pointer;
  line-height: 1;
  width: 26px; /* Smaller */
  height: 26px; /* Smaller */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  color: #333;
  background-color: #f5f5f5;
}

/* Step Indicator */
.step-indicator {
  margin-bottom: 1.5rem; /* Reduced */
}

.steps-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem; /* Reduced */
  position: relative;
  padding: 0 0.5rem; /* Reduced */
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 3.5rem; /* Smaller */
  height: .5rem;
  border-radius: 10px;
  background-color: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  margin-bottom: 0.4rem; /* Reduced */
  transition: all 0.3s ease;
  font-size: 0.8rem; /* Smaller */
}

.step-item.active .step-number {
  background-color: #007A56;
  color: white;
  transform: scale(1.05); /* Smaller scale */
}

.step-item.completed .step-number {
  background-color: #1F7F52;
  color: white;
}

/* Step Header - Smaller title */
.step-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; /* Reduced from 1.5rem */
  color: #000000;
  margin-bottom: 1.2rem; /* Reduced */
  text-align: left;
}

/* Form Styles */
.form-group label {
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem; /* Reduced from 1rem */
  font-weight: 500;
  color: #333;
  margin-bottom: 0.4rem; /* Reduced */
  text-align: left;
  margin-left: .4rem; /* Reduced */
}

.form-group input {
  width: 100%;
  padding: .4rem .7rem; /* Reduced */
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.9rem; /* Reduced from 1rem */
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  margin-bottom: 0.8rem; /* Reduced */
}

.form-group input:focus {
  outline: none;
  border-color: #0966c8;
  box-shadow: 0 0 0 3px rgba(9, 102, 200, 0.1);
}

/* Payment Methods */
.payment-methods {
  margin-bottom: 1.2rem; /* Reduced */
}

.payment-methods h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem; /* Reduced from 1rem */
  font-weight: 400;
  color: #333;
  margin-bottom: 0.5rem; /* Reduced */
  text-align: left;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem; /* Reduced */
}

.payment-option {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 0.8rem; /* Reduced */
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: .75rem; /* Reduced from .8rem */
  display: flex;
  align-items: center;
}

.payment-option:hover {
  border-color: #007A56;
}

.payment-option.selected {
  border-color: #007A56;
  background-color: rgba(0, 122, 86, 0.05);
}

.payment-option input {
  display: none;
}

.payment-content {
  display: flex;
  align-items: center;
  gap: 0.8rem; /* Reduced */
}

.payment-icon {
  font-size: 1.5rem; /* Reduced */
  width: 36px; /* Smaller */
  height: 36px; /* Smaller */
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-5px);
}

.payment-name {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.15rem; /* Reduced */
  font-size: 0.85rem; /* Added size control */
  text-align: left;
}

.payment-desc {
  font-family: 'Noto Sans', sans-serif;
  font-size: .75rem; /* Reduced from .8rem */
  color: #666;
}

/* Booking Summary */
.booking-summary {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.2rem; /* Reduced from 1.5rem */
  margin-bottom: 1.5rem; /* Reduced */
}

.booking-summary h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem; /* Reduced from 1.2rem */
  color: #333;
  margin-bottom: 0.8rem; /* Reduced */
}

.summary-details {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.85rem; /* Added for all summary text */
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem; /* Reduced */
  color: #555;
  font-size: 0.85rem; /* Smaller text */
}

.summary-row span:first-child {
  color: #777;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem; /* Reduced */
  padding-top: 0.8rem; /* Reduced */
  border-top: 2px solid #ddd;
  font-weight: 600;
  font-size: 0.9rem; /* Added size control */
}

.total-amount {
  color: #007A56;
  font-size: 1rem; /* Reduced from 1.2rem */
}

/* Step Buttons */
.step-buttons {
  display: flex;
  gap: 0.8rem; /* Reduced */
  margin-top: 1.5rem; /* Reduced */
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.8rem; /* Reduced from 1rem */
  border: none;
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem; /* Reduced from 1rem */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007A56;
  color: white;
}

.btn-primary:hover {
  background-color: #005F43;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 122, 86, 0.2);
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}




/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 1.2rem; /* Further reduced */
    margin: 0.8rem; /* Reduced */
  }
  
  .step-number {
    width: 3rem; /* Smaller on mobile */
    font-size: 0.75rem;
  }
  
  .step-header h2 {
    font-size: 1.1rem; /* Smaller */
  }
  
  .form-group label {
    font-size: 0.85rem; /* Smaller */
  }
  
  .form-group input {
    padding: 0.4rem 0.6rem; /* Smaller */
    font-size: 0.85rem; /* Smaller */
  }
  
  .payment-option {
    padding: 0.7rem; /* Smaller */
  }
  
  .step-buttons {
    flex-direction: column;
  }
  
  .booking-summary {
    padding: 1rem; /* Smaller */
  }
  
  .summary-row {
    font-size: 0.8rem; /* Smaller */
  }
}
</style>