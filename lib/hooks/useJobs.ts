'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient, { extractArray } from '@/lib/api/client';
import { Job } from '@/types';
import { mapApiJob } from '@/lib/mappers/jobMapper';

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
  const [jobs, setJobs] = useState<Job[]>(cachedJobs ?? []);
  const [loading, setLoading] = useState<boolean>(!cachedJobs);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  /* ---------------------------------------------------
     Fetch all jobs (cache-aware, deduplicated)
  --------------------------------------------------- */
  const fetchJobs = useCallback(async (forceRefresh = false) => {
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

        const normalizedJobs: Job[] = rawJobs.map(mapApiJob);
        cachedJobs = normalizedJobs;

        if (isMounted.current) {
          setJobs(normalizedJobs);
        }
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        if (isMounted.current) {
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
  }, []);

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
     Update job status (supports admin metadata)
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
    fetchJobs();

    return () => {
      isMounted.current = false;
    };
  }, [fetchJobs]);

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
  };
}