// lib/hooks/useJobs.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient, { extractArray } from '@/lib/api/client';
import { Job } from '@/types';

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/jobs');
      
      console.log('Jobs API response:', response);
      console.log('Jobs data:', response.data);
      
      // Extract array from response
      const jobsArray = extractArray<Job>(response);
      
      console.log('Extracted jobs array length:', jobsArray.length);
      setJobs(jobsArray);
      
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { 
    jobs, 
    loading, 
    error, 
    fetchJobs,  
    refetch: fetchJobs  
  };
}