<template>
  <div class="feedbacks-view">
    <section class="section fu">
      <!-- Header with Stats -->
      <div class="feedbacks-header">
        <h2 class="section-title">Guest Feedbacks Management</h2>
        
        <div class="stats-row">
          <div class="stat-badge">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ feedbacksService.feedbacks.length }}</span>
          </div>
          <div class="stat-badge">
            <span class="stat-label">Showing:</span>
            <span class="stat-value approved">{{ approvedCount }}</span>
          </div>
          <div class="stat-badge">
            <span class="stat-label">Hidden:</span>
            <span class="stat-value hidden">{{ pendingCount }}</span>
          </div>
          <div class="stat-badge">
            <span class="stat-label">Avg Rating:</span>
            <span class="stat-value rating">{{ averageRating }} ⭐</span>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" fill="none"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by guest name or feedback..."
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="feedbacksService.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading feedbacks...</p>
      </div>

      <!-- Feedbacks Table -->
      <div v-else class="feedbacks-table-container">
        <table class="feedbacks-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Date</th>
              <th>Status</th>
              <th>Show on Site</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="filteredFeedbacks.length > 0">
              <tr v-for="feedback in filteredFeedbacks" :key="feedback.id">
                <td class="guest-name">
                  <strong>{{ feedback.guest }}</strong>
                  <span class="status-tag" :class="feedback.status">
                    {{ feedback.status }}
                  </span>
                </td>
                <td class="rating">
                  <span class="stars">
                    {{ '⭐'.repeat(feedback.rating) }}{{ '☆'.repeat(5 - feedback.rating) }}
                  </span>
                  <span class="rating-number">({{ feedback.rating }})</span>
                </td>
                <td class="feedback-text">"{{ feedback.comment }}"</td>
                <td class="date">{{ formatDate(feedback.date) }}</td>
                <td>
                  <span class="visibility-badge" :class="{ visible: feedback.showOnClient, hidden: !feedback.showOnClient }">
                    {{ feedback.showOnClient ? 'Visible' : 'Hidden' }}
                  </span>
                </td>
                <td class="toggle-cell">
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      :checked="feedback.showOnClient"
                      @change="toggleStatus(feedback)"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </td>
                <td class="actions">
                  <button 
                    class="action-btn delete" 
                    @click="confirmDelete(feedback)"
                    title="Delete feedback"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M3 6h18" stroke="currentColor" stroke-width="2"/>
                      <path d="M8 6v14" stroke="currentColor" stroke-width="2"/>
                      <path d="M16 6v14" stroke="currentColor" stroke-width="2"/>
                      <path d="M10 3h4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="7" class="no-feedbacks">
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" fill="none"/>
                    <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <h3>No feedbacks available</h3>
                  <p>Feedbacks from guests will appear here.</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <h3>Delete Feedback</h3>
        <p>Are you sure you want to delete this feedback from <strong>{{ deletingFeedback?.guest }}</strong>?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeDeleteModal">Cancel</button>
          <button class="btn-danger" @click="deleteFeedback">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFeedbacksService } from '@/services/feedbackService'

const feedbacksService = useFeedbacksService()

// Local state
const searchQuery = ref('')
const showDeleteModal = ref(false)
const deletingFeedback = ref(null)

// Computed
const filteredFeedbacks = computed(() => {
  if (!searchQuery.value) return feedbacksService.feedbacks.value
  
  const query = searchQuery.value.toLowerCase()
  return feedbacksService.feedbacks.value.filter(fb => 
    fb.guest?.toLowerCase().includes(query) ||
    fb.comment?.toLowerCase().includes(query)
  )
})

const approvedCount = computed(() => 
  feedbacksService.feedbacks.value.filter(fb => fb.showOnClient).length
)

const pendingCount = computed(() => 
  feedbacksService.feedbacks.value.filter(fb => !fb.showOnClient).length
)

const averageRating = computed(() => {
  const feedbacks = feedbacksService.feedbacks.value
  if (feedbacks.length === 0) return 0
  const sum = feedbacks.reduce((acc, fb) => acc + fb.rating, 0)
  return (sum / feedbacks.length).toFixed(1)
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSearch = () => {
  feedbacksService.setSearchQuery(searchQuery.value)
}

const toggleStatus = async (feedback) => {
  const result = await feedbacksService.toggleFeedbackStatus(
    feedback.id, 
    feedback.showOnClient
  )
  
  if (result.success) {
    console.log(`Feedback ${feedback.showOnClient ? 'hidden' : 'shown'} successfully`)
  }
}

const confirmDelete = (feedback) => {
  deletingFeedback.value = feedback
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingFeedback.value = null
}

const deleteFeedback = async () => {
  if (!deletingFeedback.value) return
  
  const result = await feedbacksService.deleteFeedback(deletingFeedback.value.id)
  
  if (result.success) {
    console.log('Feedback deleted successfully')
    closeDeleteModal()
  }
}

// Load data on mount
onMounted(async () => {
  await feedbacksService.fetchFeedbacks()
})
</script>

<style scoped>
.feedbacks-view {
  width: 100%;
  min-height: 100%;
  padding: 24px;
}

.feedbacks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--t1);
  margin: 0;
}

.stats-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--sand);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.stat-label {
  color: var(--t3);
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: var(--t1);
}

.stat-value.approved {
  color: #28a745;
}

.stat-value.hidden {
  color: #dc3545;
}

.stat-value.rating {
  color: #ffc107;
}

.search-bar {
  margin-bottom: 24px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  max-width: 400px;
}

.search-input-wrapper svg {
  stroke: var(--t3);
}

.search-input-wrapper input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.feedbacks-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: var(--sh-sm);
  overflow: auto;
}

.feedbacks-table {
  width: 100%;
  border-collapse: collapse;
}

.feedbacks-table th {
  text-align: left;
  padding: 16px;
  background: #f8f9fa;
  color: var(--t2);
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}

.feedbacks-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.guest-name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-tag.positive {
  background: #d4edda;
  color: #155724;
}

.status-tag.neutral {
  background: #fff3cd;
  color: #856404;
}

.status-tag.negative {
  background: #f8d7da;
  color: #721c24;
}

.rating {
  white-space: nowrap;
}

.stars {
  color: #ffc107;
  margin-right: 4px;
  letter-spacing: 2px;
}

.rating-number {
  color: var(--t3);
  font-size: 12px;
}

.feedback-text {
  max-width: 300px;
  color: var(--t1);
  line-height: 1.5;
  font-style: italic;
}

.date {
  color: var(--t3);
  font-size: 13px;
  white-space: nowrap;
}

.visibility-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.visibility-badge.visible {
  background: #d4edda;
  color: #155724;
}

.visibility-badge.hidden {
  background: #f8d7da;
  color: #721c24;
}

.toggle-cell {
  text-align: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #28a745;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.delete {
  color: #dc3545;
}

.action-btn.delete:hover {
  background: #dc3545;
  color: white;
}

.no-feedbacks {
  text-align: center;
  padding: 60px 20px !important;
  color: var(--t3);
}

.no-feedbacks svg {
  stroke: var(--t3);
  margin-bottom: 16px;
}

.no-feedbacks h3 {
  margin: 8px 0;
  color: var(--t1);
}

.no-feedbacks p {
  font-size: 14px;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: var(--t3);
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid var(--sand);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal Styles */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 12px;
  color: var(--t1);
}

.modal-content p {
  margin: 8px 0;
  color: var(--t2);
  line-height: 1.5;
}

.modal-content .warning {
  color: #dc3545;
  font-weight: 500;
  margin: 16px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  padding: 8px 16px;
  background: var(--sand);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c82333;
}
</style>