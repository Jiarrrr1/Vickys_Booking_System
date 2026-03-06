// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/admin',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '', // This makes /admin the same as /admin/dashboard
          name: 'AdminDashboard',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'bookings',
          name: 'AdminBookings',
          component: () => import('@/views/BookingsView.vue')
        },
        {
          path: 'feedbacks',
          name: 'AdminFeedbacks',
          component: () => import('@/views/FeedbacksView.vue')
        },
        {
          path: 'payments',
          name: 'AdminPayments',
          component: () => import('@/views/PaymentsView.vue')
        },
        {
          path: 'revenue',
          name: 'AdminRevenue',
          component: () => import('@/views/RevenueView.vue')
        },
         {
          path: 'archives',
          name: 'AdminArchives',
          component: () => import('@/views/TrashView.vue')
        },
        {
          path: 'admins',
          name: 'AdminAdmins',
          component: () => import('@/views/AdminManagementView.vue')
        },
        // {
        //   path: 'settings',
        //   name: 'AdminSettings',
        //   component: () => import('@/views/SettingsView.vue')
        // },
        // {
        //   path: 'profile',
        //   name: 'AdminProfile',
        //   component: () => import('@/views/ProfileView.vue')
        // }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // Check authentication status
  const isAuthenticated = authService.isAuthenticated

  // If route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    return '/admin/login'
  }

  // If route is for guests (login page) and user is already authenticated
  if (requiresGuest && isAuthenticated) {
    return '/admin/dashboard'
  }

  // Otherwise proceed
  return true
})

export default router