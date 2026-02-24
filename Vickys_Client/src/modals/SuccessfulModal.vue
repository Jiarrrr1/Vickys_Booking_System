<template>
  <!-- Modal Backdrop -->
  <div v-if="isVisible" 
       class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
       @click.self="closeModal">
    
    <!-- Modal Container -->
    <div class="relative bg-white rounded-2xl shadow-2xl p-8 w-11/12 max-w-md mx-4 transform transition-all duration-300 scale-100"
         :class="{ 'scale-95': !isVisible }">
      
      <!-- Close Button -->
      <button @click="closeModal" 
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Success Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <!-- Success Message -->
      <div class="text-center">
        <h3 class="text-2xl font-playfair-display font-bold text-gray-800 mb-3">
          Reservation Submitted!
        </h3>
        <p class="text-gray-600 mb-2">
          Thank you for your booking request.
        </p>
        <p class="text-gray-600 mb-6">
          Please wait for our confirmation email.
        </p>
        
        <!-- Animated Loading Dots -->
        <div class="flex justify-center items-center space-x-1 mb-6">
          <span class="text-gray-500">Processing</span>
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
        
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="closeModal" 
                  class="flex-1 py-3 px-4 bg-green-600 text-white font-montserrat font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300">
            Done
          </button>
          <button @click="viewDetails" 
                  class="flex-1 py-3 px-4 border-2 border-green-600 text-green-600 font-montserrat font-semibold rounded-lg hover:bg-green-50 transition-colors duration-300">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingSuccessModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    bookingDetails: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      confirmationCode: this.generateConfirmationCode()
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    viewDetails() {
      this.$emit('view-details', this.bookingDetails)
    },
   
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden'
      } else {
        // Restore scrolling
        document.body.style.overflow = 'auto'
      }
    }
  }
}
</script>

<style scoped>
/* Custom animation for the checkmark */
@keyframes checkmark {
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* Apply animation to the check icon */
svg path {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  animation: checkmark 0.5s ease-in-out forwards;
  animation-delay: 0.2s;
}
</style>