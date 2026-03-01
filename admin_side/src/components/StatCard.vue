<template>
  <div class="scard" :class="colorClass">
    <div class="stop">
      <div class="sico" :class="colorClass">
        <slot name="icon">
          <!-- Default icon if none provided -->
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </slot>
      </div>
      <span v-if="badge" class="sbadge up">
        <svg viewBox="0 0 24 24">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        {{ badge }}
      </span>
    </div>
    <div class="sval">{{ value }}</div>
    <div class="slbl">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  colorClass: {
    type: String,
    default: 'cg', // cg=green, cb=blue, ca=amber, cr=red
    validator: (value) => ['cg', 'cb', 'ca', 'cr'].includes(value)
  },
  badge: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Stat card styles are in main.css */
</style>