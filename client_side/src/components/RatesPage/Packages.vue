<template>
<section class="rate-section" id="pool-section">
    <div class="rate-section-header fade-up visible">
      <div>
        <div class="rate-section-num">Section I</div>
        <h2 class="rate-section-title">Private Pool Rentals<br><span style="color:var(--gold);font-style:italic;font-size:0.75em;">Exclusive Use</span></h2>
      </div>
      <p class="rate-section-desc">Perfect for birthdays, reunions, team gatherings, and private celebrations.</p>
    </div>

    <div class="inclusions-banner fade-up visible">
      <span class="inclusions-banner-icon">🎉</span>
      <div class="inclusions-banner-text">
        <strong>All packages include:</strong>
        Event pool venue, tables, chairs, grill, and videoke — everything you need for an unforgettable celebration.
      </div>
    </div>

    <div class="packages-grid">
      
    
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="package-card fade-up visible"
        :class="{ featured: pkg.featured }"
      >
        <div v-if="pkg.featured" class="package-featured-badge">{{ pkg.featuredLabel }}</div>

        <div class="package-top">
          <div class="package-icon">{{ pkg.icon }}</div>
          <div class="package-name">{{ pkg.name }}</div>
          <div class="package-capacity">👥 {{ pkg.capacity }}</div>
          <div class="package-inclusions">{{ pkg.subtitle }}</div>
        </div>

        <div class="package-body">
          <div class="package-inclusions-label">Inclusions</div>
          <div
            v-for="inclusion in pkg.inclusions"
            :key="inclusion"
            class="inclusion-row"
          >
            <span class="inclusion-icon">✦</span> {{ inclusion }}
          </div>

          <div class="package-rates">
            <div class="rate-row day">
              <div class="rate-time">
                <span class="rate-time-label">☀ {{ pkg.rates.day.label }}</span>
                <span class="rate-time-hours">{{ pkg.rates.day.hours }}</span>
              </div>
              <span class="rate-price">₱{{ pkg.rates.day.price.toLocaleString() }}</span>
            </div>
            <div class="rate-row night">
              <div class="rate-time">
                <span class="rate-time-label">🌙 {{ pkg.rates.night.label }}</span>
                <span class="rate-time-hours">{{ pkg.rates.night.hours }}</span>
              </div>
              <span class="rate-price">₱{{ pkg.rates.night.price.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
  </section>
</template>

<script setup>
import { packages } from '@/data/packages'
</script>