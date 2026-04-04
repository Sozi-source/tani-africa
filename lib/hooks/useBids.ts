'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bid, CreateBidData } from '@/types';
import { bidsAPI } from '@/lib/api/bids';

export interface UseBidsReturn {
  bids: Bid[];
  loading: boolean;
  error: string | null;

  refetch: () => Promise<void>;
  placeBid: (data: CreateBidData) => Promise<Bid>;
  updateBidStatus: (id: string, status: string) => Promise<Bid>;

  getBidsByJob: (jobId: string) => Promise<Bid[]>;
  getBidsByDriver: (driverId: string) => Promise<Bid[]>;
}

/* ================= HOOK ================= */

export function useBids(): UseBidsReturn {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- FETCH ALL ---------- */

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bidsAPI.getAll();
      setBids(data);
    } catch (err) {
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ---------- ACTIONS ---------- */

  const placeBid = async (data: CreateBidData) => {
    const bid = await bidsAPI.create(data);
    setBids(prev => [bid, ...prev]);
    return bid;
  };

  const updateBidStatus = async (id: string, status: string) => {
    const updated = await bidsAPI.updateStatus(id, status);
    setBids(prev =>
      prev.map(b => (b.id === id ? updated : b))
    );
    return updated;
  };

  /* ---------- QUERY HELPERS ---------- */

  const getBidsByJob = async (jobId: string) => {
    return await bidsAPI.getByJob(jobId);
  };

  const getBidsByDriver = async (driverId: string) => {
    return await bidsAPI.getByDriver(driverId);
  };

  return {
    bids,
    loading,
    error,

    refetch: fetchAll,
    placeBid,
    updateBidStatus,

    getBidsByJob,
    getBidsByDriver,
  };
}