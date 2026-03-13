<!-- src/views/HomePage.vue -->
<template>
  <div>
    <HeroSection/>
    <Availability @open-booking="handleOpenBooking" />

    <InfoStrip/>
    <Experience/>
    <!-- <Accomodations/> -->
    <Why/>
    <Families/>
    <Reviews/>
    <BookingModal/>
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
import Availability from '@/components/Homepage/Availability.vue'
import BookingModal from '@/modal/BookingModal.vue'


export default {
  name: 'HomePage',
  components: {
    HeroSection,
    InfoStrip,
    Experience,
    Availability,
    Accomodations,
    Why,
    Families,
    Reviews,
    BookingModal
  }
}
</script>

<script setup>
  import { useBooking } from '@/utils/useBooking'

const { openBooking } = useBooking()

const handleOpenBooking = (room, date, type, reservations) => {
  // Pass reservations to the booking modal
  openBooking(room, date, type, reservations)
}
</script>