<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl text-neutral-800">Customer Feedback</h2>
        <p class="text-neutral-500 mt-1">View customer testimonials and ratings</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search feedback..."
            class="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-green-500 focus:border-green-500 w-full md:w-64"
          />
          <div class="absolute left-3 top-2.5">
            <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select
          v-model="ratingFilter"
          class="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        >
          <option value="0">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">Average Rating</p>
        <div class="flex items-center gap-2 mt-2">
          <p class="text-2xl text-neutral-800">{{ averageRating.toFixed(1) }}</p>
          <div class="flex items-center">
            <svg v-for="star in 5" :key="star" class="w-5 h-5" :class="star <= Math.round(averageRating) ? 'text-amber-400' : 'text-neutral-300'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">Total Feedback</p>
        <p class="text-2xl text-neutral-800 mt-2">{{ feedbackData.length }}</p>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">5-Star Reviews</p>
        <p class="text-2xl text-neutral-800 mt-2">{{ fiveStarCount }}</p>
      </div>
      
      <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <p class="text-sm text-neutral-500">Recent Feedback</p>
        <p class="text-2xl text-neutral-800 mt-2">{{ recentFeedbackCount }}</p>
      </div>
    </div>

    <!-- Feedback List -->
    <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div class="overflow-x-auto">
        <div v-if="filteredFeedback.length > 0" class="divide-y divide-neutral-100">
          <div 
            v-for="feedback in filteredFeedback" 
            :key="feedback.id" 
            class="p-6 hover:bg-neutral-50 transition-colors"
          >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                    <span class="text-green-700 font-semibold">{{ getInitials(feedback.customerName) }}</span>
                  </div>
                  <div>
                    <h4 class="text-lg font-medium text-neutral-800">{{ feedback.customerName }}</h4>
                    <p class="text-sm text-neutral-500">{{ feedback.date }}</p>
                  </div>
                </div>
                
                <div class="mt-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="flex items-center">
                      <svg v-for="star in 5" :key="star" class="w-5 h-5" :class="star <= feedback.rating ? 'text-amber-400' : 'text-neutral-300'" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-neutral-600">{{ feedback.rating }}.0</span>
                  </div>
                  
                  <p class="text-neutral-700">{{ feedback.testimonial }}</p>
                  
                  <div v-if="feedback.room" class="mt-3">
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {{ feedback.room }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span :class="`px-3 py-1 rounded-full text-xs ${getSentimentColor(feedback.sentiment)}`">
                  {{ feedback.sentiment }}
                </span>
                <button
                  @click="toggleHelpful(feedback.id)"
                  class="flex items-center gap-1 px-3 py-1 text-sm text-neutral-600 hover:text-green-700 transition-colors"
                >
                  <svg class="w-4 h-4" :class="feedback.helpful ? 'text-green-600' : 'text-neutral-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {{ feedback.helpfulCount }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="filteredFeedback.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-neutral-900">No feedback found</h3>
            <p class="mt-1 text-neutral-500">No feedback matches your search criteria.</p>
            <div class="mt-6">
              <button
                @click="clearFilters"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const ratingFilter = ref('0')

const feedbackData = ref([
  {
    id: 1,
    customerName: 'Maria Santos',
    testimonial: 'Amazing stay! The staff was incredibly helpful and the room was spotless. Will definitely come back.',
    rating: 5,
    date: 'Jan 22, 2026',
    room: 'Deluxe Suite',
    sentiment: 'Positive',
    helpfulCount: 24,
    helpful: false
  }
])

const filteredFeedback = computed(() => {
  return feedbackData.value.filter(feedback => {
    const matchesSearch = searchQuery.value === '' || 
      feedback.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      feedback.testimonial.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (feedback.room && feedback.room.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesRating = ratingFilter.value === '0' || 
      feedback.rating === parseInt(ratingFilter.value)
    
    return matchesSearch && matchesRating
  })
})

const averageRating = computed(() => {
  if (feedbackData.value.length === 0) return 0
  const total = feedbackData.value.reduce((sum, feedback) => sum + feedback.rating, 0)
  return total / feedbackData.value.length
})

const fiveStarCount = computed(() => {
  return feedbackData.value.filter(feedback => feedback.rating === 5).length
})

const recentFeedbackCount = computed(() => {
  // Count feedback from last 7 days (mock - in real app you'd check dates)
  return feedbackData.value.filter(feedback => feedback.id <= 3).length
})

const clearFilters = () => {
  searchQuery.value = ''
  ratingFilter.value = '0'
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'Positive':
      return 'bg-green-100 text-green-700'
    case 'Neutral':
      return 'bg-amber-100 text-amber-700'
    case 'Negative':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
}

const toggleHelpful = (id) => {
  const feedback = feedbackData.value.find(f => f.id === id)
  if (feedback) {
    if (feedback.helpful) {
      feedback.helpfulCount--
    } else {
      feedback.helpfulCount++
    }
    feedback.helpful = !feedback.helpful
  }
}
</script>