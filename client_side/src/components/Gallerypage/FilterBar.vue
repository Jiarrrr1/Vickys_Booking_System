<!-- FilterBar.vue -->
<template>
  <div id="filter-bar">
    <div class="filter-inner">
      <button
        v-for="tab in tabs"
        :key="tab.filter"
        class="filter-btn"
        :class="{ active: activeFilter === tab.filter }"
        @click="setFilter(tab.filter)"
      >
        {{ tab.label }} <span class="filter-count">{{ tab.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGalleryFilter } from '@/utils/useGalleryFilter'

const { activeFilter, setFilter } = useGalleryFilter()

const tabs = [
  { filter: 'all',      label: 'All',                  count: 24 },
  { filter: 'exterior', label: 'Exterior & Grounds',   count: 9  },
  { filter: 'pools',    label: 'Pools',                count: 6  },
  { filter: 'rooms', label: 'Rooms',             count: 5  },
    { filter: 'cottages', label: 'Cottages',             count: 9  },

]
</script>