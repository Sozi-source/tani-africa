// lib/hooks/useAdmin.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { AdminStats, PendingDriver, User, Job } from '@/types';

// Helper to extract array from response
function extractArray<T>(response: any): T[] {
  if (!response) return [];
  const data = response.data || response;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.jobs)) return data.jobs;
    const arrayProp = Object.values(data).find(Array.isArray);
    if (arrayProp) return arrayProp as T[];
  }
  return [];
}

// Helper to extract object from response
function extractObject<T>(response: any): T | null {
  if (!response) return null;
  const data = response.data || response;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.data && typeof data.data === 'object') return data.data as T;
    return data as T;
  }
  return null;
}

// Main admin hook
export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, usersRes, driversRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/drivers/pending')
      ]);
      
      setStats(extractObject<AdminStats>(statsRes));
      setUsers(extractArray<User>(usersRes));
      setPendingDrivers(extractArray<PendingDriver>(driversRes));
      
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, users, pendingDrivers, loading, error, refetch: fetchData };
}

// Export individual hooks for specific use cases
export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/users');
      const usersData = extractArray<User>(response);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role });
      await fetchUsers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update role');
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
      await fetchUsers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update status');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete user');
    }
  };

  return {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    refetch: fetchUsers,
  };
}

export function useDriverApprovals() {
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/drivers/pending');
      const driversData = extractArray<PendingDriver>(response);
      setPendingDrivers(driversData);
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const approveDriver = async (userId: string, notes?: string) => {
    try {
      await apiClient.post(`/admin/drivers/${userId}/approve`, { notes });
      await fetchDrivers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to approve driver');
    }
  };

  const rejectDriver = async (userId: string, reason: string) => {
    try {
      await apiClient.post(`/admin/drivers/${userId}/reject`, { reason });
      await fetchDrivers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to reject driver');
    }
  };

  return {
    pendingDrivers,
    loading,
    error,
    approveDriver,
    rejectDriver,
    refetch: fetchDrivers,
  };
}