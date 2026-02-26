<!-- src/views/GalleryPage.vue -->
<template>
  <HeroSection/>
  <FilterBar/>
  <GallerySection/>
</template>

<script>
import FilterBar from '@/components/Gallerypage/FilterBar.vue';
import GallerySection from '@/components/Gallerypage/GallerySection.vue';
import HeroSection from '@/components/Gallerypage/HeroSection.vue';

export default {
  name: 'GalleryPage',
  components: {
    HeroSection,
    FilterBar,
    GallerySection
  }
}
</script>