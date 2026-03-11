<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="room-images-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ room?.name || 'Room Images' }}</h2>
          <button class="close-btn" @click="closeModal">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Main Image Gallery -->
          <div class="gallery-container">
            <!-- Main Image Display -->
            <div class="main-image-container">
              <img 
                :src="currentImage.url" 
                :alt="currentImage.alt"
                class="main-image"
              />
              
              <!-- Navigation Arrows -->
              <button 
                v-if="images.length > 1"
                class="nav-arrow prev" 
                @click="prevImage"
              >
                ‹
              </button>
              <button 
                v-if="images.length > 1"
                class="nav-arrow next" 
                @click="nextImage"
              >
                ›
              </button>

              <!-- Image Counter -->
              <div class="image-counter">
                {{ currentIndex + 1 }} / {{ images.length }}
              </div>
            </div>

            <!-- Thumbnail Strip -->
            <div v-if="images.length > 1" class="thumbnail-strip">
              <div 
                v-for="(image, index) in images" 
                :key="image.id"
                class="thumbnail"
                :class="{ active: currentIndex === index }"
                @click="currentIndex = index"
              >
                <img :src="image.url" :alt="image.alt" />
              </div>
            </div>
          </div>

          <!-- Room Details Section -->
          <div v-if="room" class="room-details">
            <div class="details-header">
              <span class="room-icon">{{ room.icon }}</span>
              <h3>{{ room.name }}</h3>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Room ID:</span>
                <span class="detail-value">{{ room.roomId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Capacity:</span>
                <span class="detail-value">{{ room.capacity }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Price:</span>
                <span class="detail-value price">₱{{ room.price.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ room.type === 'cottage' ? 'Cottage' : 'Room' }}</span>
              </div>
              <div v-if="room.quantity > 1" class="detail-item">
                <span class="detail-label">Available Units:</span>
                <span class="detail-value">{{ room.quantity }}</span>
              </div>
            </div>

            <div class="description">
              <h4>Description</h4>
              <p>{{ room.description }}</p>
            </div>

            <div class="amenities">
              <h4>Amenities</h4>
              <div class="amenities-list">
                <span v-for="(amenity, idx) in room.amenities" :key="idx" class="amenity-tag">
                  {{ amenity }}
                </span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-cancel" @click="closeModal">Close</button>
              <button class="btn-book" @click="handleBookNow">Book This Room</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getRoomImages } from '@/data/roomImages'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  room: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'book'])

const images = ref([])
const currentIndex = ref(0)

const currentImage = computed(() => {
  if (images.value.length === 0) return { url: '', alt: '' }
  return images.value[currentIndex.value]
})

// Load images when room changes
watch(() => props.room, (newRoom) => {
  if (newRoom) {
    images.value = getRoomImages(newRoom.roomId)
    currentIndex.value = 0
  }
}, { immediate: true })

// Reset when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    currentIndex.value = 0
  }
})

function nextImage() {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

function prevImage() {
  if (images.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

function closeModal() {
  emit('close')
}

function handleOverlayClick() {
  closeModal()
}

function handleBookNow() {
  emit('book', props.room)
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.room-images-modal {
  background: var(--charcoal);
  border: 1px solid var(--gold);
  border-radius: 12px;
  max-width: 1200px;
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gold);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--charcoal-mid);
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--gold);
  font-family: 'Playfair Display', serif;
}

.close-btn {
  background: rgba(201, 169, 110, 0.1);
  border: 1px solid var(--gold);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--gold);
}

.close-btn svg {
  stroke: var(--gold);
  stroke-width: 2;
  width: 20px;
  height: 20px;
}

.close-btn:hover svg {
  stroke: var(--charcoal);
}

.modal-body {
  padding: 24px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  min-height: 0;
  max-height: calc(90vh - 80px);
}

/* Gallery Styles */
.gallery-container {
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.main-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.main-image:hover {
  transform: scale(1.05);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(201, 169, 110, 0.3);
  border: 1px solid var(--gold);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.nav-arrow:hover {
  background: var(--gold);
  color: var(--charcoal);
}

.nav-arrow.prev {
  left: 10px;
}

.nav-arrow.next {
  right: 10px;
}

.image-counter {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.thumbnail-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 100px;
  overflow-y: auto;
  padding: 4px;
  flex-shrink: 0;
}

.thumbnail {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.thumbnail.active {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.3);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Room Details Styles */
.room-details {
  background: var(--charcoal-mid);
  border: 1px solid var(--charcoal-border);
  border-radius: 8px;
  padding: 24px;
  overflow-y: auto;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--charcoal-border);
  flex-shrink: 0;
}

.room-icon {
  font-size: 40px;
}

.details-header h3 {
  margin: 0;
  font-size: 22px;
  color: var(--gold);
  font-family: 'Playfair Display', serif;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  color: var(--white);
  font-weight: 600;
}

.detail-value.price {
  color: var(--gold);
  font-size: 18px;
}

.description {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.description h4,
.amenities h4 {
  color: var(--gold);
  font-size: 16px;
  margin-bottom: 10px;
  font-family: 'Playfair Display', serif;
}

.description p {
  color: var(--white);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  overflow-y: auto;
  max-height: 100px;
  padding-right: 8px;
}

.description p::-webkit-scrollbar {
  width: 4px;
}

.description p::-webkit-scrollbar-thumb {
  background: var(--gold);
  border-radius: 4px;
}

.amenities {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 8px;
}

.amenities::-webkit-scrollbar {
  width: 4px;
}

.amenities::-webkit-scrollbar-thumb {
  background: var(--gold);
  border-radius: 4px;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.amenity-tag {
  font-size: 12px;
  padding: 6px 12px;
  background: rgba(201, 169, 110, 0.1);
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 20px;
  color: var(--white);
  white-space: nowrap;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--charcoal-border);
  flex-shrink: 0;
}

.btn-cancel,
.btn-book {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  border: none;
}

.btn-cancel {
  background: var(--charcoal);
  border: 1px solid var(--charcoal-border);
  color: var(--white);
}

.btn-cancel:hover {
  border-color: var(--gold);
  background: rgba(201, 169, 110, 0.1);
}

.btn-book {
  background: var(--gold);
  border: 1px solid var(--gold);
  color: var(--charcoal);
}

.btn-book:hover {
  background: transparent;
  color: var(--gold);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .thumbnail-strip {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .room-details {
    max-height: 400px;
  }
}
</style>