import apiClient from './client';
import { Bid, CreateBidData } from '@/types';

export const bidsAPI = {
  getAll: async (): Promise<Bid[]> => {
    const response = await apiClient.get('/bids');
    return response as unknown as Bid[];
  },
  
  getById: async (id: string): Promise<Bid> => {
    const response = await apiClient.get(`/bids/${id}`);
    return response as unknown as Bid;
  },
  
  getByJob: async (jobId: string): Promise<Bid[]> => {
    const response = await apiClient.get(`/bids/job/${jobId}`);
    return response as unknown as Bid[];
  },
  
  getByDriver: async (driverId: string): Promise<Bid[]> => {
    const response = await apiClient.get(`/bids/driver/${driverId}`);
    return response as unknown as Bid[];
  },
  
  create: async (data: CreateBidData): Promise<Bid> => {
    const response = await apiClient.post('/bids', data);
    return response as unknown as Bid;
  },
  
  updateStatus: async (id: string, status: string): Promise<Bid> => {
    const response = await apiClient.patch(`/bids/${id}/status?status=${status}`);
    return response as unknown as Bid;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bids/${id}`);
  },
};