import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

// Create an Axios instance with base URL and default configs
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Types for environment
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const response = error.response;
    
    // Handle specific error statuses
    if (response) {
      const status = response.status;
      const data = response.data as { message?: string };
      
      // Authentication errors
      if (status === 401) {
        // Clear stored tokens and refresh page to redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login?session_expired=true';
        
        toast.error('Your session has expired. Please log in again.');
      }
      
      // Forbidden
      else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      }
      
      // Not found
      else if (status === 404) {
        toast.error('The requested resource was not found.');
      }
      
      // Server error
      else if (status >= 500) {
        toast.error('A server error occurred. Please try again later.');
      }
      
      // Other errors with a message
      else if (data && data.message) {
        toast.error(data.message);
      }
      
      // Generic error without specific message
      else {
        toast.error('An error occurred. Please try again.');
      }
    }
    // Network errors
    else if (error.request) {
      toast.error('Unable to connect to the server. Please check your internet connection.');
    }
    // Other errors
    else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 