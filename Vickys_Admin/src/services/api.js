// src/services/api.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});


// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        
        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            switch (error.response.status) {
                case 401:
                    console.error('Unauthorized - Please login again');
                    break;
                case 403:
                    console.error('Forbidden - You don\'t have permission');
                    break;
                case 404:
                    console.error('Endpoint not found');
                    break;
                case 500:
                    console.error('Server error - Please try again later');
                    break;
                default:
                    console.error('Request failed with status:', error.response.status);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from server - Check your connection');
        } else {
            // Something else happened
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Reservation API calls
export const reservationApi = {
    // Create new reservation
    createReservation: (reservationData) => 
        api.post('/reservations', reservationData),
};

// Export the api instance if needed elsewhere
export default api;