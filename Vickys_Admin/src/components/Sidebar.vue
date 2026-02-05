<template>
  <aside class="w-64 bg-white border-r border-neutral-200 flex flex-col">
    <div class="p-6 border-b border-neutral-200">
      <h1 class="text-xl text-neutral-800">Vicky's Resort</h1>
      <p class="text-sm text-neutral-500 mt-1">Admin Dashboard</p>
    </div>

    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.id">
          <button
            @click="() => handleNavigate(item.id)"
            :class="`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === item.id
                ? 'bg-green-50 text-green-700'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="p-4 border-t border-neutral-200">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        <LogOut class="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Calendar, Bed, Users, CreditCard, BarChart3, LogOut } from 'lucide-vue-next'

const props = defineProps({
  activeSection: String,
})

const emit = defineEmits(['navigate', 'logout'])

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
//   { id: 'customers', label: 'Customers', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'feedbacks', label: 'Feedbacks', icon: BarChart3 },
]

const handleNavigate = (section) => {
  emit('navigate', section)
}

const handleLogout = () => {
  emit('logout')
}
</script>