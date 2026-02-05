import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'bookings',
        name: 'Bookings',
        component: () => import('../views/Bookings.vue'),
      },
      {
        path: 'payments',
        name: 'Payments',
        component: () => import('../views/Payments.vue'),
      },
      {
        path: 'feedbacks',
        name: 'Feedbacks',
        component: () => import('../views/Feedbacks.vue'),
      },
      // Add other routes here
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// REMOVE the auth guard completely
// router.beforeEach((to, from, next) => {
//   // No authentication check
//   next()
// })

export default router
