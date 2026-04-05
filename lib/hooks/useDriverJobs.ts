'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient, { extractArray } from '@/lib/api/client';
import { Job } from '@/types';
import { adaptJob } from '@/lib/adapters/jobAdapter';
import { useAuth } from '@/lib/hooks/useAuth';

const TAKEN_STATUSES = new Set(['CANCELLED', 'REJECTED', 'COMPLETED']);

export function useDriverJobs() {
  const { user, initializing, isLoggingOut } = useAuth();

  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (initializing || isLoggingOut) {
      setLoading(false);
      return;
    }

    if (!user || user.role !== 'DRIVER') {
      console.log('[useDriverJobs] BLOCKED — no user or not a DRIVER, role:', user?.role);
      setLoading(false);
      return;
    }

    const storedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || localStorage.getItem('token')
        : null;

    if (!storedToken) {
      console.log('[useDriverJobs] BLOCKED — no token in localStorage');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ Call both endpoints in parallel
      const [availableRes, assignedRes] = await Promise.all([
        apiClient.get('/jobs/available'), // jobs drivers can bid on
        apiClient.get('/jobs'),           // driver's own assigned jobs
      ]);

      console.log('[useDriverJobs] /jobs/available raw:', JSON.stringify(availableRes.data, null, 2));
      console.log('[useDriverJobs] /jobs raw:', JSON.stringify(assignedRes.data, null, 2));

      const available = extractArray(availableRes).map(adaptJob);
      const assigned = extractArray(assignedRes).map(adaptJob);

      // Extra safety filter
      const filteredAvailable = available.filter(
        j => !TAKEN_STATUSES.has(j.status)
      );

      console.log('[useDriverJobs] available:', filteredAvailable.length, 'assigned:', assigned.length);

      setAvailableJobs(filteredAvailable);
      setAssignedJobs(assigned);
    } catch (err: any) {
      console.error('[useDriverJobs] fetch failed:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, initializing, isLoggingOut]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { availableJobs, assignedJobs, loading, error, refetch: fetchJobs };
}