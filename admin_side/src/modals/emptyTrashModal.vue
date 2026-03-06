<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="empty-trash-modal" @click.stop>
        <!-- Icon -->
        <div class="modal-icon icon-warning">
          <svg viewBox="0 0 24 24" width="32" height="32">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </div>

        <!-- Title -->
        <h3 class="modal-title">Empty Trash Options</h3>

        <!-- Message -->
        <p class="modal-subtitle">Choose how you want to empty the trash</p>

        <!-- Options -->
        <div class="options-container">
          <!-- Option 1: Delete All -->
          <label class="option-card" :class="{ active: selectedOption === 'all' }">
            <input 
              type="radio" 
              v-model="selectedOption" 
              value="all"
              class="option-radio"
            >
            <div class="option-content">
              <div class="option-header">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                </svg>
                <span class="option-title">Delete All Items</span>
              </div>
              <p class="option-desc">
                Permanently delete every item in trash, regardless of age
              </p>
            </div>
          </label>

          <!-- Option 2: Delete by Age -->
          <label class="option-card" :class="{ active: selectedOption === 'older-than' }">
            <input 
              type="radio" 
              v-model="selectedOption" 
              value="older-than"
              class="option-radio"
            >
            <div class="option-content">
              <div class="option-header">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="option-title">Delete by Age</span>
              </div>
              <p class="option-desc">
                Delete items older than specified days
              </p>
              <div v-if="selectedOption === 'older-than'" class="age-input-group">
                <input 
                  type="number" 
                  v-model.number="days" 
                  min="1" 
                  max="365"
                  class="age-input"
                >
                <span class="age-label">days old</span>
              </div>
            </div>
          </label>

          <!-- Option 3: Delete by Type -->
          <label class="option-card" :class="{ active: selectedOption === 'by-type' }">
            <input 
              type="radio" 
              v-model="selectedOption" 
              value="by-type"
              class="option-radio"
            >
            <div class="option-content">
              <div class="option-header">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <span class="option-title">Delete by Type</span>
              </div>
              <p class="option-desc">
                Choose which item types to delete
              </p>
              <div v-if="selectedOption === 'by-type'" class="type-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="types.feedback">
                  <span>Feedbacks</span>
                  <span class="count-badge">({{ feedbackCount }})</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="types.booking">
                  <span>Bookings</span>
                  <span class="count-badge">({{ bookingCount }})</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="types.payment">
                  <span>Payments</span>
                  <span class="count-badge">({{ paymentCount }})</span>
                </label>
              </div>
            </div>
          </label>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button 
            class="modal-btn cancel-btn" 
            @click="handleCancel"
          >
            Cancel
          </button>
          <button 
            class="modal-btn confirm-btn" 
            :disabled="!isValid"
            @click="handleConfirm"
          >
            Empty Trash
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  feedbackCount: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  paymentCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const selectedOption = ref('all')
const days = ref(30)
const types = ref({
  feedback: true,
  booking: true,
  payment: true
})

const isValid = computed(() => {
  if (selectedOption.value === 'by-type') {
    return types.value.feedback || types.value.booking || types.value.payment
  }
  return true
})

const handleConfirm = () => {
  if (!isValid.value) return
  
  const options = {
    option: selectedOption.value,
    days: days.value,
    types: types.value
  }
  
  emit('confirm', options)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleOverlayClick = () => {
  handleCancel()
}
</script>

<style scoped>
/* Modal Overlay */
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
}

/* Modal Container */
.empty-trash-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
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

/* Icon */
.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-warning {
  background: #fef3c7;
  color: #f59e0b;
}

.modal-icon svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Title & Subtitle */
.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  text-align: center;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  text-align: center;
}

/* Options Container */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

/* Option Card */
.option-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.option-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.option-card.active {
  border-color: #f59e0b;
  background: #fffbeb;
}

.option-radio {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-header svg {
  stroke: #6b7280;
  fill: none;
  stroke-width: 2;
  flex-shrink: 0;
}

.option-card.active .option-header svg {
  stroke: #f59e0b;
}

.option-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.option-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Age Input */
.age-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.age-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.age-input:focus {
  outline: none;
  border-color: #f59e0b;
}

.age-label {
  color: #6b7280;
  font-size: 14px;
}

/* Type Checkboxes */
.type-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #f9fafb;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #f59e0b;
}

.count-badge {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: #dc2626;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .empty-trash-modal,
.modal-fade-leave-active .empty-trash-modal {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .empty-trash-modal,
.modal-fade-leave-to .empty-trash-modal {
  transform: scale(0.95);
}
</style>