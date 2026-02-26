<!-- GalleryPools.vue -->
<template>
  <section 
  v-show="activeFilter === 'all' || activeFilter === 'rooms'"
    class="gallery-section"
    id="sec-roomw"
    data-section="rooms"
    style="background: var(--charcoal-mid);">
    <div class="section-inner">
      <div class="section-header fade-up visible">
        <div>
          <div class="section-label-pill">
            <span>Rooms</span>
          </div>
          <h2 class="section-title">
            Private<em style="font-family:'Playfair Display',serif;font-style:italic;color:var(--gold-light)">Sanctuary</em>
          </h2>
        </div>
        <span class="section-count">{{ roomPhotos.length }} Photos</span>
      </div>

      <div class="grid-pools fade-up visible">
        <div
          v-for="(photo, index) in roomPhotos"
          :key="photo.src"
          class="gi"
          :class="photo.gridClass"
          :data-src="photo.src"
          :data-caption="photo.caption"
        >
          <img :src="photo.src" :alt="`Room View ${index + 1}`" loading="lazy">
          <div class="gi-overlay"><div class="gi-overlay-icon">⤢</div></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useGalleryFilter } from '@/utils/useGalleryFilter'

const { activeFilter, setFilter } = useGalleryFilter()

import img1 from '@/assets/gallery/90066624a143ce19307d0a2e2743b67cd8c77288.png'
import img2 from '@/assets/gallery/8c46d9e3240c9aa2319246299ed08a3b82280d99.png'
import img3 from '@/assets/gallery/daca7b5bb1ae1e4395f30fdc4a5bc1c5a15cdfa1.png'
import img4 from '@/assets/gallery/623a077aa66ae91e7a8fb0b35e415a2b874e391a.png'
import img5 from '@/assets/gallery/6e6b6e5e3b19d5deb5ed88163212117e89cba45e.png'

const roomPhotos = [
  { src: img1, caption: 'Room View', gridClass: 'gp-1' },
  { src: img2, caption: 'Room View', gridClass: 'gp-2' },
  { src: img3, caption: 'Room View', gridClass: 'gp-3' },
  { src: img4, caption: 'Room View', gridClass: 'gp-4' },
  { src: img5, caption: 'Room View', gridClass: 'gp-5' },
]
</script>