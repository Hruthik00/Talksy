import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with environment-based API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log("API URL being used:", API_URL);

// Create axios instance with the correct backend URL
export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000, // Increased timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Keep track of displayed error messages to prevent duplicates
const displayedErrors = new Set();
const ERROR_EXPIRY = 5000; // 5 seconds

// Add request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Log the request URL for debugging
        console.log(`Request to: ${config.baseURL}${config.url}`);
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
        return response;
    },
    (error) => {
        // Generate a unique error key
        const errorKey = `${error.config?.url}-${error.response?.status || 'network'}-${Date.now()}`;
        
        // Only show toast if this exact error hasn't been shown recently
        if (!displayedErrors.has(errorKey)) {
            displayedErrors.add(errorKey);
            
            // Remove the error key after expiry time
            setTimeout(() => {
                displayedErrors.delete(errorKey);
            }, ERROR_EXPIRY);
            
            if (!error.response) {
                console.error('Network Error:', error);
                // Don't show toast for network errors on auth/check endpoint
                if (!error.config?.url?.includes('/auth/check')) {
                    toast.error('Network error. Please check your connection.');
                }
            } else if (error.response.status === 401) {
                console.error('Authentication Error:', error);
                // Don't show toast for auth/check endpoint
                if (!error.config?.url?.includes('/auth/check')) {
                    toast.error('Session expired. Please log in again.');
                }
            } else if (error.response.status === 404) {
                console.error('Not Found Error:', error.config?.url);
                // Don't show toast for common background requests
                if (!error.config?.url?.includes('/auth/check')) {
                    toast.error('Resource not found.');
                }
            } else {
                console.error('API Error:', error);
                const errorMessage = error.response?.data?.error || 'An error occurred. Please try again.';
                toast.error(errorMessage);
            }
        }
        
        return Promise.reject(error);
    }
);