<template>
  <div class="trash-view">
    <section class="section fu">
      <!-- Header -->
      <div class="page-header fu1">
        <div>
          <h1>🗑️ Trash</h1>
          <p>Deleted items are kept for 30 days before being permanently removed</p>
        </div>
        <button class="empty-trash-btn" @click="openEmptyOptions">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Empty Trash
        </button>
      </div>
      
      <!-- Filter Tabs -->
      <div class="filter-tabs fu1">
        <button 
          class="tab-btn" 
          :class="{ active: filterType === '' }"
          @click="setFilter('')"
        >
          All ({{ deletedItems.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: filterType === 'feedback' }"
          @click="setFilter('feedback')"
        >
          Feedbacks ({{ feedbackCount }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: filterType === 'booking' }"
          @click="setFilter('booking')"
        >
          Bookings ({{ bookingCount }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: filterType === 'payment' }"
          @click="setFilter('payment')"
        >
          Payments ({{ paymentCount }})
        </button>
      </div>
      
      <!-- Deleted Items Table -->
      <div class="card fu2">
        <div class="twrap">
          <table v-if="!isLoading && filteredItems.length > 0">
            <thead>
              <tr>
                <th>Type</th>
                <th>Original ID</th>
                <th>Details</th>
                <th>Deleted By</th>
                <th>Deleted At</th>
                <th>Expiration</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredItems" :key="item._id">
                <td>
                  <span class="type-badge" :class="`type-${item.itemType}`">
                    {{ capitalize(item.itemType) }}
                  </span>
                </td>
                <td class="tdm">#{{ item.originalId }}</td>
                <td>
                  <div v-if="item.itemType === 'feedback'" class="details-cell">
                    <strong>{{ item.originalData?.from || 'Anonymous' }}</strong>
                    <br>
                    <span class="detail-text">"{{ truncate(item.originalData?.comment, 50) }}"</span>
                  </div>
                  <div v-else-if="item.itemType === 'booking'" class="details-cell">
                    <strong>{{ item.originalData?.fullName || item.originalData?.guest }}</strong>
                    <br>
                    <span class="detail-text">{{ item.originalData?.roomName || item.originalData?.room }}</span>
                  </div>
                  <div v-else-if="item.itemType === 'payment'" class="details-cell">
                    <strong>{{ item.originalData?.guestName || item.originalData?.guest }}</strong>
                    <br>
                    <span class="detail-text">₱{{ formatNumber(item.originalData?.amount) }}</span>
                  </div>
                  <div v-else>
                    <span class="detail-text">{{ item.originalId }}</span>
                  </div>
                </td>
                <td>{{ item.deletedBy || 'System' }}</td>
                <td>{{ formatDate(item.deletedAt) }}</td>
                <td :class="{ 'expired': getExpirationStatus(item) === 'expired', 'expiring-soon': getExpirationStatus(item) === 'soon' }">
                  {{ daysUntilExpiration(item) }} days left
                </td>
                <td style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                  <button class="action-btn restore-btn" @click="handleRestore(item)">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 21v-5h5"/>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" @click="handlePermanentDelete(item)">
                    <svg viewBox="0 0 24 24" width="14" height="14">
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
            <p style="margin-top: 16px;">Loading deleted items...</p>
          </div>
          
          <!-- Empty State -->
          <div v-if="!isLoading && filteredItems.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <h3>Trash is Empty</h3>
            <p v-if="filterType">No deleted {{ filterType }}s found</p>
            <p v-else>No deleted items found</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Confirmation Modals -->
    <ConfirmationModal
      :show="showRestoreModal"
      :title="`Restore ${capitalize(selectedItem?.itemType || 'Item')}?`"
      :message="`This will restore the ${selectedItem?.itemType} back to its original location.`"
      confirm-text="Restore"
      type="info"
      @confirm="confirmRestore"
      @close="showRestoreModal = false"
    />
    
    <ConfirmationModal
      :show="showDeleteModal"
      :title="`Delete ${capitalize(selectedItem?.itemType || 'Item')} Permanently?`"
      :message="`This action cannot be undone. The ${selectedItem?.itemType} will be permanently deleted.`"
      confirm-text="Delete Forever"
      type="danger"
      @confirm="confirmPermanentDelete"
      @close="showDeleteModal = false"
    />
    
    <!-- ✅ NEW: Empty Trash Options Modal -->
    <EmptyTrashOptionsModal
      :show="showEmptyOptionsModal"
      :feedbackCount="feedbackCount"
      :bookingCount="bookingCount"
      :paymentCount="paymentCount"
      @confirm="confirmEmptyWithOptions"
      @close="showEmptyOptionsModal = false"
    />

    <!-- Simple Feedback Modal (replaces alerts) -->
    <div v-if="showFeedbackModal" class="feedback-modal-overlay" @click="showFeedbackModal = false">
      <div class="feedback-modal" @click.stop>
        <div class="feedback-icon" :class="feedbackType">
          <span v-if="feedbackType === 'success'">✓</span>
          <span v-else-if="feedbackType === 'error'">✗</span>
          <span v-else>!</span>
        </div>
        <h3 class="feedback-title">{{ feedbackTitle }}</h3>
        <p class="feedback-message">{{ feedbackMessage }}</p>
        <button class="feedback-btn" @click="showFeedbackModal = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDeletedItemsService } from '@/services/deletedItemsService'
import ConfirmationModal from '@/modals/confirmationModal.vue'
import EmptyTrashOptionsModal from '@/modals/emptyTrashModal.vue'  // ✅ NEW IMPORT

const deletedItemsService = useDeletedItemsService()

const {
  deletedItems,
  isLoading,
  filteredItems,
  feedbackCount,
  bookingCount,
  paymentCount
} = deletedItemsService

const filterType = ref('')
const showRestoreModal = ref(false)
const showDeleteModal = ref(false)
const showEmptyOptionsModal = ref(false)  // ✅ NEW: Replaced showEmptyModal
const selectedItem = ref(null)

// Feedback modal state
const showFeedbackModal = ref(false)
const feedbackType = ref('success') // 'success', 'error', 'info'
const feedbackTitle = ref('')
const feedbackMessage = ref('')

// Set filter
const setFilter = (type) => {
  filterType.value = type
  deletedItemsService.setFilterType(type)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format number
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return num.toLocaleString('en-PH')
}

// Capitalize
const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Truncate text
const truncate = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const daysUntilExpiration = (item) => {
  if (!item.expiresAt) return 'N/A'
  
  const expiresAt = new Date(item.expiresAt)
  const now = new Date()
  
  const diffTime = expiresAt - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  return diffDays
}

const getExpirationStatus = (item) => {
  const days = daysUntilExpiration(item)
  if (days === 'Expired' || days < 0) return 'expired'
  if (days <= 7) return 'soon'
  return 'normal'
}

// Show feedback modal
const showFeedback = (type, title, message) => {
  feedbackType.value = type
  feedbackTitle.value = title
  feedbackMessage.value = message
  showFeedbackModal.value = true
}

// Handle restore
const handleRestore = (item) => {
  selectedItem.value = item
  showRestoreModal.value = true
}

// Confirm restore
const confirmRestore = async () => {
  if (!selectedItem.value) return
  
  const result = await deletedItemsService.restoreItem(selectedItem.value._id)
  
  if (result.success) {
    showFeedback('success', 'Restored!', `Item has been restored successfully.`)
  } else {
    showFeedback('error', 'Restore Failed', result.error || 'Failed to restore item')
  }
  
  selectedItem.value = null
}

// Handle permanent delete
const handlePermanentDelete = (item) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

// Confirm permanent delete
const confirmPermanentDelete = async () => {
  if (!selectedItem.value) return
  
  const result = await deletedItemsService.permanentlyDeleteItem(selectedItem.value._id)
  
  if (result.success) {
    showFeedback('success', 'Deleted!', `Item has been permanently deleted.`)
  } else {
    showFeedback('error', 'Delete Failed', result.error || 'Failed to delete item')
  }
  
  selectedItem.value = null
}

// ✅ NEW: Open empty trash options modal
const openEmptyOptions = () => {
  showEmptyOptionsModal.value = true
}

// In TrashView.vue - confirmEmptyWithOptions function

const confirmEmptyWithOptions = async (options) => {
  try {
    console.log('🔄 Emptying trash with options:', options)
    
    let result
    
    switch (options.option) {
      case 'all':
        console.log('   Deleting ALL items')
        result = await deletedItemsService.emptyAllTrash()  // ✅ This now works
        break
        
      case 'older-than':
        console.log(`   Deleting items older than ${options.days} days`)
        result = await deletedItemsService.emptyTrashOlderThan(options.days)  // ✅ This now works
        break
        
      case 'by-type':
        const types = []
        if (options.types.feedback) types.push('feedback')
        if (options.types.booking) types.push('booking')
        if (options.types.payment) types.push('payment')
        
        console.log('   Deleting by types:', types)
        
        if (types.length === 0) {
          showFeedback('error', 'No Types Selected', 'Please select at least one type to delete')
          return
        }
        
        result = await deletedItemsService.emptyTrashByType(types)  // ✅ This now works
        break
    }
    
    if (result?.success) {
      showFeedback('success', 'Trash Emptied!', result.message || 'Selected items have been removed.')
    } else {
      showFeedback('error', 'Empty Trash Failed', result?.error || 'Failed to empty trash')
    }
  } catch (error) {
    console.error('❌ Error emptying trash:', error)
    showFeedback('error', 'Error', 'An error occurred while emptying trash')
  }
}
// Load deleted items on mount
onMounted(() => {
  deletedItemsService.fetchDeletedItems()
})
</script>

<style scoped>
.trash-view {
  width: 100%;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0 0 8px 0;
}

.page-header p {
  color: var(--gray);
  font-size: 14px;
  margin: 0;
}

.empty-trash-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: var(--r-sm);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--tr);
  font-size: 14px;
}

.empty-trash-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.empty-trash-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  background: white;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: all var(--tr);
  font-weight: 500;
  color: var(--text);
}

.tab-btn:hover {
  border-color: var(--blue);
  color: var(--blue);
}

.tab-btn.active {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
}

/* Type Badge */
.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.type-feedback {
  background: #e3f2fd;
  color: #1976d2;
}

.type-booking {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-payment {
  background: #e8f5e9;
  color: #388e3c;
}

/* Details Cell */
.details-cell {
  max-width: 300px;
}

.details-cell strong {
  font-weight: 500;
  color: var(--text);
}

.detail-text {
  color: var(--gray);
  font-size: 13px;
}

/* Action Buttons */
.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: var(--r-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--tr);
  margin: 0 4px;
}

.action-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

.restore-btn {
  background: var(--blue);
  color: white;
}

.restore-btn:hover {
  background: #1d4d7a;
  transform: translateY(-1px);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--gray);
}

.empty-state svg {
  stroke: var(--gray);
  fill: none;
  stroke-width: 2;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 8px 0;
  color: var(--text);
}

.empty-state p {
  font-size: 14px;
}

/* Expiration Status */
.expired {
  color: #dc3545;
  font-weight: 600;
}

.expiring-soon {
  color: #f59e0b;
  font-weight: 600;
}

/* Feedback Modal */
.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.feedback-modal {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.feedback-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
}

.feedback-icon.success {
  background: #d4edda;
  color: #28a745;
}

.feedback-icon.error {
  background: #f8d7da;
  color: #dc3545;
}

.feedback-icon.info {
  background: #d1ecf1;
  color: #0c5460;
}

.feedback-title {
  font-size: 20px;
  margin: 0 0 10px 0;
}

.feedback-message {
  color: var(--gray);
  margin: 0 0 20px 0;
}

.feedback-btn {
  padding: 10px 30px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: var(--r-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--tr);
}

.feedback-btn:hover {
  background: #1d4d7a;
}
</style>