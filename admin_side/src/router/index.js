// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Loginview.vue'),
      meta: { requiresGuest: true } // Only accessible when not logged in
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true }, // Requires authentication
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboardview.vue')
        },
        {
          path: 'bookings',
          name: 'Bookings',
          component: () => import('@/views/Bookingsview.vue')
        },
        {
          path: 'payments',
          name: 'Payments',
          component: () => import('@/views/PaymentsView.vue')
        },
        {
          path: 'revenue',
          name: 'Revenue',
          component: () => import('@/views/RevenueView.vue')
        }
      ]
    },
    {
      // 404 Not Found
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation Guard - Check authentication before each route
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore()
//   const isAuthenticated = authStore.isAuthenticated

//   // Route requires authentication
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next({ name: 'Login' })
//   }
//   // Route is for guests only (login page)
//   else if (to.meta.requiresGuest && isAuthenticated) {
//     next({ name: 'Dashboard' })
//   }
//   // Allow navigation
//   else {
//     next()
//   }
// })

export default router