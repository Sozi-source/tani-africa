'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { vehiclesAPI } from '@/lib/api';
import { Vehicle, CreateVehicleData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<void>;
  createVehicle: (data: CreateVehicleData) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const useVehicles = (userId?: string): UseVehiclesReturn => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  // userId stored in a ref so fetchVehicles stays stable
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = userIdRef.current
        ? await vehiclesAPI.getByUser(userIdRef.current)
        : await vehiclesAPI.getAll();
      setVehicles(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        setError(err.message);
        toast.error(err?.response?.data?.message || err.message || 'Failed to fetch vehicles');
      }
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []); // ← stable, uses ref internally

  const createVehicle = useCallback(async (vehicleData: CreateVehicleData) => {
    try {
      await vehiclesAPI.create(vehicleData);
      toast.success('Vehicle added successfully');
      await fetchVehicles();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to add vehicle';
      toast.error(message);
      throw err;
    }
  }, [fetchVehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      await vehiclesAPI.delete(id);
      toast.success('Vehicle deleted successfully');
      await fetchVehicles();
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete vehicle';
      toast.error(message);
      throw err;
    }
  }, [fetchVehicles]);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      fetchVehicles();
    } else {
      setVehicles([]);
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]); // ← fetchVehicles intentionally omitted

  return {
    vehicles,
    loading,  // ← just local loading
    error,
    fetchVehicles,
    createVehicle,
    deleteVehicle,
  };
};