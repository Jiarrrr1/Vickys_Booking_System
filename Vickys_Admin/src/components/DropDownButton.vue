<template>
  <div class="relative">
    <!-- Dropdown button -->
    <button
      @click.stop="toggleDropdown"
      class="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
    >
      <span>Actions</span>
      <svg 
        class="w-4 h-4 transition-transform" 
        :class="{ 'rotate-180': isOpen }" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-10"
      @click.stop
    >
      <div class="py-1">
        <!-- Confirm Booking -->
        <button
          @click="handleAction('confirm')"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentStatus === 'Confirmed'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Confirm Booking</span>
          <span v-if="currentStatus === 'Confirmed'" class="ml-auto text-xs text-green-600">✓</span>
        </button>

        <!-- Mark as Pending -->
        <button
          @click="handleAction('pending')"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentStatus === 'Pending'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Mark as Pending</span>
          <span v-if="currentStatus === 'Pending'" class="ml-auto text-xs text-amber-600">✓</span>
        </button>

        <!-- Cancel Booking -->
        <button
          @click="handleAction('cancel')"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="currentStatus === 'Cancelled'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Cancel Booking</span>
          <span v-if="currentStatus === 'Cancelled'" class="ml-auto text-xs text-red-600">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentStatus: {
    type: String,
    default: 'Pending'
  },
  bookingId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['status-change'])

const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleAction = (action) => {
  let newStatus = ''
  
  switch (action) {
    case 'confirm':
      newStatus = 'Confirmed'
      break
    case 'pending':
      newStatus = 'Pending'
      break
    case 'cancel':
      newStatus = 'Cancelled'
      break
  }
  
  emit('status-change', {
    bookingId: props.bookingId,
    newStatus: newStatus
  })
  
  isOpen.value = false
}

const closeDropdown = (event) => {
  if (!event.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>