import apiClient from './client';
import { Vehicle, CreateVehicleData } from '@/types';

export const vehiclesAPI = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get('/vehicles');
    return response as unknown as Vehicle[];
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response as unknown as Vehicle;
  },
  
  getByUser: async (userId: string): Promise<Vehicle[]> => {
    const response = await apiClient.get(`/vehicles/user/${userId}`);
    return response as unknown as Vehicle[];
  },
  
  create: async (data: CreateVehicleData): Promise<Vehicle> => {
    const response = await apiClient.post('/vehicles', data);
    return response as unknown as Vehicle;
  },
  
  update: async (id: string, data: Partial<CreateVehicleData>): Promise<Vehicle> => {
    const response = await apiClient.patch(`/vehicles/${id}`, data);
    return response as unknown as Vehicle;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  },
};