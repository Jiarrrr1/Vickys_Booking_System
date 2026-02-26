<template>
  <section 
  v-show="activeFilter === 'all' || activeFilter === 'exterior'"
    class="gallery-section"
    id="sec-exterior"
    data-section="exterior">
    <div class="section-inner">
      <div class="section-header fade-up visible">
        <div>
          <div class="section-label-pill">
            <span>Exterior &amp; Grounds</span>
          </div>
          <h2 class="section-title">Where First Impressions Last</h2>
        </div>
        <span class="section-count">{{ exteriorPhotos.length }} Photos</span>
      </div>

      <div class="grid-exterior fade-up visible">
        <div
          v-for="(photo, index) in exteriorPhotos"
          :key="photo.src"
          class="gi"
          :class="photo.gridClass"
          :style="photo.style"
          :data-src="photo.src"
          :data-caption="photo.caption"
        >
          <img :src="photo.src" :alt="`Exterior View ${index + 1}`" loading="lazy">
          <div class="gi-overlay"><div class="gi-overlay-icon">⤢</div></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useGalleryFilter } from '@/utils/useGalleryFilter'

const { activeFilter, setFilter } = useGalleryFilter()

import img1 from '@/assets/gallery/20f49ff92bbad5082f6e6a7e5b1e5f1b60411fb1.png'
import img2 from '@/assets/gallery/50329bed614c4edbbb28efdfc52abfdde852c562.png'
import img3 from '@/assets/gallery/8564cd91e547d8b177996bd69523f2b8aaa2279b.png'
import img4 from '@/assets/gallery/81ea9454e403880d46f60dedca4c310edb633542.png'
import img5 from '@/assets/gallery/a818817254ce1b873d7abb66cc734ac2e6797682.png'
import img6 from '@/assets/gallery/30b9e9833ee9fdabae2071699cc439051cb4331d.png'
import img7 from '@/assets/gallery/5435f1ed7f33017285cb3f409023416c2781d5fc.png'
import img8 from '@/assets/gallery/507f08d4a4a9f96b0dd84d4c90e5508e097da9ca.png'
import img9 from '@/assets/gallery/5ef1c7d4dde970319ccc539850995f51a7cce6d1.png'

const exteriorPhotos = [
  { src: img1, caption: 'Exterior View', gridClass: 'gi-1' },
  { src: img2, caption: 'Exterior View', gridClass: 'gi-2' },
  { src: img3, caption: 'Exterior View', gridClass: 'gi-3' },
  { src: img4, caption: 'Exterior View', gridClass: 'gi-4' },
  { src: img5, caption: 'Exterior View', gridClass: 'gi-5' },
  { src: img6, caption: 'Exterior View', gridClass: 'gi-6' },
  { src: img7, caption: 'Exterior View', gridClass: 'gi-7' },
  { src: img8, caption: 'Exterior View', gridClass: 'gi-extra', style: 'min-height: 280px' },
  { src: img9, caption: 'Exterior View', gridClass: 'gi-extra', style: 'min-height: 280px' },
]
</script>