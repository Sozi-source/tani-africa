// lib/api/auth.ts
import apiClient from './client';
import { User, LoginCredentials, RegisterData, LoginResponse } from '@/types';

export const authAPI = {
  /* ================= Register ================= */

  register: async (userData: RegisterData): Promise<User> => {
    const response = await apiClient.post('/users', userData);
    return response.data ?? response;
  },

  /* ================= Login ================= */

  login: async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    const responseData = response.data;

    // Direct structure
    if (responseData?.accessToken && responseData?.user) {
      return {
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        user: responseData.user,
      };
    }

    // Wrapped structure
    if (
      responseData?.data?.accessToken &&
      responseData?.data?.user
    ) {
      return {
        accessToken: responseData.data.accessToken,
        refreshToken: responseData.data.refreshToken,
        user: responseData.data.user,
      };
    }

    // Fallback (typed)
    return responseData as LoginResponse;
  },

  /* ================= Logout ================= */

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear cookies
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0]?.trim();
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }
  },

  /* ================= Current User ================= */

  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /* ================= Set Auth Data (✅ FIXED) ================= */

  setAuthData: (
    token: string,
    refreshToken?: string,
    user?: User
  ): void => {
    if (typeof window === 'undefined') return;

    // Access token
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token);

    // ✅ Refresh token is OPTIONAL
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // ✅ User is OPTIONAL
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));

      // Cookies for middleware (safe + consistent)
      document.cookie = `user_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_id=${user.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_email=${user.email}; path=/; max-age=604800; SameSite=Lax`;
    }
  },

  /* ================= Helpers ================= */

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem('token'));
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