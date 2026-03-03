// src/services/adminApi.js
import axios from 'axios'
import router from '@/router'

// ==========================================
// AXIOS INSTANCE CONFIGURATION
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

const adminClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
    return config
  },
  (error) => Promise.reject(error)
)

// ==========================================
// RESPONSE INTERCEPTOR - Handle errors
// ==========================================

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
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
  // POST /admin/login
  login: (credentials) => adminClient.post('/login', credentials),
  
  // POST /admin/logout
  logout: () => adminClient.post('/logout'),
  
  // GET /admin/verify
  verify: () => adminClient.get('/verify'),
  
  // POST /admin/change-password
  changePassword: (data) => adminClient.post('/change-password', data)
}

// ==========================================
// PROFILE API
// ==========================================

export const adminProfile = {
  // GET /admin/profile
  getProfile: () => adminClient.get('/profile'),
  
  // PUT /admin/profile
  updateProfile: (data) => adminClient.put('/profile', data)
}

// ==========================================
// ADMIN MANAGEMENT API
// ==========================================

export const adminManagement = {
  // POST /admin/createAdmin
  create: (data) => adminClient.post('/createAdmin', data),
  
  // GET /admin/getAlladmins
  getAll: () => adminClient.get('/getAlladmins'),
  
  // GET /admin/getAdmin/:id
  getById: (id) => adminClient.get(`/getAdmin/${id}`),
  
  // PUT /admin/updateAdmins/:id
  update: (id, data) => adminClient.put(`/updateAdmins/${id}`, data),
  
  // DELETE /admin/deleteAdmins/:id
  delete: (id) => adminClient.delete(`/deleteAdmins/${id}`)
}

// ==========================================
// EXPORT ALL
// ==========================================

export default {
  auth: adminAuth,
  profile: adminProfile,
  management: adminManagement,
  client: adminClient
}