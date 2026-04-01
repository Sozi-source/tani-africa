'use client';

import { useState, useCallback, useEffect } from 'react';
import { jobsAPI } from '@/lib/api/jobs';
import { Job, CreateJobData, UpdateJobData } from '@/types';
import toast from 'react-hot-toast';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jobsAPI.getAll();
      setJobs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobById = useCallback(async (id: string): Promise<Job | null> => {
    try {
      const job = await jobsAPI.getById(id);
      return job;
    } catch (err: any) {
      toast.error('Failed to load job details');
      return null;
    }
  }, []);

  const createJob = useCallback(async (jobData: CreateJobData): Promise<Job> => {
    try {
      const newJob = await jobsAPI.create(jobData);
      toast.success('Job created successfully!');
      await fetchJobs();
      return newJob;
    } catch (err: any) {
      const message = err?.response?.data?.message;
      const errorMsg = Array.isArray(message)
        ? message.join(', ')
        : message || 'Failed to create job';
      console.error('API validation error:', errorMsg);
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchJobs]);

  const updateJob = useCallback(async (id: string, data: UpdateJobData): Promise<Job> => {
    try {
      const updated = await jobsAPI.update(id, data);
      toast.success('Job updated successfully');
      await fetchJobs();
      return updated;
    } catch (err: any) {
      const message = err?.response?.data?.message;
      const errorMsg = Array.isArray(message)
        ? message.join(', ')
        : message || 'Failed to update job';
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchJobs]);

  const updateJobStatus = useCallback(async (id: string, status: string): Promise<Job> => {
    try {
      const updated = await jobsAPI.updateStatus(id, status);
      toast.success(`Job status updated to ${status}`);
      await fetchJobs();
      return updated;
    } catch (err: any) {
      const message = err?.response?.data?.message;
      const errorMsg = Array.isArray(message)
        ? message.join(', ')
        : message || 'Failed to update job status';
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchJobs]);

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    try {
      await jobsAPI.delete(id);
      toast.success('Job deleted successfully');
      await fetchJobs();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      const errorMsg = Array.isArray(message)
        ? message.join(', ')
        : message || 'Failed to delete job';
      toast.error(errorMsg);
      throw err;
    }
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    getJobById,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    refetch: fetchJobs,
  };
};