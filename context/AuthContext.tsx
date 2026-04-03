'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { User, LoginCredentials, RegisterData, LoginResponse } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ✅ NO useRouter() here - removed
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = response;
      
      authAPI.setAuthData(accessToken, refreshToken, userData);
      localStorage.setItem('auth_token', accessToken);
      
      setToken(accessToken);
      setUser(userData);
      
      toast.success(`Welcome ${userData.firstName || userData.role}!`);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      const response = await authAPI.register(userData);
      toast.success('Registration successful! Please sign in.');
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear state
    setUser(null);
    setToken(null);
    
    toast.success('Logged out successfully');
    
    // ✅ Use window.location instead of router
    window.location.href = '/auth/login';
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
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