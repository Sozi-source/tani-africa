// lib/api/client.ts - COMPLETELY FIXED VERSION
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('auth_token')
      : null;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - SIMPLIFIED - Don't modify the response structure
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    
    // Just return the response as-is
    // The components will handle extracting the data they need
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refreshToken')
        : null;
        
      if (refreshToken) {
        try {
          const response = await axios.post<RefreshTokenResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', accessToken);
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to extract data from response
export function getResponseData<T>(response: any): T {
  if (!response) return null as T;
  
  // If it's already the data (from our interceptor)
  if (response.data !== undefined) {
    return response.data as T;
  }
  
  return response as T;
}

// Helper function to extract array from response
export function extractArray<T>(response: any): T[] {
  if (!response) return [];
  
  // Get the actual data
  const data = response.data || response;
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.jobs)) return data.jobs;
    if (Array.isArray(data.bids)) return data.bids;
    if (Array.isArray(data.vehicles)) return data.vehicles;
    if (Array.isArray(data.features)) return data.features;
    if (Array.isArray(data.testimonials)) return data.testimonials;
    
    const arrayProperty = Object.values(data).find(Array.isArray);
    if (arrayProperty) return arrayProperty as T[];
  }
  
  return [];
}

// Helper function to extract object from response
export function extractObject<T>(response: any): T | null {
  if (!response) return null;
  
  const data = response.data || response;
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return data.data as T;
    }
    return data as T;
  }
  
  return null;
}

export default apiClient;