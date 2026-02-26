<!-- GalleryCottages.vue -->
<template>
  <section 
  v-show="activeFilter === 'all' || activeFilter === 'cottages'"
    class="gallery-section"
    id="sec-cottages"
    data-section="cottages">
    <div class="section-inner">
      <div class="section-header fade-up visible">
        <div>
          <div class="section-label-pill">
            <span>Cottages &amp; Accommodations</span>
          </div>
          <h2 class="section-title">Your Home Away<br>From Home</h2>
        </div>
        <span class="section-count">{{ cottagePhotos.length }} Photos</span>
      </div>

      <div class="grid-cottages fade-up visible">
        <div
          v-for="(photo, index) in cottagePhotos"
          :key="photo.src"
          class="gi"
          :class="photo.gridClass"
          :data-src="photo.src"
          :data-caption="photo.caption"
        >
          <img :src="photo.src" :alt="`Cottage View ${index + 1}`" loading="lazy">
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
import img2 from '@/assets/gallery/28f9606e4d8ce40f40b81795d599e80b19ec64eb.png'
import img3 from '@/assets/gallery/30b9e9833ee9fdabae2071699cc439051cb4331d.png'
import img4 from '@/assets/gallery/81ea9454e403880d46f60dedca4c310edb633542.png'
import img5 from '@/assets/gallery/3f069435942982a6b1d93f39f6a5a138cdc9cf7b.png'
import img6 from '@/assets/gallery/b767ceecc5f8dc693bf52cbcdaa532ad08d870c5.png'
import img7 from '@/assets/gallery/72b689992e3a1054bb77f2be8eb7c2137715ced2.png'
import img8 from '@/assets/gallery/d6e5bba840d225069dea9926fa0c14fc2e296865.png'
import img9 from '@/assets/gallery/639bb6bfd2241b12ced399f0847d2485be389c98.png'

const cottagePhotos = [
  { src: img1, caption: 'Cottage View', gridClass: 'gc-1' },
  { src: img2, caption: 'Cottage View', gridClass: 'gc-2' },
  { src: img3, caption: 'Cottage View', gridClass: 'gc-3' },
  { src: img4, caption: 'Cottage View', gridClass: 'gc-4' },
  { src: img5, caption: 'Cottage View', gridClass: 'gc-5' },
  { src: img6, caption: 'Cottage View', gridClass: 'gc-6' },
  { src: img7, caption: 'Cottage View', gridClass: 'gc-7' },
  { src: img8, caption: 'Cottage View', gridClass: 'gc-8' },
  { src: img9, caption: 'Cottage View', gridClass: 'gc-9' },
]
</script>