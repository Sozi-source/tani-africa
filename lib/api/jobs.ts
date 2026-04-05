import apiClient, { extractArray } from './client';
import { Job, CreateJobData, UpdateJobData } from '@/types';
import { mapApiJob } from '@/lib/mappers/jobMapper';

export const jobsAPI = {
  getAll: async (): Promise<Job[]> => {
    const res = await apiClient.get('/job');
    return extractArray(res).map(mapApiJob);
  },

  getAvailable: async (): Promise<Job[]> => {
    const res = await apiClient.get('/job/available');
    return extractArray(res).map(mapApiJob);
  },

  getById: async (id: string): Promise<Job> => {
    const res = await apiClient.get(`/job/${id}`);
    return mapApiJob(res.data);
  },

  getByClient: async (clientId: string): Promise<Job[]> => {
    const res = await apiClient.get(`/job/client/${clientId}`);
    return extractArray(res).map(mapApiJob);
  },

  getByDriver: async (driverId: string): Promise<Job[]> => {
    const res = await apiClient.get(`/job/driver/${driverId}`);
    return extractArray(res).map(mapApiJob);
  },

  create: async (data: CreateJobData): Promise<Job> => {
    const res = await apiClient.post('/job', data);
    return mapApiJob(res.data);
  },

  update: async (id: string, data: UpdateJobData): Promise<Job> => {
    const res = await apiClient.patch(`/job/${id}`, data);
    return mapApiJob(res.data);
  },

  updateStatus: async (id: string, status: string): Promise<Job> => {
    const res = await apiClient.patch(`/job/${id}/status`, { status });
    return mapApiJob(res.data);
  },

  cancel: async (id: string, reason?: string): Promise<Job> => {
    const res = await apiClient.patch(`/job/${id}/cancel`, { reason });
    return mapApiJob(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/job/${id}`);
  },
};