<!-- App.vue -->
<template>
  <NavigationBar/>
  <router-view/>  <!-- This will render the current page component -->
  <Footer/>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    NavigationBar,
    Footer
  }
}
</script>

<style>
/* Your global styles here */
</style>