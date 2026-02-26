<!-- src/views/RoomPage.vue -->
<template>
  
      <HeroSection/>
      <RoomsGrid/>
    <BookingModal/>


</template>

<script>
import HeroSection from '@/components/Roompage/HeroSection.vue';
import RoomsGrid from '@/components/Roompage/RoomsGrid.vue';
import BookingModal from '@/modal/BookingModal.vue';

export default {
  name: 'RoomPage',
  components: {
    HeroSection,
    RoomsGrid,
    BookingModal
  }
}
</script>