'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsAPI } from '@/lib/api';
import { Job, CreateJobData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  // Stable ref so fetchJobs never causes useEffect to re-run
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      setJobs(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err: any) {
      console.error('Fetch jobs error:', err);
      if (err?.response?.status !== 401) {
        setError(err.message);
        toast.error(err?.response?.data?.message || err.message || 'Failed to fetch jobs');
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []); // ← no dependencies, stable reference

  const createJob = useCallback(async (jobData: CreateJobData) => {
    try {
      const newJob = await jobsAPI.create(jobData);
      toast.success('Job posted successfully!');
      await fetchJobs();
      return newJob;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to create job';
      toast.error(message);
      throw err;
    }
  }, [fetchJobs]);

  const updateJob = useCallback(async (id: string, data: Partial<CreateJobData>) => {
    try {
      const updatedJob = await jobsAPI.update(id, data);
      toast.success('Job updated successfully!');
      await fetchJobs();
      return updatedJob;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update job';
      toast.error(message);
      throw err;
    }
  }, [fetchJobs]);

  const deleteJob = useCallback(async (id: string) => {
    try {
      await jobsAPI.delete(id);
      toast.success('Job deleted successfully!');
      await fetchJobs();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete job';
      toast.error(message);
      throw err;
    }
  }, [fetchJobs]);

  // Only runs when auth state settles — fetchJobs is stable so won't re-trigger
  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve

    if (isAuthenticated) {
      fetchJobs();
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]); // ← fetchJobs intentionally omitted

  return {
    jobs,
    loading,  // ← just local loading, NOT loading || authLoading
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
  };
};