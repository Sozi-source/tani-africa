// src/lib/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tani-africa-api.onrender.com/api/v1';

// Add debug flag for development
const isDev = process.env.NODE_ENV === 'development';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  validateStatus: function (status) {
    // Accept all status codes (we'll handle them manually)
    return true;
  },
});

// Request interceptor — attaches Bearer token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log request in development
    if (isDev) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error: unknown): Promise<unknown> => {
    if (isDev) {
      console.error('Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor — handles all responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (isDev) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    // If status is 200-299, return data
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    
    // For 400 status, it might still be valid data
    // Check if the response contains data (like jobs list)
    if (response.status === 400 && response.data) {
      // If it's an array or has data property, it might be a valid response
      if (Array.isArray(response.data) || response.data.data) {
        console.warn(`⚠️ Received 400 but data exists:`, response.data);
        return response.data;
      }
    }
    
    // Otherwise, reject with error
    return Promise.reject(response);
  },
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log error in development
    if (isDev) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Don't redirect if already on login page
      const isLoginPage = window.location.pathname.includes('/auth/login');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
      
      if (!isLoginPage && !isRefreshRequest) {
        window.location.href = '/auth/login?session=expired';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }
    
    // Handle 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response?.data);
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check your connection');
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    
    // Return the error response data if available, otherwise the error
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;