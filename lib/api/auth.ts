import apiClient from './client';
import { User, LoginCredentials, RegisterData, LoginResponse } from '@/types';

export const authAPI = {
  /**
   * Register a new user.
   * Endpoint: POST /users (handled by UsersController, not AuthController)
   */
  register: async (userData: RegisterData): Promise<User> => {
    const response = await apiClient.post<unknown, User>('/users', userData);
    return response;
  },

  /**
   * Login with email and password.
   * Endpoint: POST /auth/login
   * The response interceptor in client.ts already unwraps response.data,
   * so `response` here is directly { accessToken, refreshToken, user }.
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<unknown, LoginResponse>('/auth/login', credentials);
    return response;
  },

  /**
   * Logout — clears all auth data from localStorage.
   */
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get the currently stored user from localStorage.
   */
  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Persist token, refreshToken and user to localStorage.
   */
  setAuthData: (token: string, refreshToken: string, user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Check if the user is authenticated.
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },

  /**
   * Get the stored access token.
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  /**
   * Get the stored refresh token.
   */
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
};