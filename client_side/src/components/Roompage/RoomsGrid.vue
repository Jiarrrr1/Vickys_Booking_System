<!-- RoomsSection.vue -->
<template>
  <section id="rooms-section">
    <div class="rooms-page-inner">
      <div class="rooms-page-header fade-up visible">
        <div>
          <div class="section-label"><span>Choose Your Stay</span></div>
          <h2>Available Rooms</h2>
        </div>
        <p>All rooms include pool access and are fully air-conditioned for your comfort.</p>
      </div>

      <div class="rooms-grid">
        <div
          v-for="(room, index) in rooms"
          :key="room.id"
          class="rc fade-up visible"
          :class="`fade-up-delay-${index + 1}`"
        >
          <div class="rc-img">
            <img :src="room.img" :alt="room.name">
            <div class="rc-img-label">{{ room.shortName.split(' ')[0] }}</div>
          </div>
          <div class="rc-body">
            <span class="rc-badge">Room · 0{{ room.id }} of 04</span>
            <h3 class="rc-name">{{ room.shortName }}</h3>
            <p class="rc-capacity">Good for {{ room.capacity }}</p>
            <div class="rc-amenities">
              <div class="rc-amenity" v-for="amenity in room.amenities" :key="amenity">
                <span class="rc-amenity-dot"></span>{{ amenity }}
              </div>
            </div>
            <div class="rc-footer">
              <div>
                <div class="rc-price">₱{{ room.price.toLocaleString() }}</div>
                <div class="rc-price-label">per night</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { rooms } from '@/data/rooms'
import { useBooking } from '@/utils/useBooking'

const { openBooking } = useBooking()
</script>