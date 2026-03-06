import { reactive, computed } from 'vue'
import { adminClient } from './api' // Import adminClient instead of axios

// Adjust this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

const state = reactive({
  feedbacks: [],
  isLoading: false,
  error: null,
  searchQuery: '',
})

export function useFeedbacksService() {
  // Computed: Filtered feedbacks based on search
  const filteredFeedbacks = computed(() => {
    if (!state.searchQuery) {
      return state.feedbacks
    }

    const query = state.searchQuery.toLowerCase()
    return state.feedbacks.filter(feedback => {
      const guestName = (feedback.from || '').toLowerCase()
      const comment = (feedback.comment || '').toLowerCase()
      const feedbackId = String(feedback.id || '').toLowerCase()
      
      return (
        guestName.includes(query) ||
        comment.includes(query) ||
        feedbackId.includes(query)
      )
    })
  })

  // Computed: Total feedbacks
  const totalFeedbacks = computed(() => state.feedbacks.length)

  // Computed: Average rating
  const averageRating = computed(() => {
    if (state.feedbacks.length === 0) return '0.0'
    const sum = state.feedbacks.reduce((acc, f) => acc + (f.rate || 0), 0)
    return (sum / state.feedbacks.length).toFixed(1)
  })

  // Computed: Positive count (4-5 stars)
  const positiveCount = computed(() => {
    return state.feedbacks.filter(f => f.rate >= 4).length
  })

  // Computed: Neutral count (3 stars)
  const neutralCount = computed(() => {
    return state.feedbacks.filter(f => f.rate === 3).length
  })

  // Computed: Negative count (1-2 stars)
  const negativeCount = computed(() => {
    return state.feedbacks.filter(f => f.rate <= 2).length
  })

  // Computed: Displayed count
  const displayedCount = computed(() => {
    return state.feedbacks.filter(f => f.isDisplay === true).length
  })

  // Computed: Hidden count
  const hiddenCount = computed(() => {
    return state.feedbacks.filter(f => f.isDisplay === false).length
  })

  // Fetch all feedbacks (admin) - FIXED: Use adminClient instead of axios
  const fetchFeedbacks = async () => {
    state.isLoading = true
    state.error = null

    try {
      console.log('📡 Fetching feedbacks from:', '/admin/getAllFeedback')
      
      // Use adminClient which automatically includes the auth token
      const response = await adminClient.get('/admin/getAllFeedback')
      
      console.log('📥 Response received:', response)
      console.log('📥 Response data:', response.data)
      
      // Handle the response structure from adminClient (which returns response.data directly)
      const responseData = response.data
      
      if (responseData && responseData.success) {
        // Map backend data to frontend format (feedBackId -> id)
        state.feedbacks = (responseData.data || []).map(feedback => ({
          ...feedback,
          id: feedback.feedBackId || feedback._id,
          from: feedback.from,
          rate: feedback.rate,
          comment: feedback.comment,
          status: feedback.status,
          isDisplay: feedback.isDisplay,
          createdAt: feedback.createdAt
        }))
        console.log('✅ Feedbacks loaded:', state.feedbacks.length)
        return { success: true, data: state.feedbacks }
      } else {
        throw new Error(responseData?.message || 'Failed to fetch feedbacks')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch feedbacks'
      state.error = errorMessage
      console.error('❌ Error fetching feedbacks:', error)
      console.error('Error details:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      })
      return { success: false, error: errorMessage }
    } finally {
      state.isLoading = false
    }
  }

  // Fetch single feedback by ID - FIXED: Use adminClient
  const fetchFeedbackById = async (id) => {
    try {
      const response = await adminClient.get(`/admin/getFeedback/${id}`)
      
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch feedback')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch feedback'
      console.error('Error fetching feedback:', error)
      return { success: false, error: errorMessage }
    }
  }

  // Toggle feedback display status - FIXED: Use adminClient
  const toggleFeedbackStatus = async (feedbackId, newStatus) => {
    console.group('🔄 Toggle Feedback Display')
    console.log('Feedback ID:', feedbackId)
    console.log('New Status:', newStatus)
    console.log('Request Body:', { isDisplay: newStatus })
    
    try {
      const response = await adminClient.patch(`/admin/updateFeedbackStatus/${feedbackId}`, { isDisplay: newStatus })
      
      console.log('📥 Response Status:', response.status)
      console.log('📥 Response Data:', response.data)

      if (response.data && response.data.success) {
        // Update local state using id (which is mapped from feedBackId)
        const feedback = state.feedbacks.find(f => f.id === feedbackId)
        console.log('🔍 Found feedback in state:', feedback ? 'YES' : 'NO')
        
        if (feedback) {
          const oldValue = feedback.isDisplay
          feedback.isDisplay = newStatus
          console.log(`✅ Updated: ${oldValue} → ${newStatus}`)
        } else {
          console.warn('⚠️ Feedback not found in state! ID:', feedbackId)
          console.log('Available IDs:', state.feedbacks.map(f => f.id))
        }
        
        console.groupEnd()
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data?.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('❌ Request failed!')
      console.error('Error:', error.message)
      if (error.response) {
        console.error('Response Status:', error.response.status)
        console.error('Response Data:', error.response.data)
      }
      console.groupEnd()
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status'
      return { success: false, error: errorMessage }
    }
  }

  // Delete feedback - FIXED: Use adminClient
  const deleteFeedback = async (feedbackId, deletedBy) => {
    try {
      const response = await adminClient.delete(`/admin/deleteFeedback/${feedbackId}`, {
        data: { deletedBy }
      })

      console.log('Feedback Response:', response);

      if (response.data && response.data.success) {
        // Remove from local state using id (mapped from feedBackId)
        const index = state.feedbacks.findIndex(f => f.id === feedbackId)
        if (index !== -1) {
          state.feedbacks.splice(index, 1)
        }
        
        return { success: true }
      } else {
        throw new Error(response.data?.message || 'Failed to delete feedback')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete feedback'
      console.error('Error deleting feedback:', error)
      return { success: false, error: errorMessage }
    }
  }

  // Create feedback (public - no auth required)
  const createFeedback = async (feedbackData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/feedbacks/createFeedback`,
        feedbackData
      )

      if (response.data && response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        throw new Error(response.data?.message || 'Failed to create feedback')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create feedback'
      console.error('Error creating feedback:', error)
      return { success: false, error: errorMessage }
    }
  }

  // Get approved feedbacks (for public display - no auth required)
  const fetchApprovedFeedbacks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedbacks/getApprovedFeedback`)
      
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data || [] }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch approved feedbacks')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch approved feedbacks'
      console.error('Error fetching approved feedbacks:', error)
      return { success: false, error: errorMessage }
    }
  }

  // Set search query
  const setSearchQuery = (query) => {
    state.searchQuery = query
  }

  // Clear error
  const clearError = () => {
    state.error = null
  }

  return {
    // State
    feedbacks: computed(() => state.feedbacks),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    
    // Computed
    filteredFeedbacks,
    totalFeedbacks,
    averageRating,
    positiveCount,
    neutralCount,
    negativeCount,
    displayedCount,
    hiddenCount,
    
    // Methods
    fetchFeedbacks,
    fetchFeedbackById,
    toggleFeedbackStatus,
    deleteFeedback,
    createFeedback,
    fetchApprovedFeedbacks,
    setSearchQuery,
    clearError,
  }
}