<template>
  <div id="app">
    <Header />
    <HeroSection />
    <Features />
    <Rooms />
    <About />
    <Reviews />
    <Footer />
  </div>
</template>



<script>
import Header from './components/Header.vue'
import HeroSection from './components/HeroSection.vue'
import Features from './components/Features.vue'
import Rooms from './components/Rooms.vue'
import About from './components/About.vue'
import Reviews from './components/Reviews.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    HeroSection,
    Features,
    Rooms,
    About,
    Reviews,
    Footer
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Ms+Madi&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&display=swap');

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
</style>