import apiClient from './client';
import { User } from '@/types';

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response as unknown as User[];
  },
  
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response as unknown as User;
  },
  
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response as unknown as User;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};