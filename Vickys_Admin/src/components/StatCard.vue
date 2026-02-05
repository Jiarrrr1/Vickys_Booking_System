<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-neutral-600 mb-1">{{ title }}</p>
        <p class="text-3xl text-neutral-800">{{ value }}</p>
      </div>
      <div :class="`p-3 rounded-full ${iconColor} bg-opacity-10`">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  value: number
  icon: Component
  iconColor: string
}

defineProps<Props>()
</script>