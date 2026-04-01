'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { bidsAPI } from '@/lib/api';
import { Bid, CreateBidData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface UseBidsReturn {
  bids: Bid[];
  loading: boolean;
  error: string | null;
  fetchBids: () => Promise<void>;
  placeBid: (data: CreateBidData) => Promise<void>;
  updateBidStatus: (id: string, status: string) => Promise<void>;
}

export const useBids = (jobId?: string): UseBidsReturn => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  // jobId is stored in a ref so fetchBids stays stable
  const jobIdRef = useRef(jobId);
  useEffect(() => { jobIdRef.current = jobId; }, [jobId]);

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      const response = jobIdRef.current
        ? await bidsAPI.getByJob(jobIdRef.current)
        : await bidsAPI.getAll();
      setBids(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        setError(err.message);
        toast.error(err?.response?.data?.message || err.message || 'Failed to fetch bids');
      }
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, []); // ← stable, uses ref internally

  const placeBid = useCallback(async (bidData: CreateBidData) => {
    try {
      await bidsAPI.create(bidData);
      toast.success('Bid placed successfully');
      await fetchBids();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to place bid';
      toast.error(message);
      throw err;
    }
  }, [fetchBids]);

  const updateBidStatus = useCallback(async (id: string, status: string) => {
    try {
      await bidsAPI.updateStatus(id, status);
      toast.success(`Bid ${status.toLowerCase()} successfully`);
      await fetchBids();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update bid';
      toast.error(message);
      throw err;
    }
  }, [fetchBids]);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      fetchBids();
    } else {
      setBids([]);
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]); // ← fetchBids intentionally omitted

  return {
    bids,
    loading,  // ← just local loading
    error,
    fetchBids,
    placeBid,
    updateBidStatus,
  };
};