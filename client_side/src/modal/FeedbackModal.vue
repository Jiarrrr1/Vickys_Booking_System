<!-- src/components/FeedbackModal/FeedbackModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="feedback-overlay" @click="handleOverlayClick">
      <div class="feedback-modal" @click.stop>
        <!-- Modal header with gold accents -->
        <div class="modal-header">
          <div class="modal-header-left">
            <div class="section-label">
              <span>SHARE YOUR EXPERIENCE</span>
            </div>
            <h2 class="modal-title">Send Us Your <em>Feedback</em></h2>
          </div>
          <button @click="closeModal" class="modal-close" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <!-- Modal body with form -->
        <div class="modal-body">
          <div class="ph-bg-text" aria-hidden="true">FEEDBACK</div>
          
          <form @submit.prevent="handleSubmit">
            <!-- Sender Name Field -->
            <div class="form-group">
              <label for="senderName" class="form-label">
                <span class="label-icon">✦</span>
                YOUR NAME
              </label>
              <input
                type="text"
                id="senderName"
                v-model="formData.senderName"
                placeholder="e.g., Juan Dela Cruz"
                required
                class="form-input"
              />
              <div class="input-ornament" aria-hidden="true"></div>
            </div>

            <!-- Feedback Message Field -->
            <div class="form-group">
              <label for="message" class="form-label">
                <span class="label-icon">✦</span>
                YOUR MESSAGE
              </label>
              <textarea
                id="message"
                v-model="formData.message"
                placeholder="Tell us about your experience at Vicky's Resort..."
                rows="5"
                required
                class="form-textarea"
              ></textarea>
              <div class="input-ornament" aria-hidden="true"></div>
            </div>

            <!-- Optional Rating Field (Adds a nice touch) -->
            <div class="form-group rating-group">
              <label class="form-label">
                <span class="label-icon">✦</span>
                HOW WAS YOUR STAY?
              </label>
              <div class="rating-options">
                <button 
                  type="button"
                  v-for="star in 5" 
                  :key="star"
                  @click="formData.rating = star"
                  class="rating-star"
                  :class="{ active: star <= formData.rating }"
                  :aria-label="`Rate ${star} out of 5 stars`"
                >
                  ★
                </button>
              </div>
            </div>

            <!-- Form actions with resort-style buttons -->
            <div class="form-actions">
              <button 
                type="button" 
                @click="closeModal" 
                class="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-primary"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">Submit Feedback</span>
                <span v-else class="loading-dots">Submitting</span>
                <span class="btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Decorative footer ornament -->
        <div class="modal-footer-ornament">
          <div class="ornament-rule">
            <span>✦ ✦ ✦</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const isSubmitting = ref(false)
const formData = reactive({
  senderName: '',
  message: '',
  rating: 0
})

// Lock body scroll when modal is open
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
    resetForm()
  }
})

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

const resetForm = () => {
  formData.senderName = ''
  formData.message = ''
  formData.rating = 0
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const feedbackData = {
      name: formData.senderName,
      message: formData.message,
      rating: formData.rating,
      timestamp: new Date().toISOString()
    }
    
    await emit('submit', feedbackData)
    closeModal()
    
  } catch (error) {
    console.error('Error submitting feedback:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Modal Overlay */
.feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
  animation: fadeIn 0.4s ease;
}

/* Modal Container */
.feedback-modal {
  background: var(--charcoal);
  color: var(--white);
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
  position: relative;
  margin: auto;
  border: 1px solid var(--charcoal-border);
  animation: slideUp 0.5s cubic-bezier(0.77, 0, 0.175, 1);
}

/* Modal Header */
.modal-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1e1e1e 100%);
  padding: 40px 40px 30px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--charcoal-border);
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 40px;
  right: 40px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--gold), transparent);
}

.modal-header-left {
  flex: 1;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-label::before {
  content: '';
  width: 30px;
  height: 1px;
  background: var(--gold);
}

.section-label span {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
}

.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--white);
}

.modal-title em {
  font-style: italic;
  color: var(--gold-light);
}

/* Close Button */
.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--charcoal-border);
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--charcoal);
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
  padding: 40px;
  position: relative;
  background: var(--charcoal-mid);
}

.ph-bg-text {
  position: absolute;
  top: 50%;
  right: -30px;
  transform: translateY(-50%);
  font-family: 'Playfair Display', serif;
  font-size: 120px;
  font-weight: 700;
  color: rgba(201, 169, 110, 0.03);
  line-height: 1;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1;
}

/* Form Groups */
.form-group {
  margin-bottom: 28px;
  position: relative;
  z-index: 2;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 600;
  margin-bottom: 12px;
}

.label-icon {
  font-size: 12px;
  color: var(--gold);
}

/* Form Inputs */
.form-input,
.form-textarea {
  width: 100%;
  background: var(--charcoal);
  border: 1.5px solid var(--charcoal-border);
  border-radius: 4px;
  padding: 16px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--white);
  transition: all 0.3s;
  position: relative;
  z-index: 2;
}

.form-input:hover,
.form-textarea:hover {
  border-color: rgba(201, 169, 110, 0.3);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
  font-size: 14px;
  font-style: italic;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Input Ornament */
.input-ornament {
  position: relative;
  height: 2px;
  margin-top: 8px;
}

.input-ornament::before {
  content: '';
  position: absolute;
  left: 0;
  width: 30px;
  height: 1px;
  background: var(--gold);
  opacity: 0.5;
}

/* Rating Stars */
.rating-group {
  margin-bottom: 40px;
}

.rating-options {
  display: flex;
  gap: 8px;
  background: var(--charcoal);
  border: 1.5px solid var(--charcoal-border);
  border-radius: 4px;
  padding: 16px 20px;
}

.rating-star {
  background: none;
  border: none;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 4px;
}

.rating-star:hover {
  color: var(--gold-light);
  transform: scale(1.1);
}

.rating-star.active {
  color: var(--gold);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  z-index: 2;
  position: relative;
}

/* Button Styles (matching your resort) */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: var(--gold);
  color: var(--charcoal);
  padding: 16px 36px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-radius: 2px;
  border: 2px solid var(--gold);
  transition: all 0.3s;
  cursor: pointer;
  min-width: 180px;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: transparent;
  color: var(--gold);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--white);
  padding: 16px 36px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-radius: 2px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--white);
  background: rgba(255, 255, 255, 0.05);
}

.btn-arrow {
  font-size: 18px;
  transition: transform 0.3s;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(6px);
}

/* Loading Animation */
.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.loading-dots::after {
  content: '...';
  animation: dots 1.5s steps(4, end) infinite;
  width: 20px;
  text-align: left;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

/* Footer Ornament */
.modal-footer-ornament {
  background: var(--charcoal);
  padding: 24px 40px 32px;
  border-top: 1px solid var(--charcoal-border);
}

.ornament-rule {
  display: flex;
  align-items: center;
  gap: 20px;
}

.ornament-rule::before,
.ornament-rule::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--charcoal-border));
}

.ornament-rule::after {
  background: linear-gradient(to left, transparent, var(--charcoal-border));
}

.ornament-rule span {
  color: var(--gold);
  font-size: 14px;
  letter-spacing: 6px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-header {
    padding: 30px 24px 20px;
  }

  .modal-body {
    padding: 30px 24px;
  }

  .modal-title {
    font-size: 26px;
  }

  .ph-bg-text {
    font-size: 80px;
    right: -20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .modal-footer-ornament {
    padding: 20px 24px 24px;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 24px 20px 16px;
  }

  .modal-body {
    padding: 24px 20px;
  }

  .modal-title {
    font-size: 22px;
  }

  .section-label span {
    font-size: 9px;
    letter-spacing: 3px;
  }

  .rating-options {
    padding: 12px 16px;
  }

  .rating-star {
    font-size: 20px;
  }

  .form-input,
  .form-textarea {
    padding: 14px 16px;
    font-size: 14px;
  }
}
</style>