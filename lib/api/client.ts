// src/lib/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tani-africa-api.onrender.com/api/v1';

const isDev = process.env.NODE_ENV === 'development';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  validateStatus: function (status) {
    return true;
  },
});

// Request interceptor — attaches Bearer token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

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

// Response interceptor — returns unwrapped response.data directly
// Return type is `any` so callers can type the result themselves via generics
apiClient.interceptors.response.use(
  (response: AxiosResponse): any => {
    if (isDev) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    // 200-299: return unwrapped data directly
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }

    // 400 with array/data body — treat as valid (e.g. jobs list)
    if (response.status === 400 && response.data) {
      if (Array.isArray(response.data) || response.data.data) {
        console.warn(`⚠️ Received 400 but data exists:`, response.data);
        return response.data;
      }
    }

    return Promise.reject(response);
  },
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (isDev) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      const isAuthPage = window.location.pathname.startsWith('/auth/');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

      if (!isAuthPage && !isRefreshRequest) {
        window.location.replace('/auth/login?session=expired');
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data);
    }

    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response?.data);
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check your connection');
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;