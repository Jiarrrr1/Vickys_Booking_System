// ============================================
// FRONTEND: Deleted Items Service (FIXED)
// ============================================
// File: services/deletedItemsService.js

import { reactive, computed } from 'vue'
import { adminClient } from './api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

const state = reactive({
  deletedItems: [],
  isLoading: false,
  error: null,
  filterType: '', // 'feedback', 'booking', 'payment', or ''
})

export function useDeletedItemsService() {
  // Computed: Filtered items by type
  const filteredItems = computed(() => {
    if (!state.filterType) {
      return state.deletedItems
    }
    return state.deletedItems.filter(item => item.itemType === state.filterType)
  })
  
  // Computed: Count by type
  const feedbackCount = computed(() => 
    state.deletedItems.filter(item => item.itemType === 'feedback').length
  )
  
  const bookingCount = computed(() => 
    state.deletedItems.filter(item => item.itemType === 'booking').length
  )
  
  const paymentCount = computed(() => 
    state.deletedItems.filter(item => item.itemType === 'payment').length
  )
  
  // Fetch all deleted items
  const fetchDeletedItems = async (filters = {}) => {
    state.isLoading = true
    state.error = null
    
    try {
      const params = new URLSearchParams()
      if (filters.itemType) params.append('itemType', filters.itemType)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      
      console.log('📡 Fetching deleted items from:', `/admin/deleted`)
      
      const response = await adminClient.get(`/admin/deleted?${params.toString()}`)
      
      console.log('📥 Response:', response.data)
      
      if (response.data && response.data.success) {
        state.deletedItems = response.data.data || []
        console.log('✅ Deleted items loaded:', state.deletedItems.length)
        return { success: true, data: state.deletedItems }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch deleted items')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      state.error = errorMessage
      console.error('❌ Error fetching deleted items:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      })
      return { success: false, error: errorMessage }
    } finally {
      state.isLoading = false
    }
  }
  
  // Restore an item
  const restoreItem = async (deletedItemId) => {
    try {
      console.log(`🔄 Restoring item:`, deletedItemId)
      
      const response = await adminClient.post(`/admin/deleted/${deletedItemId}/restore`)
      
      if (response.data && response.data.success) {
        const index = state.deletedItems.findIndex(item => item._id === deletedItemId)
        if (index !== -1) {
          state.deletedItems.splice(index, 1)
        }
        console.log('✅ Item restored successfully')
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data?.message || 'Failed to restore item')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error restoring item:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // Restore multiple items
  const restoreMultipleItems = async (itemIds) => {
    try {
      console.log(`🔄 Restoring ${itemIds.length} items`)
      
      const response = await adminClient.post(`/admin/deleted/restore-multiple`, { itemIds })
      
      if (response.data && response.data.success) {
        await fetchDeletedItems()
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data?.message || 'Failed to restore items')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error restoring items:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // Permanently delete an item
  const permanentlyDeleteItem = async (deletedItemId) => {
    try {
      console.log(`🗑️ Permanently deleting item:`, deletedItemId)
      
      const response = await adminClient.delete(`/admin/deleted/${deletedItemId}/permanent`)
      
      if (response.data && response.data.success) {
        const index = state.deletedItems.findIndex(item => item._id === deletedItemId)
        if (index !== -1) {
          state.deletedItems.splice(index, 1)
        }
        console.log('✅ Item permanently deleted')
        return { success: true }
      } else {
        throw new Error(response.data?.message || 'Failed to permanently delete')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error permanently deleting item:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // Permanently delete multiple items
  const permanentlyDeleteMultiple = async (itemIds) => {
    try {
      console.log(`🗑️ Permanently deleting ${itemIds.length} items`)
      
      const response = await adminClient.delete(`/admin/deleted/permanent-multiple`, {
        data: { itemIds }
      })
      
      if (response.data && response.data.success) {
        await fetchDeletedItems()
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data?.message || 'Failed to delete items')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error deleting items:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // ✅ FIXED: Empty ALL trash - use the correct endpoint
  const emptyAllTrash = async () => {
    try {
      console.log(`🧹 Emptying ALL trash items`)
      
      // Use the correct endpoint: /empty-all (not /empty-trash)
      const response = await adminClient.post(`/admin/deleted/empty-all`)
      
      if (response.data && response.data.success) {
        await fetchDeletedItems()
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data?.message || 'Failed to empty trash')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error emptying trash:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // ✅ FIXED: Empty trash older than X days - use the correct endpoint
  const emptyTrashOlderThan = async (days) => {
    try {
      console.log(`🧹 Emptying trash older than ${days} days`)
      
      // Use the correct endpoint: /empty-older-than (not /empty-trash)
      const response = await adminClient.post(`/admin/deleted/empty-older-than`, { days })
      
      if (response.data && response.data.success) {
        await fetchDeletedItems()
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data?.message || 'Failed to empty trash')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error emptying trash:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // Empty trash by type
  const emptyTrashByType = async (types) => {
    try {
      console.log(`🧹 Emptying trash by types:`, types)
      
      const response = await adminClient.post(`/admin/deleted/empty-by-type`, { types })
      
      if (response.data && response.data.success) {
        await fetchDeletedItems()
        return { success: true, message: response.data.message }
      } else {
        throw new Error(response.data?.message || 'Failed to empty trash')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error emptying trash:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // Get trash statistics
  const getTrashStats = async () => {
    try {
      const response = await adminClient.get(`/admin/deleted/stats`)
      
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data?.message || 'Failed to get trash stats')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      console.error('❌ Error getting trash stats:', error)
      return { success: false, error: errorMessage }
    }
  }
  
  // Set filter type
  const setFilterType = (type) => {
    state.filterType = type
  }
  
  return {
    // State
    deletedItems: computed(() => state.deletedItems),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    
    // Computed
    filteredItems,
    feedbackCount,
    bookingCount,
    paymentCount,
    
    // Methods
    fetchDeletedItems,
    restoreItem,
    restoreMultipleItems,
    permanentlyDeleteItem,
    permanentlyDeleteMultiple,
    emptyAllTrash,        // ✅ Fixed - uses /empty-all
    emptyTrashOlderThan,  // ✅ Fixed - uses /empty-older-than
    emptyTrashByType,     // ✅ Fixed - uses /empty-by-type
    getTrashStats,
    setFilterType,
  }
}