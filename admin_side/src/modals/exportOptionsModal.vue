<!-- frontend/src/modals/ExportOptionsModal.vue -->
<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="export-modal" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h2>Export Data</h2>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body">
          <!-- Data Type Selection -->
          <div class="section">
            <h3>Select Data to Export</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="selected.bookings">
                <span>Bookings</span>
                <span class="count-badge">{{ counts.bookings || 0 }}</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="selected.payments">
                <span>Payments</span>
                <span class="count-badge">{{ counts.payments || 0 }}</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="selected.feedbacks">
                <span>Feedbacks</span>
                <span class="count-badge">{{ counts.feedbacks || 0 }}</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="selected.deleted">
                <span>Deleted Items</span>
                <span class="count-badge">{{ counts.deleted || 0 }}</span>
              </label>
              
              <label class="checkbox-label highlight">
                <input type="checkbox" v-model="selected.revenue">
                <span>Revenue Report</span>
                <span class="badge">Summary</span>
              </label>
            </div>
          </div>

          <!-- Format Selection -->
          <div class="section">
            <h3>Export Format</h3>
            <div class="radio-group">
              <label class="radio-label" :class="{ active: format === 'excel' }">
                <input type="radio" v-model="format" value="excel">
                <span class="radio-title">Excel (.xlsx)</span>
                <span class="radio-desc">Best for data analysis</span>
              </label>
              
              <label class="radio-label" :class="{ active: format === 'pdf' }">
                <input type="radio" v-model="format" value="pdf">
                <span class="radio-title">PDF (.pdf)</span>
                <span class="radio-desc">Best for printing</span>
              </label>
              
              <label class="radio-label" :class="{ active: format === 'both' }">
                <input type="radio" v-model="format" value="both">
                <span class="radio-title">Both Formats</span>
                <span class="radio-desc">Export as Excel and PDF</span>
              </label>
            </div>
          </div>

          <!-- Summary -->
          <div class="summary-section" v-if="hasSelection">
            <div class="summary-icon">📊</div>
            <div class="summary-text">
              <strong>{{ selectedCount }} data type(s)</strong> will be exported 
              <strong>{{ format === 'both' ? 'as Excel and PDF' : 'as ' + format }}</strong>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button 
            class="export-btn" 
            @click="handleExport"
            :disabled="!hasSelection || isLoading"
          >
            <span v-if="!isLoading">Export Data</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  counts: {
    type: Object,
    default: () => ({
      bookings: 0,
      payments: 0,
      feedbacks: 0,
      deleted: 0
    })
  }
})

const emit = defineEmits(['close', 'export'])

const selected = ref({
  bookings: false,
  payments: false,
  feedbacks: false,
  deleted: false,
  revenue: false
})

const format = ref('excel')
const dateRange = ref({
  from: '',
  to: ''
})
const isLoading = ref(false)

const hasSelection = computed(() => {
  return Object.values(selected.value).some(v => v === true)
})

const selectedCount = computed(() => {
  return Object.values(selected.value).filter(v => v === true).length
})

const handleOverlayClick = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

const handleExport = async () => {
  isLoading.value = true
  
  const options = {
    types: Object.entries(selected.value)
      .filter(([_, value]) => value)
      .map(([key]) => key),
    format: format.value,
    dateRange: dateRange.value.from && dateRange.value.to ? dateRange.value : null
  }
  
  await emit('export', options)
  isLoading.value = false
}

// Reset when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    selected.value = {
      bookings: false,
      payments: false,
      feedbacks: false,
      deleted: false,
      revenue: false
    }
    format.value = 'excel'
    dateRange.value = { from: '', to: '' }
    isLoading.value = false
  }
})
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

.export-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 550px;
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
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 10;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-header h2 {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.section {
  margin-bottom: 28px;
}

.section h3 {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-label span {
  flex: 1;
  font-size: 14px;
  color: #1f2937;
}

.count-badge {
  background: #e5e7eb;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
}

.badge {
  background: #fbbf24;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #000;
}

.highlight {
  border-left: 4px solid #fbbf24;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-label.active {
  border-color: #667eea;
  background: #f5f3ff;
}

.radio-label input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.radio-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.radio-desc {
  font-size: 12px;
  color: #6b7280;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-input {
  display: flex;
  flex-direction: column;
}

.date-input label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.date-input input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0 0;
}

.summary-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.summary-icon {
  font-size: 24px;
}

.summary-text {
  font-size: 14px;
  color: #0369a1;
}

.summary-text strong {
  font-weight: 600;
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
  border-radius: 0 0 16px 16px;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.export-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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