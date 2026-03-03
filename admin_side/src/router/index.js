// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Import the auth service - adjust the path based on your actual file name
import authService from '@/services/auth' // if file is auth.js
// OR
// import authService from '@/services/authService' // if file is authService.js

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'bookings',
          name: 'Bookings',
          component: () => import('@/views/BookingsView.vue')
        },
        {
          path: 'payments',
          name: 'Payments',
          component: () => import('@/views/PaymentsView.vue')
        },
        {
          path: '/feedbacks',
          name: 'Feedbacks',
          component: () => import('@/views/FeedbacksView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'revenue',
          name: 'Revenue',
          component: () => import('@/views/RevenueView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// router/index.js or router/admin.js
router.beforeEach(async (to, from) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    const isAuthenticated = authService.isAuthenticated
    if (!isAuthenticated) {
      return 'api/v1/admin/login' // ✅ Return the path instead of next()
    }
    // Otherwise continue
  }
})

export default router