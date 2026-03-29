'use client';

import { useState, useEffect, useCallback } from 'react';
import { bidsAPI } from '@/lib/api';
import { Bid, CreateBidData } from '@/types';
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

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (jobId) {
        response = await bidsAPI.getByJob(jobId);
      } else {
        response = await bidsAPI.getAll();
      }
      setBids(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const placeBid = useCallback(async (bidData: CreateBidData) => {
    try {
      await bidsAPI.create(bidData);
      toast.success('Bid placed successfully');
      await fetchBids();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchBids]);

  const updateBidStatus = useCallback(async (id: string, status: string) => {
    try {
      await bidsAPI.updateStatus(id, status);
      toast.success(`Bid ${status.toLowerCase()} successfully`);
      await fetchBids();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchBids]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return {
    bids,
    loading,
    error,
    fetchBids,
    placeBid,
    updateBidStatus,
  };
};