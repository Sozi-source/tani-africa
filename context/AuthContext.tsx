'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { authAPI } from '@/lib/api';
import {
  User,
  LoginCredentials,
  RegisterData,
  LoginResponse,
} from '@/types';
import toast from 'react-hot-toast';

/* =====================================================
   Types
===================================================== */

export interface AuthContextType {
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

/* =====================================================
   Context
===================================================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

/* =====================================================
   Provider
===================================================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  /* ================= Restore session ================= */

  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token');

      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      localStorage.clear();
    } finally {
      setInitializing(false);
    }
  }, []);

  /* ================= Login ================= */

  const login = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: apiUser } = response;

      if (!accessToken || !apiUser) {
        throw new Error('Invalid login response');
      }

      const normalizedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.firstName ?? '',
        lastName: apiUser.lastName ?? '',
        role: (apiUser.role?.toUpperCase() as User['role']) ?? 'CLIENT',
        phone: apiUser.phone,
        photo: apiUser.photo,
        isActive: apiUser.isActive !== false,
        createdAt: apiUser.createdAt ?? new Date().toISOString(),
        updatedAt: apiUser.updatedAt ?? new Date().toISOString(),
      };

      authAPI.setAuthData(accessToken, refreshToken, normalizedUser);
      setToken(accessToken);
      setUser(normalizedUser);

      toast.success(`Welcome ${normalizedUser.firstName || normalizedUser.role}!`);

      return {
        accessToken,
        refreshToken,
        user: normalizedUser,
      };
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Login failed'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= Register ================= */

  const register = async (userData: RegisterData): Promise<User> => {
    setLoading(true);
    try {
      const user = await authAPI.register(userData);
      toast.success('Registration successful! Please sign in.');
      return user;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Registration failed'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= Logout ================= */

  const logout = () => {
    // Dispatch custom event to trigger full-screen logout loader
    window.dispatchEvent(new CustomEvent('app:logout'));
    
    // Note: The root layout handles all cleanup and redirect
    // This ensures the professional loader stays visible
  };

  /* =====================================================
     Context value
  ===================================================== */

  const value: AuthContextType = {
    user,
    token,
    loading,
    initializing,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user && token),
    isClient: user?.role === 'CLIENT',
    isDriver: user?.role === 'DRIVER',
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}