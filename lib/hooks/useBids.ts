// lib/hooks/useBids.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { Bid } from '@/types';

interface UseBidsReturn {
  bids: Bid[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBids(): UseBidsReturn {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/bids');
      
      let bidsArray: Bid[] = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        bidsArray = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) bidsArray = data.data;
        else if (Array.isArray(data.bids)) bidsArray = data.bids;
        else if (Array.isArray(data.items)) bidsArray = data.items;
      }
      
      setBids(bidsArray);
    } catch (err: any) {
      console.error('Error fetching bids:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load bids');
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return { bids, loading, error, refetch: fetchBids };
}