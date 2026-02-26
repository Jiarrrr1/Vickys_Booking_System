<template>
  <section class="rate-section" id="rooms-section">
    <div class="rate-section-header fade-up visible">
      <div>
        <div class="rate-section-num">Section II</div>
        <h2 class="rate-section-title">
          Air-Conditioned<br>
          <span style="color:var(--gold);font-style:italic;font-size:0.75em;">Rooms</span>
        </h2>
      </div>
      <p class="rate-section-desc">
        Comfortable and affordable lodging for families and small groups.
        All rooms are clean, cozy, and air-conditioned.
      </p>
    </div>

    <div class="rooms-grid">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="room-rate-card fade-up visible"
        :class="{ wide: room.wide }"
        :style="room.wide ? 'border-color: rgba(201,169,110,0.35)' : ''"
      >
        <div class="room-rate-top">
          <div>
            <div
              class="room-rate-name"
              :style="room.wide ? 'font-size: 30px' : ''"
              v-html="room.name.replace('\n', '<br>')"
            ></div>
            <div class="room-rate-capacity">{{ room.capacity }}</div>
          </div>

          <div :class="room.prices.length > 1 ? '' : 'room-price-badge'" :style="room.wide ? 'padding: 14px 28px' : ''">
            <template v-if="room.prices.length === 1">
              <span class="price" :style="room.wide ? 'font-size: 36px' : ''">
                ₱{{ room.prices[0].amount.toLocaleString() }}
              </span>
              <span class="label">{{ room.prices[0].label }}</span>
            </template>

            <template v-else>
              <div
                v-for="(price, i) in room.prices"
                :key="i"
                class="room-price-badge"
                :style="i < room.prices.length - 1 ? 'margin-bottom: 8px' : ''"
              >
                <span class="price" :style="price.small ? 'font-size: 20px' : ''">
                  ₱{{ price.amount.toLocaleString() }}
                </span>
                <span class="label">{{ price.label }}</span>
              </div>
            </template>
          </div>
        </div>

        <div class="room-divider"></div>

        <div class="room-features">
          <div v-for="feature in room.features" :key="feature.label" class="feature-tag">
            <span class="feature-tag-icon">{{ feature.icon }}</span> {{ feature.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { rooms } from '@/data/rooms'
</script>