<!-- FAQ.vue -->
<template>
  <section id="faq">
    <div class="faq-inner">
      <div class="faq-header fade-up visible">
        <div class="section-label-center" style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
          <span style="width:40px;height:1px;background:var(--gold);display:block;"></span>
          <span style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:500;">Common Questions</span>
          <span style="width:40px;height:1px;background:var(--gold);display:block;"></span>
        </div>
        <h2>Frequently Asked<br>
          <span style="font-family:'Playfair Display',serif;font-style:italic;color:var(--gold-light);">Questions</span>
        </h2>
        <p style="margin-top:16px;">Everything you need to know before your visit.</p>
      </div>

      <div class="faq-list fade-up visible">
        <div
          v-for="(item, index) in faqs"
          :key="index"
          class="faq-item"
          :class="{ open: openIndex === index }"
        >
          <button class="faq-question" @click="toggle(index)">
            <span class="faq-q-text">{{ item.question }}</span>
            <span class="faq-icon">{{ openIndex === index ? '−' : '+' }}</span>
          </button>
          <div
            class="faq-answer"
            :style="{ maxHeight: openIndex === index ? getHeight(index) : '0px' }"
            :ref="el => setRef(el, index)"
          >
            <div class="faq-answer-inner">{{ item.answer }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const faqs = [
  {
    question: 'Do you accept walk-ins?',
    answer: 'Yes, we accept walk-in guests only if there is no existing private reservation for the selected date. Walk-in rates apply — ₱100 per head for daytime, ₱200 for nighttime.'
  },
  {
    question: "What's included in the entrance fee?",
    answer: 'The entrance fee includes access to the swimming pool and common resort areas. Cottages, rooms, and additional amenities are subject to separate rental fees.'
  },
  {
    question: 'Can I book without renting a room?',
    answer: 'Yes. Guests may avail of pool access or private pool packages without renting rooms. Room rentals are entirely optional.'
  },
  {
    question: 'What are the cancellation and rebooking policies?',
    answer: 'All bookings are non-refundable. However, guests may rebook to alternative available dates by contacting our resort staff, subject to availability.'
  },
  {
    question: 'Is there a cottage rental fee?',
    answer: 'Yes. Cottage rentals are optional and charged separately depending on the selected type and availability. See our Rates & Packages page for full pricing.'
  },
  {
    question: 'What time is check-in and check-out?',
    answer: 'Check-in and check-out times vary depending on the selected package. Guests are advised to coordinate directly with our resort staff for exact schedules prior to arrival.'
  }
]

const openIndex = ref(null)
const answerRefs = ref([])

function setRef(el, index) {
  if (el) answerRefs.value[index] = el
}

function getHeight(index) {
  const el = answerRefs.value[index]
  return el ? el.scrollHeight + 48 + 'px' : 'auto'
}

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>