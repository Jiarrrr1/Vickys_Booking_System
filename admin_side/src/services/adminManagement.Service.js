// src/services/adminManagementService.js
import { reactive, computed } from 'vue'
import { adminClient } from './api'

const state = reactive({
  admins: [],
  isLoading: false,
  error: null,
  searchQuery: ''
})

export function useAdminManagementService() {
  const filteredAdmins = computed(() => {
    if (!state.searchQuery) return state.admins
    
    const query = state.searchQuery.toLowerCase()
    return state.admins.filter(admin => 
      admin.username?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query) ||
      admin.fullName?.toLowerCase().includes(query)
    )
  })

  const fetchAdmins = async () => {
    state.isLoading = true
    state.error = null
    
    try {
      const response = await adminClient.get('/admin/getAlladmins')
      
      if (response.data && response.data.success) {
        // Map backend data to frontend format
        state.admins = (response.data.data || []).map(admin => ({
          id: admin.userId,
          userId: admin.userId,
          fullName: admin.fullName || '',
          username: admin.username,
          email: admin.email,
          status: admin.status || 'Active', // Keep as received from backend
          role: admin.role || 'admin',
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt
        }))
        return { success: true }
      }
      throw new Error(response.data?.message || 'Failed to fetch admins')
    } catch (error) {
      state.error = error.message
      return { success: false, error: error.message }
    } finally {
      state.isLoading = false
    }
  }

  const createAdmin = async (adminData) => {
    try {
      // Transform frontend data to match backend expectations
      const payload = {
        fullName: adminData.fullName,
        userName: adminData.username,
        email: adminData.email,
        password: adminData.password,
        status: 'Active' // Default to Active, not Inactive
      }
      
      const response = await adminClient.post('/admin/createAdmin', payload)
      
      if (response.data && response.data.success) {
        await fetchAdmins()
        return { success: true, data: response.data.data }
      }
      throw new Error(response.data?.message || 'Failed to create admin')
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const updateAdmin = async (userId, adminData) => {
    try {
      // Transform frontend data to match backend expectations
      const payload = {
        fullName: adminData.fullName,
        email: adminData.email,
        status: adminData.status || 'Active'
      }
      
      const response = await adminClient.put(`/admin/updateAdmins/${userId}`, payload)
      
      if (response.data && response.data.success) {
        await fetchAdmins()
        return { success: true }
      }
      throw new Error(response.data?.message || 'Failed to update admin')
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const deleteAdmin = async (userId) => {
    try {
      const response = await adminClient.delete(`/admin/deleteAdmins/${userId}`)
      
      if (response.data && response.data.success) {
        await fetchAdmins()
        return { success: true }
      }
      throw new Error(response.data?.message || 'Failed to delete admin')
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message }
    }
  }

  const verifyPassword = async (password) => {
    try {
      const response = await adminClient.post('/admin/verify-password', { password })
      return response.data?.success || false
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  const setSearchQuery = (query) => {
    state.searchQuery = query
  }

  return {
    admins: computed(() => state.admins),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    filteredAdmins,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    verifyPassword,
    setSearchQuery
  }
}