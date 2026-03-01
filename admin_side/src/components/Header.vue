<template>
  <!-- TOP HEADER BAR -->
  <header class="header">
    <div class="htitle-wrap">
      <div class="htitle">{{ title }}</div>
      <div class="hsub">{{ subtitle }}</div>
    </div>

    <!-- Global search -->
    <div class="hbox">
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" placeholder="Search anything…" />
    </div>

    <!-- Notification bell -->
    <div class="hicon">
      <svg viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="ndot"></span>
    </div>

    <!-- Live date chip -->
    <div class="datechip">{{ currentDate }}</div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  subtitle: {
    type: String,
    default: 'Welcome back!'
  }
})

const currentDate = ref('')

// Format and set current date
const updateDate = () => {
  const date = new Date()
  currentDate.value = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  updateDate()
})
</script>

<style scoped>
/* Header styles are in base.css */
</style>