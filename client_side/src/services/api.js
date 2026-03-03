// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

console.log('🔌 API Service Initialized');
console.log('📡 API Base URL:', API_BASE_URL);

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Log the request
  console.log(`➡️  Making ${options.method || 'GET'} request to:`, url);
  if (options.body) {
    console.log('📦 Request data:', JSON.parse(options.body));
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  try {
    const startTime = Date.now();
    const response = await fetch(url, { ...defaultOptions, ...options });
    const endTime = Date.now();
    
    // Log response time
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    
    // Log response status
    console.log(`📥 Response status:`, response.status, response.statusText);
    
    const data = await response.json();
    
    // Log success
    console.log(`✅ Request successful:`, data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    // Log error details
    console.error(`❌ Request failed:`, error.message);
    console.error(`🔍 Failed URL:`, url);
    
    // Special handling for connection refused
    if (error.message === 'Failed to fetch') {
      console.error('🚨 Cannot connect to backend server!');
      console.error('💡 Make sure your backend is running on:', API_BASE_URL);
      console.error('💡 Try: cd backend && npm start');
    }
    
    throw error;
  }
}

// Simple connection test function
export async function testConnection() {
  console.log('🔄 Testing backend connection...');
  try {
    const response = await apiRequest('/health');
    console.log('🎉 Backend is connected and running!');
    console.log('📊 Server info:', response);
    return true;
  } catch (error) {
    console.log('❌ Backend connection failed');
    return false;
  }
}

export const api = {
  // Health check
  health: () => apiRequest('/health'),
  
  // Reservations
  getAllReservations: () => {
    console.log('📋 Fetching all reservations...');
    return apiRequest('/getAllReservations');
  },
  
  getReservation: (id) => {
    console.log(`🔍 Fetching reservation with ID: ${id}`);
    return apiRequest(`/getReservation/${id}`);
  },
  
  createReservation: (data) => {
    console.log('➕ Creating new reservation...');
    return apiRequest('/createReservation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Feedback
  submitFeedback: (data) => {
    console.log('💬 Submitting feedback...');
    return apiRequest('/createFeedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Auto-test connection when service loads
testConnection();