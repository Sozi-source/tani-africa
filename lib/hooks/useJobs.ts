// lib/hooks/useJobs.ts - Add cache and prevent duplicate calls

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient, { extractArray } from '@/lib/api/client';
import { Job } from '@/types';

// Cache for jobs data
let cachedJobs: Job[] | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(cachedJobs || []);
  const [loading, setLoading] = useState(!cachedJobs);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    // If we have cached data and not forcing refresh, use it
    if (cachedJobs && !forceRefresh && !isFetching) {
      setJobs(cachedJobs);
      setLoading(false);
      return;
    }
    
    // If already fetching, wait for the existing promise
    if (fetchPromise) {
      await fetchPromise;
      if (isMounted.current && cachedJobs) {
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
        const jobsArray = extractArray<Job>(response);
        
        // Normalize jobs
        const normalizedJobs = jobsArray.map((job: any) => ({
          id: job.id || '',
          title: job.title || 'Transport Job',
          price: job.price || 0,
          pickUpLocation: job.pickUpLocation || 'Not specified',
          dropOffLocation: job.dropOffLocation || 'Not specified',
          status: job.status || 'UNKNOWN',
          createdAt: job.createdAt || new Date().toISOString(),
          updatedAt: job.updatedAt || new Date().toISOString(),
          clientId: job.clientId || '',
          description: job.description,
          cargoType: job.cargoType,
          cargoWeight: job.cargoWeight,
          scheduledDate: job.scheduledDate,
          client: job.client,
          driverId: job.driverId,
          driver: job.driver,
        }));
        
        cachedJobs = normalizedJobs;
        
        if (isMounted.current) {
          setJobs(normalizedJobs);
        }
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        if (isMounted.current) {
          setError(err.message || 'Failed to load jobs');
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

  useEffect(() => {
    isMounted.current = true;
    fetchJobs();
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchJobs]);

  const refetch = useCallback(() => {
    cachedJobs = null;
    return fetchJobs(true);
  }, [fetchJobs]);

  return { 
    jobs, 
    loading, 
    error, 
    refetch,
    fetchJobs 
  };
}