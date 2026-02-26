<!-- src/views/AboutPage.vue -->
<template>
  <HeroSection/>
  <Story/>
  <MissionVision/>
  <Contact/>
  <TermsAndPolicies/>
  <Faq/>
  <CTA/>
</template>

<script>
import Contact from '@/components/Aboutpage/Contact.vue';
import CTA from '@/components/Aboutpage/CTA.vue';
import Faq from '@/components/Aboutpage/Faq.vue';
import HeroSection from '@/components/Aboutpage/HeroSection.vue';
import MissionVision from '@/components/Aboutpage/MissionVision.vue';
import Story from '@/components/Aboutpage/Story.vue';
import TermsAndPolicies from '@/components/Aboutpage/TermsAndPolicies.vue';

export default {
  name: 'AboutPage',
  components: {
    HeroSection,
    Story,
    MissionVision,
    Contact,
    TermsAndPolicies,
    Faq,
    CTA
  }
}
</script>