<template>
    <section id="reviews">
        <div class="reviews-inner">
            <div class="reviews-top fade-up visible">
                <div class="section-label" style="justify-content:center"><span>Guest Reviews</span></div>
                <h2>What Our Guests Say</h2>
                <p>Hear what our guests have to say about their stay at Vicky's Resort</p>
            </div>
            <div class="reviews-grid">
                <div class="review-card fade-up visible">
                    <div class="review-quote">"</div>
                    <div class="stars">★★★★★</div>
                    <p class="review-text">"The perfect escape from the city! The countryside setting is so peaceful and
                        the rooms are immaculate. Highly recommended for anyone seeking tranquility."</p>
                    <div>
                        <div class="reviewer-name">Maria Santos</div>
                        <div class="review-date">Manila · November 2024</div>
                    </div>
                </div>
                <div class="review-card fade-up visible">
                    <div class="review-quote">"</div>
                    <div class="stars">★★★★★</div>
                    <p class="review-text">"Vicky's Resort exceeded our expectations. The staff was attentive, the
                        accommodations were clean and cozy, and the booking process was incredibly simple."</p>
                    <div>
                        <div class="reviewer-name">Juan Dela Cruz</div>
                        <div class="review-date">Cebu · November 2024</div>
                    </div>
                </div>
                <div class="review-card fade-up visible">
                    <div class="review-quote">"</div>
                    <div class="stars">★★★★★</div>
                    <p class="review-text">"A hidden gem! We loved the privacy and the warm, welcoming atmosphere. It
                        felt like a home away from home. Can't wait to return next summer."</p>
                    <div>
                        <div class="reviewer-name">Willy Limaco</div>
                        <div class="review-date">Baliuag · March 2025</div>
                    </div>
                </div>
            </div>
            <div class="reviews-bottom fade-up visible">
                <a class="send-review" @click="openModal" :class="buttonClass">
                    <slot>📅 Send Your Insights </slot>
                </a>
            </div>

            <FeedbackModal :is-open="isModalOpen" @close="closeModal" @submit="handleSubmit" />
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue'
import FeedbackModal from '../../modal/FeedbackModal.vue'

// Props for customization
const props = defineProps({
    buttonClass: {
        type: String,
        default: ''
    }
})

// Emits for parent communication
const emit = defineEmits(['feedback-submitted'])

// Local state
const isModalOpen = ref(false)

// Methods
const openModal = () => {
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

const handleSubmit = async (feedbackData) => {
    // Simulate API call (replace with actual API)
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Feedback submitted:', feedbackData)

    // Show success message
    alert('Thank you for your feedback!')

    // Emit event to parent component
    emit('feedback-submitted', feedbackData)

    // Modal will close automatically after submission
    // because the modal emits 'close' after submit
}
</script>
