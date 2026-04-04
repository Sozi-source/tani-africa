'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient, { extractArray } from '@/lib/api/client';
import { Job, CreateJobData } from '@/types';
import { mapApiJob } from '@/lib/mappers/jobMapper';
import { useAuth } from '@/lib/hooks/useAuth';

/* =====================================================
   Module-level cache (shared across hook instances)
===================================================== */

let cachedJobs: Job[] | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

/* =====================================================
   useJobs Hook
===================================================== */

export function useJobs() {
  const { token, initializing, isLoggingOut } = useAuth();

  const [jobs, setJobs] = useState<Job[]>(cachedJobs ?? []);
  const [loading, setLoading] = useState<boolean>(!cachedJobs);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  /* ---------------------------------------------------
     Fetch all jobs (auth-aware, cache-aware)
  --------------------------------------------------- */
  const fetchJobs = useCallback(
    async (forceRefresh = false) => {
      // ✅ Do not fetch during logout / auth restore / unauthenticated
      if (!token || initializing || isLoggingOut) {
        return;
      }

      if (cachedJobs && !forceRefresh && !isFetching) {
        if (isMounted.current) {
          setJobs(cachedJobs);
          setLoading(false);
        }
        return;
      }

      if (fetchPromise) {
        setLoading(true);
        await fetchPromise;
        if (cachedJobs && isMounted.current) {
          setJobs(cachedJobs);
          setLoading(false);
        }
        return;
      }

      isFetching = true;
      setLoading(true);
      setError(null);

      fetchPromise = (async () => {
        try {
          const response = await apiClient.get('/jobs');
          const rawJobs = extractArray<any>(response);
          const normalizedJobs = rawJobs.map(mapApiJob);

          cachedJobs = normalizedJobs;

          if (isMounted.current) {
            setJobs(normalizedJobs);
          }
        } catch (err: any) {
          if (err?.response?.status !== 401 && isMounted.current) {
            console.error('Error fetching jobs:', err);
            setError(err?.message ?? 'Failed to load jobs');
            setJobs([]);
          }
        } finally {
          isFetching = false;
          fetchPromise = null;
          if (isMounted.current) {
            setLoading(false);
          }
        }
      })();

      await fetchPromise;
    },
    [token, initializing, isLoggingOut]
  );

  /* ---------------------------------------------------
     Fetch a single job by ID (cache-first)
  --------------------------------------------------- */
  const getJobById = useCallback(async (id: string): Promise<Job | null> => {
    if (cachedJobs) {
      const cached = cachedJobs.find(j => j.id === id);
      if (cached) return cached;
    }

    try {
      const response = await apiClient.get(`/jobs/${id}`);
      return mapApiJob(response.data);
    } catch (err) {
      console.error('Failed to fetch job by ID:', err);
      return null;
    }
  }, []);

  /* ---------------------------------------------------
     ✅ Create job (NEW)
  --------------------------------------------------- */
  const createJob = useCallback(
    async (data: CreateJobData): Promise<Job> => {
      if (!token || isLoggingOut) {
        throw new Error('Not authenticated');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.post('/jobs', data);
        const newJob = mapApiJob(response.data);

        // ✅ Update cache + state optimistically
        cachedJobs = cachedJobs ? [newJob, ...cachedJobs] : [newJob];

        if (isMounted.current) {
          setJobs(cachedJobs);
        }

        return newJob;
      } catch (err: any) {
        setError(err?.message ?? 'Failed to create job');
        throw err;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [token, isLoggingOut]
  );

  /* ---------------------------------------------------
     Update job status
  --------------------------------------------------- */
  const updateJobStatus = useCallback(
    async (
      jobId: string,
      status: Job['status'],
      options?: {
        rejectionReason?: string;
      }
    ) => {
      const payload = {
        status,
        ...(options?.rejectionReason
          ? { rejectionReason: options.rejectionReason }
          : {}),
      };

      const response = await apiClient.patch(
        `/jobs/${jobId}/status`,
        payload
      );

      if (cachedJobs) {
        cachedJobs = cachedJobs.map(job =>
          job.id === jobId
            ? {
                ...job,
                status,
                rejectionReason:
                  options?.rejectionReason ?? job.rejectionReason,
              }
            : job
        );

        if (isMounted.current) {
          setJobs(cachedJobs);
        }
      }

      return response.data;
    },
    []
  );

  /* ---------------------------------------------------
     Clear cache & refetch
  --------------------------------------------------- */
  const refetch = useCallback(() => {
    cachedJobs = null;
    return fetchJobs(true);
  }, [fetchJobs]);

  /* ---------------------------------------------------
     Initial fetch + cleanup
  --------------------------------------------------- */
  useEffect(() => {
    isMounted.current = true;

    if (token && !initializing && !isLoggingOut) {
      fetchJobs();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchJobs, token, initializing, isLoggingOut]);

  /* ---------------------------------------------------
     Public API
  --------------------------------------------------- */
  return {
    jobs,
    loading,
    error,

    fetchJobs,
    refetch,
    getJobById,
    updateJobStatus,
    createJob, // ✅ NOW AVAILABLE
  };
}