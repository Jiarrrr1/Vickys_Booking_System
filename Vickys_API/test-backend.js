// test-backend.js
import axios from 'axios'

const BACKEND_URL = 'http://localhost:3001/api/v1'

const endpoints = [
  '/admin/login',
  '/login',
  '/auth/login',
  '/admins/login',
  '/api/admin/login',
  '/admin/signin',
  '/signin'
]

async function testEndpoints() {
  console.log('🔍 Testing backend endpoints...\n')
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${BACKEND_URL}${endpoint}`)
      const response = await axios({
        method: 'post',
        url: `${BACKEND_URL}${endpoint}`,
        data: {
          email: 'admin@test.com',
          password: 'password'
        },
        timeout: 3000,
        validateStatus: false
      })
      
      console.log(`Status: ${response.status}`)
      if (response.status !== 404) {
        console.log('✅ Endpoint exists!')
        console.log('Response:', response.data)
      } else {
        console.log('❌ Not found')
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend not running on port 3001')
        break
      }
      console.log(`Error: ${error.message}`)
    }
    console.log('---\n')
  }
}

testEndpoints()