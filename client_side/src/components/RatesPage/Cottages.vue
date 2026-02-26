<template>
  <section class="rate-section" id="cottages-section">
    <div class="rate-section-header fade-up visible">
      <div>
        <div class="rate-section-num">Section III</div>
        <h2 class="rate-section-title">
          Kubo Cottages<br>
          <span style="color:var(--gold);font-style:italic;font-size:0.75em;">&amp; Extras</span>
        </h2>
      </div>
      <p class="rate-section-desc">
        Additional resting and seating options to make your group's stay more comfortable.
      </p>
    </div>

    <div class="cottages-grid">
      <div
        v-for="cottage in cottages"
        :key="cottage.id"
        class="cottage-card fade-up visible"
        :style="cottage.highlight ? 'border-color: rgba(201,169,110,0.2)' : ''"
      >
        <div class="cottage-emoji">{{ cottage.emoji }}</div>
        <div class="cottage-name">{{ cottage.name }}</div>
        <div class="cottage-type">{{ cottage.type }}</div>
        <div class="cottage-price">₱{{ cottage.price.toLocaleString() }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { cottages } from '@/data/cottages'
</script>