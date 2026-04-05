'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/api/client';
import { Bid, BidStatus } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

/* =====================================================
   useBids Hook
===================================================== */

export function useBids() {
  const { user, token, initializing, isLoggingOut } = useAuth();

  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  /* ---------------------------------------------------
     Fetch bids for current user
  --------------------------------------------------- */
  const fetchMyBids = useCallback(async () => {
    if (!token || !user || initializing || isLoggingOut) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/bids/my`);
      setBids(res.data ?? []);
    } catch (err: any) {
      console.error('Error fetching bids:', err);
      setError(err?.message ?? 'Failed to load bids');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [token, user, initializing, isLoggingOut]);

  /* ---------------------------------------------------
     Fetch bids for a job (on‑demand)
  --------------------------------------------------- */
  const getBidsByJob = useCallback(async (jobId: string): Promise<Bid[]> => {
    const res = await apiClient.get(`/jobs/${jobId}/bids`);
    return res.data ?? [];
  }, []);

  /* ---------------------------------------------------
     Place bid — ✅ includes driverId required by backend
  --------------------------------------------------- */
  const placeBid = useCallback(
    async (payload: {
      jobId: string;
      price: number;
      estimatedDuration?: number;
      message?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const res = await apiClient.post('/bids', {
        ...payload,
        driverId: user.id, // ✅ required by CreateBidDto
      });

      await fetchMyBids();
      return res.data;
    },
    [fetchMyBids, user] // ✅ user added to deps
  );

  /* ---------------------------------------------------
     Update bid status
  --------------------------------------------------- */
  const updateBidStatus = useCallback(
    async (bidId: string, status: BidStatus) => {
      const res = await apiClient.patch(`/bids/${bidId}`, { status });

      setBids(prev =>
        prev.map(bid =>
          bid.id === bidId ? { ...bid, status } : bid
        )
      );

      return res.data;
    },
    []
  );

  /* ---------------------------------------------------
     Lifecycle
  --------------------------------------------------- */
  useEffect(() => {
    isMounted.current = true;
    fetchMyBids();

    return () => {
      isMounted.current = false;
    };
  }, [fetchMyBids]);

  /* ---------------------------------------------------
     Public API
  --------------------------------------------------- */
  return {
    bids,
    loading,
    error,
    refetch: fetchMyBids,

    getBidsByJob,
    placeBid,
    updateBidStatus,
  };
}