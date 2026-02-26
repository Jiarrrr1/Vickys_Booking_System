// src/composables/useGalleryFilter.js
import { ref } from 'vue'

const activeFilter = ref('all')

export function useGalleryFilter() {
  function setFilter(filter) {
    activeFilter.value = filter
  }

  return { activeFilter, setFilter }
}