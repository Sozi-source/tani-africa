// lib/hooks/useVehicles.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { Vehicle } from '@/types';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVehicles(userId?: string): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    // Don't fetch if no userId
    if (!userId) {
      setVehicles([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/vehicles/user/${userId}`);
      
      let vehiclesArray: Vehicle[] = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        vehiclesArray = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) vehiclesArray = data.data;
        else if (Array.isArray(data.vehicles)) vehiclesArray = data.vehicles;
        else if (Array.isArray(data.items)) vehiclesArray = data.items;
      }
      
      setVehicles(vehiclesArray);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}