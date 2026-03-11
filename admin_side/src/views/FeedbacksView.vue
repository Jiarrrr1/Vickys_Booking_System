<template>
  <!-- SINGLE ROOT DIV - wrap everything -->
  <div class="feedbacks-view">
    <section class="section fu">
      <!-- Summary Stat Cards - UNCHANGED -->
      <div class="stats-grid c4 fu1">
        <!-- Total Feedbacks -->
        <StatCard
          :value="totalFeedbacks"
          label="Total Feedbacks"
          color-class="cg"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </template>
        </StatCard>

        <!-- Average Rating -->
        <StatCard
          :value="averageRating + ' '"
          label="Average Rating"
          color-class="ca"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </template>
        </StatCard>

        <!-- Positive Feedbacks -->
        <StatCard
          :value="positiveCount"
          label="Positive (4-5 ⭐)"
          color-class="cg"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </template>
        </StatCard>

        <!-- Negative Feedbacks -->
        <StatCard
          :value="negativeCount"
          label="Negative (1-2 ⭐)"
          color-class="cr"
        >
          <template #icon>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </template>
        </StatCard>
      </div>

      <!-- Feedbacks Table Card -->
      <div class="card fu2">
        <!-- Card Header with Search -->
        <div class="card-head">
          <div>
            <div class="card-title">All Feedbacks</div>
            <div class="card-sub">Guest reviews and ratings</div>
          </div>

          <!-- Search Bar -->
          <div class="fbar">
            <div class="fsearch">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by guest name or comment…"
                @input="handleSearch"
              />
            </div>
          </div>
        </div>

        <!-- Display Limit Info - NEW but minimal -->
        <div v-if="displayedCount >= maxDisplayFeedbacks" class="limit-warning">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
          </svg>
          <span>Maximum {{ maxDisplayFeedbacks }} feedbacks can be displayed reached</span>
        </div>
        <div v-else class="limit-warning note">
            <span>Note!: Maximum {{ maxDisplayFeedbacks }} feedbacks can be displayed</span>
        </div>

        <!-- Table -->
        <div class="twrap">
          <table v-if="!isLoading && filteredFeedbacks.length > 0">
            <thead>
              <tr>
                <th>Feedback ID</th>
                <th>Guest Name</th>
                <th>Rating</th>
                <th>Comment</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Display</th>
                <th>Created At</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="feedback in paginatedFeedbacks" :key="feedback.id">
                <td class="tdm">#{{ String(feedback.id).padStart(4, '0') }}</td>
                <td class="tdn">{{ feedback.from || 'Anonymous' }}</td>
                <td>
                  <div class="rating-cell">
                    <span class="stars">{{ '⭐'.repeat(feedback.rate) }}</span>
                    <span class="rating-num">({{ feedback.rate }}/5)</span>
                  </div>
                </td>
                <td>
                  <span class="comment-text">"{{ feedback.comment || 'No comment provided' }}"</span>
                </td>
                <td style="text-align: center;">
                  <span class="status-badge" :class="getStatusClass(feedback.rate)">
                    {{ getStatusText(feedback.rate) }}
                  </span>
                </td>
                <td style="text-align: center;">
                  <label class="toggle-switch" @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="feedback.isDisplay"
                      @change="toggleDisplay(feedback)"
                      :disabled="!feedback.isDisplay && displayedCount >= maxDisplayFeedbacks"
                    >
                    <span class="toggle-slider" :class="{ disabled: !feedback.isDisplay && displayedCount >= maxDisplayFeedbacks }"></span>
                  </label>
                </td>
                <td><strong>{{ formatDate(feedback.createdAt) }}</strong></td>
                <td style="text-align: center;">
                  <button 
                    class="delete-btn" 
                    @click="deleteFeedback(feedback)"
                    title="Delete Feedback"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Loading State -->
          <div v-if="isLoading" class="empty-state">
            <div class="loading-spinner"></div>
            <p style="margin-top: 16px;">Loading feedbacks...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!isLoading && filteredFeedbacks.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No Feedbacks Found</h3>
            <p v-if="searchQuery">No feedbacks match "{{ searchQuery }}"</p>
            <p v-else>No feedbacks have been submitted yet</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1 && !isLoading">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <!-- Error Modal -->
    <FeedbackModal
      :show="showErrorModal"
      type="error"
      :title="errorTitle"
      :message="errorMessage"
      button-text="OK"
      @close="showErrorModal = false"
      @confirm="showErrorModal = false"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      :title="`Delete Feedback from ${feedbackToDelete?.from || 'Guest'}?`"
      :message="`Are you sure you want to delete this feedback?\n\nThis action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFeedbacksService } from '@/services/feedbackService'
import StatCard from '@/components/StatCard.vue'
import ConfirmationModal from '@/modals/confirmationModal.vue'
import FeedbackModal from '@/modals/FeedbackModal.vue'

const feedbacksService = useFeedbacksService()

// Constants
const maxDisplayFeedbacks = 3

// Local state
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Error modal state
const showErrorModal = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')

// Confirmation modal state
const showConfirmModal = ref(false)
const feedbackToDelete = ref(null)

// Computed properties from service - UNCHANGED
const {
  feedbacks,
  isLoading,
  error,
  filteredFeedbacks,
  totalFeedbacks,
  averageRating,
  positiveCount,
  neutralCount,
  negativeCount,
  displayedCount,
  hiddenCount
} = feedbacksService

// Paginated feedbacks
const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredFeedbacks.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredFeedbacks.value.length / itemsPerPage)
)

// Status helpers based on rating
const getStatusClass = (rating) => {
  if (rating >= 4) return 'status-positive'
  if (rating === 3) return 'status-neutral'
  return 'status-negative'
}

const getStatusText = (rating) => {
  if (rating >= 4) return 'Positive'
  if (rating === 3) return 'Neutral'
  return 'Negative'
}

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

const handleSearch = () => {
  currentPage.value = 1
  feedbacksService.setSearchQuery(searchQuery.value)
}

const toggleDisplay = async (feedback) => {
  const newStatus = !feedback.isDisplay
  
  console.log(`Toggling feedback #${feedback.id} from ${feedback.isDisplay} to ${newStatus}`)

  // Check if trying to enable a new display when already at max
  if (newStatus === true && displayedCount.value >= maxDisplayFeedbacks) {
    showErrorModal.value = true
    errorTitle.value = 'Display Limit Reached'
    errorMessage.value = `Only ${maxDisplayFeedbacks} feedbacks can be displayed at a time. Please uncheck another feedback first.`
    return
  }

  const result = await feedbacksService.toggleFeedbackStatus(
    feedback.id, 
    newStatus
  )
  
  if (result.success) {
    console.log(`✅ Display status toggled for feedback #${feedback.id}`)
    // The service already updates the state
  } else {
    console.error('❌ Failed to toggle display:', result.error)
  }
}

const deleteFeedback = (feedback) => {
  feedbackToDelete.value = feedback
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  if (!feedbackToDelete.value) return
  
  const feedback = feedbackToDelete.value
  console.log(`Deleting feedback #${feedback.id}`)
  
  const result = await feedbacksService.deleteFeedback(feedback.id)
  
  if (result.success) {
    console.log(`✅ Feedback #${feedback.id} deleted successfully`)
    await fetchFeedbacks()
  } else {
    console.error('❌ Failed to delete feedback:', result.error)
  }
  
  feedbackToDelete.value = null
}

const cancelDelete = () => {
  feedbackToDelete.value = null
}

// Watch for search changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})

// Load data on mount
const fetchFeedbacks = async () => {
  const result = await feedbacksService.fetchFeedbacks()
  if (!result.success) {
    console.error('Failed to fetch feedbacks:', result.error)
  }
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.feedbacks-view {
  width: 100%;
  min-height: 100%;
}

.fbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Limit Warning - Minimal, doesn't affect stat cards */
.limit-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-bottom: 16px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  color: #856404;
  font-size: 13px;
}

.limit-warning.note {
  background-color: #7294e249;
  border: 1px solid #7293e277 ;
  color: rgb(49, 49, 221);
}

.limit-warning svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  flex-shrink: 0;
}

/* Rating Cell */
.rating-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #ffc107;
  letter-spacing: 1px;
  font-size: 14px;
}

.rating-num {
  font-size: 13px;
  color: var(--gray);
}

/* Comment Text */
.comment-text {
  display: block;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
  font-style: italic;
  font-size: 14px;
}

/* Status Badge - matching bookings dropdown style */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.status-positive {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.status-neutral {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.status-negative {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
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
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--green);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-slider:hover {
  opacity: 0.9;
}

.toggle-slider.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Delete Button */
.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all var(--tr);
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.delete-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid var(--border);
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: white;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all var(--tr);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.page-btn:hover:not(:disabled) {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: var(--text);
  font-weight: 500;
  font-size: 14px;
}
</style>