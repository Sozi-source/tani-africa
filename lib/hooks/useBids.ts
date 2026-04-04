'use client';

import { useCallback, useRef, useState } from 'react';
import apiClient from '@/lib/api/client';
import { Bid } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

/* =====================================================
   Internal caches
===================================================== */

const bidsCache = new Map<string, Bid[]>();
const inFlight = new Map<string, Promise<Bid[]>>();

export function useBids() {
  const { user, isDriver } = useAuth();
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  /* ---------------------------------------------------
     Get bids by job (cached & deduped)
  --------------------------------------------------- */
  const getBidsByJob = useCallback(async (jobId: string): Promise<Bid[]> => {
    if (bidsCache.has(jobId)) {
      return bidsCache.get(jobId)!;
    }

    if (inFlight.has(jobId)) {
      return inFlight.get(jobId)!;
    }

    setLoading(true);

    const request = (async () => {
      try {
        const res = await apiClient.get(`/bids/job/${jobId}`);
        const bids: Bid[] = res.data;
        bidsCache.set(jobId, bids);
        return bids;
      } finally {
        inFlight.delete(jobId);
        if (mounted.current) setLoading(false);
      }
    })();

    inFlight.set(jobId, request);
    return request;
  }, []);

  /* ---------------------------------------------------
     Place bid (✅ FIXED)
  --------------------------------------------------- */
  const placeBid = useCallback(
    async (payload: {
      jobId: string;
      price: number;
      estimatedDuration?: number;
      message?: string;
    }) => {
      if (!isDriver || !user?.id) {
        throw new Error('Only authenticated drivers can place bids');
      }

      const requestPayload = {
        jobId: payload.jobId,
        driverId: user.id,                     // ✅ REQUIRED BY PRISMA
        price: Number(payload.price),          // ✅ int
        ...(payload.estimatedDuration
          ? { estimatedDuration: Number(payload.estimatedDuration) }
          : {}),
        ...(payload.message?.trim()
          ? { message: payload.message.trim() }
          : {}),
      };

      const res = await apiClient.post('/bids', requestPayload);

      // ✅ invalidate cache (unique constraint exists)
      bidsCache.clear();

      return res.data;
    },
    [user, isDriver]
  );

  /* ---------------------------------------------------
     Update bid status
  --------------------------------------------------- */
  const updateBidStatus = useCallback(
    async (bidId: string, status: Bid['status']) => {
      const res = await apiClient.patch(`/bids/${bidId}/status`, { status });
      bidsCache.clear();
      return res.data;
    },
    []
  );

  return {
    loading,
    getBidsByJob,
    placeBid,
    updateBidStatus,
  };
}