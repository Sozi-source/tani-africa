import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tani-africa-api.onrender.com/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
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
    return config;
  },
  (error: unknown): Promise<unknown> => Promise.reject(error)
);

// Response interceptor — unwraps response.data so callers get data directly
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: unknown): Promise<unknown> => {
    const err = error as any;
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;