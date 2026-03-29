'use client';

import { useState, useEffect, useCallback } from 'react';
import { vehiclesAPI } from '@/lib/api';
import { Vehicle, CreateVehicleData } from '@/types';
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

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (userId) {
        response = await vehiclesAPI.getByUser(userId);
      } else {
        response = await vehiclesAPI.getAll();
      }
      setVehicles(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createVehicle = useCallback(async (vehicleData: CreateVehicleData) => {
    try {
      await vehiclesAPI.create(vehicleData);
      toast.success('Vehicle added successfully');
      await fetchVehicles();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchVehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      await vehiclesAPI.delete(id);
      toast.success('Vehicle deleted successfully');
      await fetchVehicles();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchVehicles]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    deleteVehicle,
  };
};