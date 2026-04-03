// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { User, LoginCredentials, RegisterData, LoginResponse } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isClient: boolean;
  isDriver: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Restore session
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log('Session restored for:', parsedUser.email);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };
    
    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      const { accessToken, refreshToken, user: userData } = response;
      
      if (!accessToken || !userData) {
        throw new Error('Invalid response structure from server');
      }
      
      // Normalize user data
      const normalizedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role?.toUpperCase() as User['role'] || 'CLIENT',
        phone: userData.phone,
        photo: userData.photo,
        isActive: userData.isActive !== false,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
      };
      
      // Store auth data
      authAPI.setAuthData(accessToken, refreshToken, normalizedUser);
      
      // Update state
      setToken(accessToken);
      setUser(normalizedUser);
      
      toast.success(`Welcome ${normalizedUser.firstName || normalizedUser.role}!`);
      
      return { accessToken, refreshToken, user: normalizedUser };
      
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.message || error?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      toast.success('Registration successful! Please sign in.');
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error?.response?.data?.message || error?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
    window.location.href = '/auth/login';
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    initializing,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isClient: user?.role === 'CLIENT',
    isDriver: user?.role === 'DRIVER',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}