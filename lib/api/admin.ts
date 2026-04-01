// src/lib/api/admin.ts
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

// Helper function to extract array from response
function extractArray<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.items)) {
      return response.items;
    }
    if (Array.isArray(response.users)) {
      return response.users;
    }
    if (Array.isArray(response.jobs)) {
      return response.jobs;
    }
    if (Array.isArray(response.features)) {
      return response.features;
    }
    if (Array.isArray(response.testimonials)) {
      return response.testimonials;
    }
  }
  
  return [];
}

export const adminAPI = {
  // ==================== DASHBOARD STATS ====================
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return response as unknown as AdminStats;
  },

  // ==================== DRIVER APPROVALS ====================
  
  // Get pending driver applications - uses /admin/drivers/pending
  getPendingDrivers: async (): Promise<PendingDriver[]> => {
    const response = await apiClient.get('/admin/drivers/pending');
    return extractArray<PendingDriver>(response);
  },

  // Approve driver - uses POST /admin/drivers/{userId}/approve
  approveDriver: async (userId: string, notes?: string): Promise<void> => {
    await apiClient.post(`/admin/drivers/${userId}/approve`, { notes });
  },

  // Reject driver - uses POST /admin/drivers/{userId}/reject
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
    return response as unknown as Feature;
  },

  updateFeature: async (id: string, data: UpdateFeatureData): Promise<Feature> => {
    const response = await apiClient.patch(`/admin/features/${id}`, data);
    return response as unknown as Feature;
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
    return response as unknown as Testimonial;
  },

  updateTestimonial: async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
    const response = await apiClient.patch(`/admin/testimonials/${id}`, data);
    return response as unknown as Testimonial;
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/testimonials/${id}`);
  },
};