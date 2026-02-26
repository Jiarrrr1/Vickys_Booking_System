<!-- CTA.vue -->
<template>
  <section id="cta">
    <div class="cta-inner fade-up visible">
      <p class="cta-eyebrow">✦ &nbsp; Plan Your Stay &nbsp; ✦</p>
      <h2 class="cta-title">Your Perfect Getaway<br><em>Awaits You</em></h2>
      <p class="cta-sub">
        Have questions or ready to reserve? Our team is here to help make your experience
        smooth and enjoyable from the moment you reach out.
      </p>
      <div class="cta-btns">
        <RouterLink to="/rooms" class="btn-primary">📅 Book Now</RouterLink>
        <a href="#contact" class="btn-outline">📞 Contact Us</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>