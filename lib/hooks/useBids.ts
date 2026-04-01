'use client';

import { useState, useCallback, useEffect } from 'react';
import { bidsAPI } from '@/lib/api/bids';
import { Bid, CreateBidData } from '@/types';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bidsAPI.getAll();
      setBids(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  }, []);

  const getBidsByJob = useCallback(async (jobId: string): Promise<Bid[]> => {
    try {
      const data = await bidsAPI.getByJob(jobId);
      return data;
    } catch (err: any) {
      toast.error('Failed to load bids for this job');
      return [];
    }
  }, []);

  const getBidsByDriver = useCallback(async (driverId: string): Promise<Bid[]> => {
    try {
      const data = await bidsAPI.getByDriver(driverId);
      return data;
    } catch (err: any) {
      toast.error('Failed to load driver bids');
      return [];
    }
  }, []);

  const placeBid = useCallback(async (data: Omit<CreateBidData, 'driverId'>): Promise<Bid> => {
    try {
      // Add driverId from authenticated user
      if (!user?.id) {
        throw new Error('You must be logged in to place a bid');
      }
      
      const bidData: CreateBidData = {
        ...data,
        driverId: user.id,
      };
      
      const newBid = await bidsAPI.create(bidData);
      toast.success('Bid placed successfully!');
      await fetchBids();
      return newBid;
    } catch (err: any) {
      toast.error(err.message || 'Failed to place bid');
      throw err;
    }
  }, [fetchBids, user]);

  const updateBidStatus = useCallback(async (id: string, status: string): Promise<Bid> => {
    try {
      const updated = await bidsAPI.updateStatus(id, status);
      toast.success(`Bid ${status.toLowerCase()}`);
      await fetchBids();
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update bid status');
      throw err;
    }
  }, [fetchBids]);

  const deleteBid = useCallback(async (id: string): Promise<void> => {
    try {
      await bidsAPI.delete(id);
      toast.success('Bid deleted');
      await fetchBids();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bid');
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
    getBidsByJob,
    getBidsByDriver,
    placeBid,
    updateBidStatus,
    deleteBid,
    refetch: fetchBids,
  };
};
