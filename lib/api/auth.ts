// lib/api/auth.ts
import apiClient from './client';
import { User, LoginCredentials, RegisterData, LoginResponse } from '@/types';

export const authAPI = {
  register: async (userData: RegisterData): Promise<User> => {
    const response = await apiClient.post('/users', userData);
    return response.data || response;
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    console.log('Login API - Full response:', response);
    
    // Extract data from response
    const responseData = response.data;
    
    // Handle different response structures
    if (responseData) {
      // Direct structure: { accessToken, refreshToken, user }
      if (responseData.accessToken && responseData.user) {
        return {
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
          user: responseData.user
        };
      }
      // Wrapped structure: { data: { accessToken, refreshToken, user } }
      if (responseData.data && responseData.data.accessToken && responseData.data.user) {
        return {
          accessToken: responseData.data.accessToken,
          refreshToken: responseData.data.refreshToken,
          user: responseData.data.user
        };
      }
    }
    
    // Fallback: return as is
    return responseData as LoginResponse;
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/');
      });
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setAuthData: (token: string, refreshToken: string, user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set cookies for middleware
      document.cookie = `user_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_id=${user.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_email=${user.email}; path=/; max-age=604800; SameSite=Lax`;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
};