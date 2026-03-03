// src/services/feedbacksService.js
import { reactive, computed } from 'vue'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api', // Use proxy
  headers: { 'Content-Type': 'application/json' }
})

// Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const state = reactive({
  feedbacks: [],
  isLoading: false,
  error: null,
  searchQuery: ''
})

// Transform backend data to frontend format
const transformFeedback = (backendFeedback) => ({
  id: backendFeedback.feedBackId,
  guest: backendFeedback.from,
  rating: backendFeedback.rate,
  comment: backendFeedback.comment,
  status: backendFeedback.status,
showOnClient: backendFeedback.isDisplay,
  date: backendFeedback.createdAt,
  original: backendFeedback
})

// Computed properties
const filteredFeedbacks = computed(() => {
  if (!state.searchQuery) return state.feedbacks

  const query = state.searchQuery.toLowerCase()
  return state.feedbacks.filter(fb => 
    fb.guest?.toLowerCase().includes(query) ||
    fb.comment?.toLowerCase().includes(query)
  )
})

const approvedCount = computed(() => 
  state.feedbacks.filter(fb => fb.showOnClient).length
)

const pendingCount = computed(() => 
  state.feedbacks.filter(fb => !fb.showOnClient).length
)

const averageRating = computed(() => {
  if (state.feedbacks.length === 0) return 0
  const sum = state.feedbacks.reduce((acc, fb) => acc + fb.rating, 0)
  return (sum / state.feedbacks.length).toFixed(1)
})

export const useFeedbacksService = () => {
  const fetchFeedbacks = async () => {
    state.isLoading = true
    state.error = null

    try {
      const response = await apiClient.get('/admin/getAllFeedback')
      console.log('Feedbacks response:', response.data)
      
      const feedbacksData = response.data.data || response.data
      state.feedbacks = Array.isArray(feedbacksData) 
        ? feedbacksData.map(transformFeedback)
        : []
      
      return true
    } catch (error) {
      state.error = error.response?.data?.message || 'Failed to fetch feedbacks'
      console.error('❌ Fetch feedbacks error:', error)
      return false
    } finally {
      state.isLoading = false
    }
  }

  const toggleFeedbackStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus
     const response = await apiClient.patch(`/admin/updateFeedbackStatus/${id}`, { 
  isDisplay: newStatus 
})
      
      // Update local state
      const index = state.feedbacks.findIndex(fb => fb.id === id)
      if (index !== -1) {
        state.feedbacks[index].showOnClient = newStatus
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Toggle status error:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteFeedback = async (id) => {
    try {
      await apiClient.delete(`/admin/deleteFeedback/${id}`)
      
      // Remove from local state
      state.feedbacks = state.feedbacks.filter(fb => fb.id !== id)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Delete feedback error:', error)
      return { success: false, error: error.message }
    }
  }

  const setSearchQuery = (query) => {
    state.searchQuery = query
  }

  return {
    // State
    feedbacks: computed(() => state.feedbacks),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    searchQuery: computed(() => state.searchQuery),
    filteredFeedbacks,
    approvedCount,
    pendingCount,
    averageRating,
    
    // Methods
    fetchFeedbacks,
    toggleFeedbackStatus,
    deleteFeedback,
    setSearchQuery
  }
}