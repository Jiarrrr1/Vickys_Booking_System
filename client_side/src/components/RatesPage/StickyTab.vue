<template>
  <div id="tab-nav">
    <div class="tab-nav-inner">
      <button
        v-for="tab in tabs"
        :key="tab.target"
        class="tab-btn"
        :class="{ active: activeTab === tab.target }"
        @click="scrollToSection(tab.target)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { label: 'Private Pool Rentals', target: 'pool-section' },
  { label: 'A/C Rooms',           target: 'rooms-section' },
  { label: 'Cottages & Extras',   target: 'cottages-section' },
  { label: 'Walk-In Rates',       target: 'walkin-section' }
]

const activeTab = ref('pool-section')

function scrollToSection(id) {
  activeTab.value = id
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>