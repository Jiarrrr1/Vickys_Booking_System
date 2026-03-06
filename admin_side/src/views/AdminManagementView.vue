<!-- src/views/AdminAdminsView.vue -->
<template>
  <div class="admins-view">
    <section class="section fu">
      <!-- Header - No stat cards, just title and create button -->
      <div class="page-header">
        <div>
          <h1>👥 Admin Management</h1>
          <p class="subtitle">Manage system administrators and their permissions</p>
        </div>
        <button class="create-btn" @click="openCreateModal">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create New Admin
        </button>
      </div>
      
      
      <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Administrators</div>
          <div class="card-sub">View and manage admin accounts</div>
        </div>

        <div class="fbar">
          <div class="fsearch">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by name, username or email..."
              @input="handleSearch"
            />
          </div>
        </div>
      </div>

      <!-- Admins Table -->
      
        <div class="twrap">
          <!-- Loading State -->
          <div v-if="isLoading" class="empty-state">
            <div class="loading-spinner"></div>
            <p style="margin-top: 16px;">Loading administrators...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredAdmins.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none"/>
              <path d="M5.3 18.2c.8-1.6 2.7-2.7 4.7-2.7h4c2 0 3.9 1.1 4.7 2.7" stroke="currentColor" fill="none"/>
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" fill="none"/>
            </svg>
            <h3>No Administrators Found</h3>
            <p v-if="searchQuery">No results for "{{ searchQuery }}"</p>
            <p v-else>Click the button above to create your first admin</p>
          </div>

          <!-- Table -->
          <table v-else>
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style="text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="admin in filteredAdmins" 
                :key="admin.id"
                class="admin-row"
              >
                <td>{{ admin.userId }}</td>
                <td >
                  <span class="admin-name">{{ admin.fullName }}</span>
                </td>
                <td>
                   {{ admin.username }}
                </td>
                <td class="tdm">{{ admin.email }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(admin.status)">
                    {{ admin.status }}
                  </span>
                </td>
                <td>{{ formatDate(admin.lastLogin) || 'Never' }}</td>
                <td style="text-align: center;">
                  <button 
                    class="view-btn" 
                    @click="openEditModal(admin)"
                    title="Edit Admin"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                  </button>
                  <button 
                    v-if="admin.username !== currentAdmin?.username"
                    class="delete-btn" 
                    @click="confirmDelete(admin)"
                    title="Delete Admin"
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
        </div>
      </div>
    </section>

    <!-- Create/Edit Admin Modal -->
    <Transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="admin-modal" @click.stop>
          <div class="modal-header">
            <h2>{{ modalMode === 'create' ? 'Create New Admin' : 'Edit Admin' }}</h2>
            <button class="close-btn" @click="closeModal">×</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- Step 1: Admin Details -->
            <div v-if="!showPasswordConfirm" class="form-step">
              <div class="form-section">
                <h3>Admin Details</h3>
                
                <div class="form-group">
                  <label for="fullName">Full Name *</label>
                  <input
                    id="fullName"
                    v-model="form.fullName"
                    type="text"
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div class="form-group">
                  <label for="username">Username *</label>
                  <input
  id="username"
  v-model="form.username"
  type="text"
  required
  placeholder="Enter username"
  :disabled="modalMode === 'edit'" 
/>
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div class="form-group" v-if="modalMode === 'create'">
                  <label for="password">Password *</label>
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    required
                    placeholder="Enter password"
                    minlength="6"
                  />
                  <p class="help-text">Minimum 6 characters</p>
                </div>

              </div>
            </div>

            <!-- Step 2: Password Confirmation -->
            <div v-else class="form-step">
              <div class="security-icon">🔒</div>
              <h3 class="confirm-title">Confirm Your Identity</h3>
              <p class="confirm-subtitle">Please enter your password to authorize this action</p>

              <div class="form-group">
                <label for="currentPassword">Your Password *</label>
                <input
                  id="currentPassword"
                  v-model="passwordConfirm"
                  type="password"
                  required
                  placeholder="Enter your current password"
                  autofocus
                />
                <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
              </div>

              <div class="warning-box">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
                <span>This action will be recorded in the system logs</span>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
              <button 
                v-if="!showPasswordConfirm" 
                type="button" 
                class="btn-next" 
                @click="goToConfirm"
              >
                Next
              </button>
              <button 
                v-else 
                type="submit" 
                class="btn-submit" 
                :disabled="isSubmitting || !passwordConfirm"
              >
                <span v-if="!isSubmitting">{{ modalMode === 'create' ? 'Create Admin' : 'Update Admin' }}</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      :title="`Delete Admin ${selectedAdmin?.username}?`"
      :message="`Are you sure you want to delete this admin? This action cannot be undone.`"
      confirm-text="Delete"
      type="danger"
      :requires-password="true"
      @confirm="confirmDeleteWithPassword"
      @close="showDeleteModal = false"
    />

    <!-- Feedback Modal -->
    <div v-if="showFeedback" class="feedback-modal-overlay" @click="showFeedback = false">
      <div class="feedback-modal" :class="feedbackType">
        <div class="feedback-icon">{{ feedbackType === 'success' ? '✓' : '✗' }}</div>
        <h3>{{ feedbackTitle }}</h3>
        <p>{{ feedbackMessage }}</p>
        <button class="feedback-btn" @click="showFeedback = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminManagementService } from '@/services/adminManagement.Service'
import ConfirmationModal from '@/modals/confirmDeleteAdmin.vue'

const adminService = useAdminManagementService()
const { admins, isLoading, filteredAdmins, fetchAdmins, createAdmin, updateAdmin, deleteAdmin, verifyPassword } = adminService

// Current logged in admin (from localStorage)
const currentAdmin = ref(JSON.parse(localStorage.getItem('adminUser') || '{}'))

// Search
const searchQuery = ref('')
const handleSearch = () => {
  adminService.setSearchQuery(searchQuery.value)
}

// Modal state
const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const showPasswordConfirm = ref(false)
const passwordConfirm = ref('')
const passwordError = ref('')
const isSubmitting = ref(false)
const selectedAdmin = ref(null)

// Form data
const form = ref({
  fullName: '',
  username: '',
  email: '',
  password: '',
  status: 'Inactive', //

  role: 'admin'
})

// Delete modal
const showDeleteModal = ref(false)

// Feedback
const showFeedback = ref(false)
const feedbackType = ref('success')
const feedbackTitle = ref('')
const feedbackMessage = ref('')

// Get status class for styling
const getStatusClass = (status) => {
  const classes = {
    'Active': 'status-active',
    'Inactive': 'status-inactive',
    'Suspended': 'status-suspended'
  }
  return classes[status] || 'status-active'
}

// Get initials from name
const getInitials = (name) => {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Open create modal
const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  showModal.value = true
}

// Open edit modal
const openEditModal = (admin) => {
  modalMode.value = 'edit'
  selectedAdmin.value = admin
  form.value = {
    fullName: admin.fullName || '',
    username: admin.username,
    email: admin.email,
    password: '',
    role: admin.role || 'admin'
  }
  showModal.value = true
}

// Go to password confirmation step
const goToConfirm = () => {
  if (!validateForm()) return
  showPasswordConfirm.value = true
  passwordConfirm.value = ''
  passwordError.value = ''
}

// Validate form
const validateForm = () => {
  if (!form.value.fullName) return false
  if (!form.value.username) return false
  if (!form.value.email) return false
  if (modalMode.value === 'create' && !form.value.password) return false
  return true
}

// Handle form submission
const handleSubmit = async () => {
  if (!passwordConfirm.value) {
    passwordError.value = 'Password is required'
    return
  }

  isSubmitting.value = true
  passwordError.value = ''

  try {
    // Verify current admin's password
    const isValid = await verifyPassword(passwordConfirm.value)
    
    if (!isValid) {
      passwordError.value = 'Incorrect password'
      isSubmitting.value = false
      return
    }

    // Proceed with create/update
    let result
    if (modalMode.value === 'create') {
      result = await createAdmin(form.value)
    } else {
result = await updateAdmin(selectedAdmin.value.userId || selectedAdmin.value.id, form.value)
    }

    if (result.success) {
      showFeedbackMessage('success', 
        modalMode.value === 'create' ? 'Admin Created' : 'Admin Updated',
        `Admin has been ${modalMode.value === 'create' ? 'created' : 'updated'} successfully.`
      )
      closeModal()
    } else {
      passwordError.value = result.error || 'Operation failed'
    }
  } catch (error) {
    passwordError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}

// Confirm delete
const confirmDelete = (admin) => {
  selectedAdmin.value = admin
  showDeleteModal.value = true
}

// Delete with password confirmation
const confirmDeleteWithPassword = async (password) => {
  const isValid = await verifyPassword(password)
  
  if (!isValid) {
    showFeedbackMessage('error', 'Authentication Failed', 'Incorrect password')
    return false
  }

const result = await deleteAdmin(selectedAdmin.value.userId || selectedAdmin.value.id)
  
  if (result.success) {
    showFeedbackMessage('success', 'Admin Deleted', 'Admin has been deleted successfully.')
    showDeleteModal.value = false
    return true
  } else {
    showFeedbackMessage('error', 'Delete Failed', result.error || 'Failed to delete admin')
    return false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'admin'
  }
  passwordConfirm.value = ''
  passwordError.value = ''
  showPasswordConfirm.value = false
}

// Close modal
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// Show feedback message
const showFeedbackMessage = (type, title, message) => {
  feedbackType.value = type
  feedbackTitle.value = title
  feedbackMessage.value = message
  showFeedback.value = true
}

// Load admins on mount
onMounted(() => {
  fetchAdmins()
})
</script>

<style scoped>
.admins-view {
  width: 100%;
  min-height: 100%;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.create-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.create-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}



.admin-row {
  transition: background-color 0.2s;
}

.admin-row:hover {
  background-color: #f8f9fa;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.admin-name {
  font-weight: 500;
  color: #1f2937;
}

.tdm {
  font-family: monospace;
  font-size: 13px;
}

/* Role Badges */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
}

.role-badge.admin {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.role-badge.super_admin {
  background-color: #ede7f6;
  color: #7b1fa2;
  border: 1px solid #d1c4e9;
}

.role-badge.viewer {
  background-color: #e8f5e9;
  color: #388e3c;
  border: 1px solid #c8e6c9;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
}

.status-active {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-inactive {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.status-suspended {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Action Buttons */
.view-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all var(--tr);
  margin-right: 8px;
}

.view-btn:hover {
  background: #357abd;
  transform: translateY(-1px);
}

.view-btn svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
}

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
  z-index: 10000;
  padding: 20px;
}

.admin-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
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
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
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

.form-step {
  min-height: 300px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.security-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin: 0 0 8px 0;
}

.confirm-subtitle {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 24px 0;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  margin-top: 20px;
}

.warning-box svg {
  stroke: #856404;
  fill: none;
  flex-shrink: 0;
}

.warning-box span {
  color: #856404;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0 0 0;
  border-top: 1px solid #e0e0e0;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-next,
.btn-submit {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-next:hover,
.btn-submit:hover {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  z-index: 11000;
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

.feedback-modal.success .feedback-icon {
  background: #d4edda;
  color: #28a745;
}

.feedback-modal.error .feedback-icon {
  background: #f8d7da;
  color: #dc3545;
}

.feedback-modal h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
}

.feedback-modal p {
  color: #6b7280;
  margin: 0 0 20px 0;
}

.feedback-btn {
  padding: 10px 30px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state svg {
  stroke: #999;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 8px 0;
  color: #333;
}

.empty-state p {
  font-size: 14px;
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
</style>