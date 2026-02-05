<template>
  <span :class="`px-3 py-1 rounded-full text-xs ${getStatusColor(status)}`">
    {{ status }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    default: 'Pending'
  }
})

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-100 text-green-700'
    case 'Pending':
      return 'bg-amber-100 text-amber-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
}
</script>