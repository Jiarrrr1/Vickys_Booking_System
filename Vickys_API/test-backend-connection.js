// test-backend-connection.js
const axios = require('axios')

const BACKEND_URL = 'http://localhost:3001/api/v1'

async function testConnection() {
  console.log('🔍 Testing backend connection...\n')
  
  // Test 1: Check if server is running
  try {
    console.log('1. Testing server connection...')
    await axios.get('http://localhost:3001/health', { timeout: 3000 })
    console.log('✅ Server is running on port 3001\n')
  } catch (error) {
    console.log('❌ Server not running on port 3001')
    console.log('   Make sure your backend is running on port 3001\n')
    return
  }
  
  // Test 2: Try login endpoint
  try {
    console.log('2. Testing login endpoint...')
    const response = await axios.post(`${BACKEND_URL}/login`, {
      email: 'test@example.com',
      password: 'test123'
    }, {
      timeout: 3000,
      validateStatus: false
    })
    
    console.log(`   Status: ${response.status}`)
    if (response.status === 200) {
      console.log('✅ Login endpoint exists and is accessible')
      console.log('   Response structure:', Object.keys(response.data))
    } else if (response.status === 404) {
      console.log('❌ Login endpoint not found (404)')
    } else if (response.status === 400) {
      console.log('⚠️ Login endpoint exists but requires valid credentials')
    } else {
      console.log(`   Unexpected status: ${response.status}`)
    }
  } catch (error) {
    console.log('❌ Error testing login endpoint:', error.message)
  }
  
  // Test 3: Check all available endpoints
  console.log('\n3. Available endpoints from your routes:')
  const endpoints = [
    '/login',
    '/logout',
    '/verify',
    '/profile',
    '/change-password',
    '/getAlladmins',
    '/createAdmin'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        timeout: 2000,
        validateStatus: false
      })
      console.log(`   ${endpoint}: ${response.status !== 404 ? '✅ Found' : '❌ Not found'}`)
    } catch {
      console.log(`   ${endpoint}: ⚠️ Could not test`)
    }
  }
}

testConnection()