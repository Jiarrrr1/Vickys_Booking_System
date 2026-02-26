<!-- src/views/RatesPage.vue -->
<template>
  <HeroSection/>
  <StickyTab/>
  
    <RateSection/>
  
</template>

<script>
import HeroSection from '@/components/RatesPage/HeroSection.vue';
import RateSection from '@/components/RatesPage/RateSection.vue';
import StickyTab from '@/components/RatesPage/StickyTab.vue';

export default {
  name: 'RatesPage',
  components: {
    HeroSection,
    StickyTab,
    RateSection
  }
}
</script>