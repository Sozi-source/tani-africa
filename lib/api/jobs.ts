import apiClient from './client';
import { Job, CreateJobData } from '@/types';

export const jobsAPI = {
  getAll: async (): Promise<Job[]> => {
    const response = await apiClient.get('/jobs');
    return response as unknown as Job[];
  },
  
  getById: async (id: string): Promise<Job> => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response as unknown as Job;
  },
  
  getByClient: async (clientId: string): Promise<Job[]> => {
    const response = await apiClient.get(`/jobs/client/${clientId}`);
    return response as unknown as Job[];
  },
  
  getByDriver: async (driverId: string): Promise<Job[]> => {
    const response = await apiClient.get(`/jobs/driver/${driverId}`);
    return response as unknown as Job[];
  },
  
  create: async (data: CreateJobData): Promise<Job> => {
    const response = await apiClient.post('/jobs', data);
    return response as unknown as Job;
  },
  
  update: async (id: string, data: Partial<CreateJobData>): Promise<Job> => {
    const response = await apiClient.patch(`/jobs/${id}`, data);
    return response as unknown as Job;
  },
  
  updateStatus: async (id: string, status: string): Promise<Job> => {
    const response = await apiClient.patch(`/jobs/${id}/status?status=${status}`);
    return response as unknown as Job;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },
};