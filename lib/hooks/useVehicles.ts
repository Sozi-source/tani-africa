import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { Vehicle } from '@/types';

interface CreateVehicleData {
  make: string;
  model: string;
  plateNumber: string;
  capacity?: number;
  type?: string;
}

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createVehicle: (data: CreateVehicleData) => Promise<Vehicle>;
}

export function useVehicles(userId?: string): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const fetchVehicles = useCallback(async () => {
    if (!userId) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/vehicles/user/${userId}`);
      const data = response.data;

      const vehiclesArray: Vehicle[] =
        Array.isArray(data)
          ? data
          : data?.vehicles || data?.items || data?.data || [];

      setVehicles(vehiclesArray);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load vehicles'
      );
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  /* ================= CREATE ================= */

  const createVehicle = async (data: CreateVehicleData): Promise<Vehicle> => {
    try {
      setError(null);
      const response = await apiClient.post('/vehicles', {
        ...data,
        userId,
      });

      const newVehicle: Vehicle = response.data;

      // ✅ Optimistically update UI
      setVehicles(prev => [newVehicle, ...prev]);

      return newVehicle;
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to create vehicle'
      );
    }
  };

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
    createVehicle,
  };
}