<!-- src/views/HomePage.vue -->
<template>
  <div>
    <HeroSection/>
    <InfoStrip/>
    <Experience/>
    <Accomodations/>
    <Why/>
    <Families/>
    <Reviews/>
  </div>
</template>

<script>
import HeroSection from '@/components/Homepage/HeroSection.vue';
import InfoStrip from '@/components/Homepage/InfoStrip.vue';
import Experience from '@/components/Homepage/Experience.vue';
import Accomodations from '@/components/Homepage/Accomodations.vue';
import Why from '@/components/Homepage/Why.vue';
import Families from '@/components/Homepage/Families.vue';
import Reviews from '@/components/Homepage/Reviews.vue';

export default {
  name: 'HomePage',
  components: {
    HeroSection,
    InfoStrip,
    Experience,
    Accomodations,
    Why,
    Families,
    Reviews
  }
}
</script>