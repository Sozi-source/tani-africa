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
  // Initialize with null for SSR - will hydrate on client
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Restore session from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    
    // Only run on client
    if (typeof window !== 'undefined') {
      const storedUser = authAPI.getCurrentUser();
      const storedToken = authAPI.getToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = response;

      authAPI.setAuthData(accessToken, refreshToken, userData);
      setToken(accessToken);
      setUser(userData);
      toast.success('Login successful!');
      return response;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials.';
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
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    loading: loading || !mounted, // Show loading until mounted
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isClient: user?.role === 'CLIENT',
    isDriver: user?.role === 'DRIVER',
    isAdmin: user?.role === 'ADMIN',
  };

  // During SSR, render children with default state
  // This prevents hydration mismatches
  if (!mounted) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}