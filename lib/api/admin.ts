// lib/api/admin.ts - Add getPendingJobs method
import apiClient from './client';
import { 
  AdminStats, 
  PendingDriver, 
  PendingJob,
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
    if (Array.isArray(data.drivers)) return data.drivers;
    
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
    try {
      const response = await apiClient.get('/admin/stats');
      return extractObject<AdminStats>(response) || (response.data as AdminStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // ==================== DRIVER APPROVALS ====================
  getPendingDrivers: async (): Promise<PendingDriver[]> => {
    try {
      const response = await apiClient.get('/admin/drivers/pending');
      return extractArray<PendingDriver>(response);
    } catch (error) {
      console.error('Error fetching pending drivers:', error);
      throw error;
    }
  },

  approveDriver: async (userId: string, notes?: string): Promise<void> => {
    try {
      await apiClient.post(`/admin/drivers/${userId}/approve`, { notes });
    } catch (error) {
      console.error('Error approving driver:', error);
      throw error;
    }
  },

  rejectDriver: async (userId: string, reason: string): Promise<void> => {
    try {
      await apiClient.post(`/admin/drivers/${userId}/reject`, { reason });
    } catch (error) {
      console.error('Error rejecting driver:', error);
      throw error;
    }
  },

  // ==================== JOB APPROVALS ====================
  getPendingJobs: async (): Promise<PendingJob[]> => {
    try {
      const response = await apiClient.get('/admin/jobs/pending');
      return extractArray<PendingJob>(response);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      throw error;
    }
  },

  approveJob: async (jobId: string, notes?: string): Promise<void> => {
    try {
      await apiClient.post(`/admin/jobs/${jobId}/approve`, { notes });
    } catch (error) {
      console.error('Error approving job:', error);
      throw error;
    }
  },

  rejectJob: async (jobId: string, reason: string): Promise<void> => {
    try {
      await apiClient.post(`/admin/jobs/${jobId}/reject`, { reason });
    } catch (error) {
      console.error('Error rejecting job:', error);
      throw error;
    }
  },

  // ==================== USER MANAGEMENT ====================
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<User[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return extractArray<User>(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // ==================== JOB MANAGEMENT ====================
  getAllJobs: async (filters?: { status?: string; search?: string; page?: number; limit?: number }): Promise<Job[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const url = `/admin/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return extractArray<Job>(response);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  deleteJob: async (jobId: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/jobs/${jobId}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // ==================== FEATURES MANAGEMENT ====================
  getFeatures: async (): Promise<Feature[]> => {
    try {
      const response = await apiClient.get('/admin/features');
      return extractArray<Feature>(response);
    } catch (error) {
      console.error('Error fetching features:', error);
      throw error;
    }
  },

  createFeature: async (data: CreateFeatureData): Promise<Feature> => {
    try {
      const response = await apiClient.post('/admin/features', data);
      return extractObject<Feature>(response) || (response.data as Feature);
    } catch (error) {
      console.error('Error creating feature:', error);
      throw error;
    }
  },

  updateFeature: async (id: string, data: UpdateFeatureData): Promise<Feature> => {
    try {
      const response = await apiClient.patch(`/admin/features/${id}`, data);
      return extractObject<Feature>(response) || (response.data as Feature);
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  },

  deleteFeature: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/features/${id}`);
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  },

  // ==================== TESTIMONIALS MANAGEMENT ====================
  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const response = await apiClient.get('/admin/testimonials');
      return extractArray<Testimonial>(response);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  createTestimonial: async (data: CreateTestimonialData): Promise<Testimonial> => {
    try {
      const response = await apiClient.post('/admin/testimonials', data);
      return extractObject<Testimonial>(response) || (response.data as Testimonial);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },

  updateTestimonial: async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
    try {
      const response = await apiClient.patch(`/admin/testimonials/${id}`, data);
      return extractObject<Testimonial>(response) || (response.data as Testimonial);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/testimonials/${id}`);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  },

  getJobById: async (jobId: string): Promise<Job> => {
  try {
    const response = await apiClient.get(`/admin/jobs/${jobId}`);
    return response.data || response;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
},
};