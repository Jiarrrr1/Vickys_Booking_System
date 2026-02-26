<template>
  <section class="rate-section" id="walkin-section">
    <div class="rate-section-header fade-up visible">
      <div>
        <div class="rate-section-num">Section IV</div>
        <h2 class="rate-section-title">
          Per Head &amp;<br>
          <span style="color:var(--gold);font-style:italic;font-size:0.75em;">Walk-In Rates</span>
        </h2>
      </div>
      <p class="rate-section-desc">
        Available only when no private reservation is in place. Come as you are — you're always welcome.
      </p>
    </div>

    <div class="walkin-grid fade-up visible">
      <div
        v-for="rate in walkinRates"
        :key="rate.id"
        class="walkin-card"
        :class="rate.cardClass"
      >
        <div class="walkin-icon">{{ rate.icon }}</div>
        <span class="walkin-time-label">{{ rate.label }}</span>
        <span class="walkin-time-hours">{{ rate.hours }}</span>
        <div class="walkin-rate">₱{{ rate.rate.toLocaleString() }}</div>
        <span class="walkin-per">per head</span>
      </div>
    </div>

    <div class="walkin-note fade-up visible" style="margin-top: 20px;">
      <span class="walkin-note-icon">ℹ</span>
      <p><strong>Please note:</strong> <span v-html="walkinNote"></span></p>
    </div>
  </section>
</template>

<script setup>
import { walkinRates, walkinNote } from '@/data/walkin'
</script>