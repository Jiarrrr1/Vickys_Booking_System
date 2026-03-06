<!-- src/modals/confirmationModal.vue -->
<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="confirmation-modal" :class="type" @click.stop>
        <!-- Icon based on type -->
        <div class="modal-icon" :class="type">
          <svg v-if="type === 'danger'" viewBox="0 0 24 24" width="32" height="32">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" />
          </svg>
          <svg v-else-if="type === 'info'" viewBox="0 0 24 24" width="32" height="32">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="16" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="32" height="32">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </div>

        <!-- Title -->
        <h3 class="modal-title">{{ title }}</h3>
        
        <!-- Message -->
        <p class="modal-message">{{ message }}</p>

        <!-- Password Input (shown only when requiresPassword is true) -->
        <div v-if="requiresPassword" class="password-section">
          <label for="confirmPassword">Enter your password to confirm:</label>
          <input
            id="confirmPassword"
            v-model="password"
            type="password"
            class="password-input"
            placeholder="Your password"
            autofocus
          />
          <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="cancel-btn" @click="handleCancel">Cancel</button>
          <button 
            class="confirm-btn" 
            :class="type"
            @click="handleConfirm"
            :disabled="(requiresPassword && !password) || isConfirming"
          >
            <span v-if="!isConfirming">{{ confirmText }}</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  type: {
    type: String,
    default: 'info' // 'info', 'danger', 'warning'
  },
  requiresPassword: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const password = ref('')
const passwordError = ref('')
const isConfirming = ref(false)

const handleOverlayClick = () => {
  emit('close')
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
  emit('close')
}

const handleConfirm = async () => {
  if (props.requiresPassword && !password.value) {
    passwordError.value = 'Password is required'
    return
  }

  isConfirming.value = true
  passwordError.value = ''

  try {
    if (props.requiresPassword) {
      await emit('confirm', password.value)
    } else {
      await emit('confirm')
    }
    resetForm()
  } catch (error) {
    passwordError.value = error.message || 'Verification failed'
  } finally {
    isConfirming.value = false
  }
}

const resetForm = () => {
  password.value = ''
  passwordError.value = ''
  isConfirming.value = false
}
</script>

<style scoped>
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
  z-index: 10000;
  padding: 20px;
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
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

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.modal-icon.info {
  background: #dbeafe;
  color: #2563eb;
}

.modal-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.modal-icon svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin: 0 0 12px 0;
}

.modal-message {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* Password Section */
.password-section {
  margin-bottom: 24px;
}

.password-section label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.password-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.password-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 100px;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  color: white;
}

.confirm-btn.danger {
  background: #dc2626;
}

.confirm-btn.danger:hover:not(:disabled) {
  background: #b91c1c;
}

.confirm-btn.info {
  background: #2563eb;
}

.confirm-btn.info:hover:not(:disabled) {
  background: #1d4ed8;
}

.confirm-btn.warning {
  background: #d97706;
}

.confirm-btn.warning:hover:not(:disabled) {
  background: #b45309;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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