// lib/hooks/useAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient, { extractObject, extractArray } from '@/lib/api/client';
import { AdminStats, PendingDriver, User } from '@/types';

// Make sure this is exported as a named export
export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
      
      console.log('Stats response:', statsRes);
      console.log('Stats data:', statsRes?.data);
      
      const statsData = extractObject<AdminStats>(statsRes);
      const usersData = extractArray<User>(usersRes);
      const driversData = extractArray<PendingDriver>(driversRes);
      
      setStats(statsData);
      setUsers(usersData);
      setPendingDrivers(driversData);
      
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

// Also export as default if needed
export default useAdmin;