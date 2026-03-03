<template>
  <!-- TOP HEADER BAR -->
  <header class="header">
    <div class="htitle-wrap shead">
      <div class="htitle">{{ title }}</div>
      <div class="hsub">{{ subtitle }}</div>
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