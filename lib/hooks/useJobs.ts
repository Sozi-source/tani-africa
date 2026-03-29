'use client';

import { useState, useEffect, useCallback } from 'react';
import { jobsAPI } from '@/lib/api';
import { Job, CreateJobData } from '@/types';
import toast from 'react-hot-toast';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      // The API returns the array directly
      const jobsArray = response;
      console.log('Fetched jobs in hook:', jobsArray);
      console.log('Is array?', Array.isArray(jobsArray));
      setJobs(jobsArray);
      setError(null);
    } catch (err: any) {
      console.error('Fetch jobs error:', err);
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: CreateJobData) => {
    try {
      const newJob = await jobsAPI.create(jobData);
      toast.success('Job posted successfully!');
      await fetchJobs();
      return newJob;
    } catch (err: any) {
      toast.error(err.message);
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
    createJob,
  };
};