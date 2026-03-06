// src/services/adminApi.js
import axios from 'axios'
import router from '@/router'

// ==========================================
// AXIOS INSTANCE CONFIGURATION
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export const adminClient = axios.create({  // Make sure to export this
  baseURL: API_BASE_URL,
  // timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
})

// ==========================================
// REQUEST INTERCEPTOR - Add token to requests
// ==========================================

adminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

// ==========================================
// RESPONSE INTERCEPTOR - Handle errors
// ==========================================

adminClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      router.push('/admin/login')
    }
    return Promise.reject(error)
  }
)

// ==========================================
// AUTHENTICATION API
// ==========================================

export const adminAuth = {
  login: (credentials) => adminClient.post('/admin/login', credentials),
  logout: () => adminClient.post('/admin/logout'),
  verify: () => adminClient.get('/admin/verify'),
  changePassword: (data) => adminClient.post('/admin/change-password', data)
}

// ==========================================
// PROFILE API
// ==========================================

export const adminProfile = {
  getProfile: () => adminClient.get('/admin/profile'),
  updateProfile: (data) => adminClient.put('/admin/profile', data)
}

// ==========================================
// ADMIN MANAGEMENT API
// ==========================================

export const adminManagement = {
  create: (data) => adminClient.post('/admin/createAdmin', data),
  getAll: () => adminClient.get('/admin/getAlladmins'),
  getById: (id) => adminClient.get(`/admin/getAdmin/${id}`),
  update: (id, data) => adminClient.put(`/admin/updateAdmins/${id}`, data),
  delete: (id) => adminClient.delete(`/admin/deleteAdmins/${id}`)
}

// ==========================================
// PAYMENTS API
// ==========================================

export const paymentsAPI = {
  getAll: (params) => adminClient.get('/admin/getAllPayments', { params }),
  getById: (id) => adminClient.get(`/admin/getPayment/${id}`),
  getByBooking: (reservationId) => adminClient.get(`/admin/getPaymentsByReservation/${reservationId}`),
  create: (id, data) => adminClient.post(`/admin/createPayment/${id}`, data),
  updateStatus: (id, status) => adminClient.patch(`/admin/updatePaymentStatus/${id}`, { status }),
  update: (id, data) => adminClient.put(`/admin/updatePayment/${id}`, data),
  delete: (id) => adminClient.delete(`/admin/deletePayment/${id}`),
  getStats: () => adminClient.get('/admin/getPaymentStats'),
  getByDateRange: (params) => adminClient.get('/admin/getPaymentsByDateRange', { params })
}

// ==========================================
// EXPORT ALL
// ==========================================

export default {
  auth: adminAuth,
  profile: adminProfile,
  management: adminManagement,
  payments: paymentsAPI,  // ✅ Now included
  client: adminClient
}