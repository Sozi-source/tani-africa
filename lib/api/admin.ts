// lib/api/admin.ts
import apiClient from './client';
import { 
  AdminStats, 
  PendingDriver, 
  User, 
  Job, 
  Feature, 
  CreateFeatureData, 
  UpdateFeatureData,
  Testimonial,
  CreateTestimonialData,
  UpdateTestimonialData,
} from '@/types';

// Helper function to extract array from AxiosResponse
function extractArray<T>(response: any): T[] {
  if (!response) return [];
  
  // Get the actual data from the response
  const data = response.data || response;
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.jobs)) return data.jobs;
    if (Array.isArray(data.features)) return data.features;
    if (Array.isArray(data.testimonials)) return data.testimonials;
    
    // Try to find any array property
    const arrayProperty = Object.values(data).find(Array.isArray);
    if (arrayProperty) return arrayProperty as T[];
  }
  
  return [];
}

// Helper function to extract object from AxiosResponse
function extractObject<T>(response: any): T | null {
  if (!response) return null;
  
  const data = response.data || response;
  
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return data.data as T;
    }
    return data as T;
  }
  
  return null;
}

export const adminAPI = {
  // ==================== DASHBOARD STATS ====================
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return extractObject<AdminStats>(response) || (response.data as AdminStats);
  },

  // ==================== DRIVER APPROVALS ====================
  getPendingDrivers: async (): Promise<PendingDriver[]> => {
    const response = await apiClient.get('/admin/drivers/pending');
    return extractArray<PendingDriver>(response);
  },

  approveDriver: async (userId: string, notes?: string): Promise<void> => {
    await apiClient.post(`/admin/drivers/${userId}/approve`, { notes });
  },

  rejectDriver: async (userId: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/drivers/${userId}/reject`, { reason });
  },

  // ==================== USER MANAGEMENT ====================
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return extractArray<User>(response);
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // ==================== JOB MANAGEMENT ====================
  getAllJobs: async (filters?: { status?: string; search?: string; page?: number; limit?: number }): Promise<Job[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const url = `/admin/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return extractArray<Job>(response);
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/admin/jobs/${jobId}`);
  },

  // ==================== FEATURES MANAGEMENT ====================
  getFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get('/admin/features');
    return extractArray<Feature>(response);
  },

  createFeature: async (data: CreateFeatureData): Promise<Feature> => {
    const response = await apiClient.post('/admin/features', data);
    return extractObject<Feature>(response) || (response.data as Feature);
  },

  updateFeature: async (id: string, data: UpdateFeatureData): Promise<Feature> => {
    const response = await apiClient.patch(`/admin/features/${id}`, data);
    return extractObject<Feature>(response) || (response.data as Feature);
  },

  deleteFeature: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/features/${id}`);
  },

  // ==================== TESTIMONIALS MANAGEMENT ====================
  getTestimonials: async (): Promise<Testimonial[]> => {
    const response = await apiClient.get('/admin/testimonials');
    return extractArray<Testimonial>(response);
  },

  createTestimonial: async (data: CreateTestimonialData): Promise<Testimonial> => {
    const response = await apiClient.post('/admin/testimonials', data);
    return extractObject<Testimonial>(response) || (response.data as Testimonial);
  },

  updateTestimonial: async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
    const response = await apiClient.patch(`/admin/testimonials/${id}`, data);
    return extractObject<Testimonial>(response) || (response.data as Testimonial);
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/testimonials/${id}`);
  },
};