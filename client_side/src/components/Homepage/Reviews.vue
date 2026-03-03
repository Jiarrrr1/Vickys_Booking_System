<template>
    <section id="reviews">
        <div class="reviews-inner">
            <div class="reviews-top fade-up visible">
                <div class="section-label" style="justify-content:center"><span>Guest Reviews</span></div>
                <h2>What Our Guests Say</h2>
                <p>Hear what our guests have to say about their stay at Vicky's Resort</p>
            </div>
            
            <!-- Dynamic Reviews Grid -->
            <div class="reviews-grid">
                <!-- Static reviews (keep these as default/fallback) -->
                <div v-for="(review, index) in staticReviews" :key="'static-'+index" class="review-card fade-up visible">
                    <div class="review-quote">"</div>
                    <div class="stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5-review.rating) }}</div>
                    <p class="review-text">"{{ review.text }}"</p>
                    <div>
                        <div class="reviewer-name">{{ review.name }}</div>
                        <div class="review-date">{{ review.location }} · {{ review.date }}</div>
                    </div>
                </div>
                
                <!-- Dynamic reviews from API -->
                <!-- <div v-for="review in feedbackList" :key="review._id || review.feedBackId" class="review-card fade-up visible">
                    <div class="review-quote">"</div>
                    <div class="stars">{{ '★'.repeat(review.rate || review.rating) }}{{ '☆'.repeat(5-(review.rate || review.rating)) }}</div>
                    <p class="review-text">"{{ review.comment || review.message }}"</p>
                    <div>
                        <div class="reviewer-name">{{ review.from || review.name }}</div>
                        <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                    </div>
                </div> -->
            </div>
            
            <!-- No reviews message -->
            <!-- <div v-if="feedbackList.length === 0 && !loading" class="no-reviews">
                <p>No reviews yet. Be the first to share your experience!</p>
            </div> -->
                        
            <!-- Loading state -->
            <!-- <div v-if="loading" class="loading-reviews">
                <div class="spinner"></div>
                <p>Loading reviews...</p>
            </div> -->

            <div class="reviews-bottom fade-up visible">
                <a class="send-review" @click="openModal" :class="buttonClass">
                    📅 Send Your Insights
                </a>
            </div>

            <!-- Feedback Modal -->
            <FeedbackModal 
                :is-open="showFeedbackModal" 
                @close="closeModal"
                @submit-success="handleFeedbackSuccess"
            />
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FeedbackModal from '../../modal/FeedbackModal.vue'
import { api } from '../../services/api'

// Props for customization
const props = defineProps({
    buttonClass: {
        type: String,
        default: ''
    }
})

// Emits for parent communication
const emit = defineEmits(['feedback-submitted'])

// State
const showFeedbackModal = ref(false)
const feedbackList = ref([])
const loading = ref(false)

// Static default reviews (keep as fallback)
const staticReviews = ref([
    {
        name: "Maria Santos",
        text: "The perfect escape from the city! The countryside setting is so peaceful and the rooms are immaculate. Highly recommended for anyone seeking tranquility.",
        rating: 5,
        location: "Manila",
        date: "November 2024"
    },
    {
        name: "Juan Dela Cruz",
        text: "Vicky's Resort exceeded our expectations. The staff was attentive, the accommodations were clean and cozy, and the booking process was incredibly simple.",
        rating: 5,
        location: "Cebu",
        date: "November 2024"
    },
    {
        name: "Willy Limaco",
        text: "A hidden gem! We loved the privacy and the warm, welcoming atmosphere. It felt like a home away from home. Can't wait to return next summer.",
        rating: 5,
        location: "Baliuag",
        date: "March 2025"
    }
])

// Methods
const openModal = () => {
    showFeedbackModal.value = true
}

const closeModal = () => {
    showFeedbackModal.value = false
}

// Format date function
const formatDate = (dateString) => {
    if (!dateString) return 'Recent'
    
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        })
    } catch (e) {
        return 'Recent'
    }
}

// Fetch feedback from API
const fetchFeedback = async () => {
    loading.value = true
    try {
        console.log('📋 Fetching feedback...')
        const response = await api.getFeedback?.() // Use optional chaining in case method doesn't exist
        
        if (response && response.data) {
            feedbackList.value = response.data
            console.log(`✅ Loaded ${feedbackList.value.length} feedback entries`)
        } else if (Array.isArray(response)) {
            feedbackList.value = response
            console.log(`✅ Loaded ${feedbackList.value.length} feedback entries`)
        }
    } catch (error) {
        console.error('❌ Error fetching feedback:', error)
        // Don't show error to user, just use static reviews
    } finally {
        loading.value = false
    }
}

// Handle successful feedback submission
const handleFeedbackSuccess = (newFeedback) => {
    console.log('✅ New feedback received:', newFeedback)
    
    // Add new feedback to the list (at the top)
    if (newFeedback) {
        feedbackList.value.unshift(newFeedback)
    }
    
    // Show success message
    alert('Thank you for your feedback!')
    
    // Emit event to parent
    emit('feedback-submitted', newFeedback)
    
    // Refresh the feedback list
    fetchFeedback()
}

// Load feedback on component mount
onMounted(() => {
    fetchFeedback()
})
</script>

<style scoped>
/* Add these styles to your existing CSS */
.no-reviews {
    text-align: center;
    padding: 40px;
    color: var(--gold-muted);
    font-style: italic;
}

.loading-reviews {
    text-align: center;
    padding: 40px;
}

.spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid var(--charcoal-border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Update star display */
.stars {
    color: var(--gold);
    font-size: 18px;
    letter-spacing: 2px;
    margin-bottom: 12px;
}

/* Ensure review cards maintain consistency */
.review-card {
    opacity: 1 !important; /* Keep visible */
}

.send-review {
    cursor: pointer;
    display: inline-block;
}
</style>