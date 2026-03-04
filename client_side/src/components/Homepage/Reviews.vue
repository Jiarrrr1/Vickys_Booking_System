<template>
    <section id="reviews">
        <div class="reviews-inner">
            <div class="reviews-top fade-up visible">
                <div class="section-label" style="justify-content:center"><span>Guest Reviews</span></div>
                <h2>What Our Guests Say</h2>
                <p>Hear what our guests have to say about their stay at Vicky's Resort</p>
            </div>
            
            <!-- Dynamic Reviews Grid - Only show approved feedbacks from database -->
            <div class="reviews-grid" v-if="!loading && approvedFeedbacks.length > 0">
                <div v-for="review in approvedFeedbacks" :key="review.feedBackId" class="review-card fade-up visible">
                    <div class="review-quote">"</div>
                    <div class="stars">{{ '★'.repeat(review.rate) }}{{ '☆'.repeat(5-review.rate) }}</div>
                    <p class="review-text">"{{ review.comment }}"</p>
                    <div>
                        <div class="reviewer-name">{{ review.from }}</div>
                        <div class="review-date">{{ formatDate(review.createdAt) }}</div>
                    </div>
                </div>
            </div>
            
            <!-- No reviews message -->
            <div v-if="!loading && approvedFeedbacks.length === 0" class="no-reviews">
                <p>No reviews yet. Be the first to share your experience!</p>
            </div>
                    
            <!-- Loading state -->
            <div v-if="loading" class="loading-reviews">
                <div class="spinner"></div>
                <p>Loading reviews...</p>
            </div>

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

            <!-- Success Modal -->
            <Transition name="modal">
                <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
                    <div class="success-modal" @click.stop>
                        <div class="success-icon">✓</div>
                        <h3>Thank You!</h3>
                        <p>Your feedback has been submitted successfully.</p>
                        <button class="success-btn" @click="closeSuccessModal">Got it</button>
                    </div>
                </div>
            </Transition>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const showSuccessModal = ref(false)
const feedbackList = ref([])
const loading = ref(false)

// Computed: Filter only approved feedbacks (isDisplay = true)
const approvedFeedbacks = computed(() => {
    return feedbackList.value.filter(feedback => feedback.isDisplay === true)
})

// Methods
const openModal = () => {
    showFeedbackModal.value = true
}

const closeModal = () => {
    showFeedbackModal.value = false
}

const closeSuccessModal = () => {
    showSuccessModal.value = false
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

// Fetch approved feedback from API
const fetchFeedback = async () => {
    loading.value = true
    try {
        console.log('📋 Fetching approved feedback...')
        const response = await api.getFeedback()
        
        console.log('📥 Response:', response)
        
        // Handle different response formats
        if (response && response.success && response.data) {
            feedbackList.value = response.data
            console.log(`✅ Loaded ${feedbackList.value.length} total feedbacks`)
        } else if (Array.isArray(response)) {
            feedbackList.value = response
            console.log(`✅ Loaded ${feedbackList.value.length} total feedbacks`)
        } else {
            console.warn('⚠️ Unexpected response format:', response)
            feedbackList.value = []
        }
        
        console.log('📊 Approved feedbacks to display:', approvedFeedbacks.value.length)
        
    } catch (error) {
        console.error('❌ Error fetching feedback:', error)
        feedbackList.value = []
    } finally {
        loading.value = false
    }
}

// Handle successful feedback submission
const handleFeedbackSuccess = (newFeedback) => {
    console.log('✅ New feedback received:', newFeedback)
    
    // Close feedback modal
    closeModal()
    
    // Show success modal
    showSuccessModal.value = true
    
    // Emit event to parent
    emit('feedback-submitted', newFeedback)
    
    // Refresh the feedback list
    fetchFeedback()
}

// Load feedback on component mount
onMounted(() => {
    console.log('🎬 Reviews component mounted')
    fetchFeedback()
})
</script>

<style scoped>
/* No reviews message */
.no-reviews {
    text-align: center;
    padding: 60px 40px;
    color: var(--gold-muted);
    font-style: italic;
    font-size: 16px;
    font-family: 'Playfair Display', sans-serif;
}

/* Loading state */
.loading-reviews {
    text-align: center;
    padding: 60px 40px;
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

/* Star display */
.stars {
    color: var(--gold);
    font-size: 18px;
    letter-spacing: 2px;
    margin-bottom: 12px;
}

/* Review cards */
.review-card {
    opacity: 1 !important;
}

.send-review {
    cursor: pointer;
    display: inline-block;
}

/* Success Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.success-modal {
    background: white;
    border-radius: 16px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
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

.success-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: white;
    margin: 0 auto 24px;
    font-weight: bold;
}

.success-modal h3 {
    font-size: 28px;
    color: #1f2937;
    margin: 0 0 16px 0;
    font-weight: 600;
}

.success-modal p {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 12px 0;
    line-height: 1.6;
}

.success-note {
    font-size: 14px;
    color: #9ca3af;
    font-style: italic;
    margin-bottom: 32px !important;
}

.success-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    max-width: 200px;
}

.success-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.success-btn:active {
    transform: translateY(0);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .success-modal,
.modal-leave-active .success-modal {
    transition: transform 0.3s ease;
}

.modal-enter-from .success-modal,
.modal-leave-to .success-modal {
    transform: scale(0.9);
}
</style>