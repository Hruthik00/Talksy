import axios from 'axios';
import toast from 'react-hot-toast';

// Get the API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log("API URL:", API_URL);

// Create axios instance with the correct backend URL
export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000, // Increased timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You can modify request config here (add tokens, etc.)
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx
        return response;
    },
    (error) => {
        // Any status codes outside the range of 2xx
        const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
        
        if (!error.response) {
            console.error('Network Error:', error);
            toast.error('Network error. Please check your connection.');
        } else if (error.response.status === 401) {
            console.error('Authentication Error:', error);
            // Handle unauthorized access
        } else if (error.response.status === 404) {
            console.error('Not Found Error:', error);
            toast.error('Resource not found.');
        } else {
            console.error('API Error:', error);
            toast.error(errorMessage);
        }
        
        return Promise.reject(error);
    }
);