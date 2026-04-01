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
  ApiResponse 
} from '@/types';

// Helper function to extract array from response
function extractArray<T>(response: any, propertyName?: string): T[] {
  // If response is already an array
  if (Array.isArray(response)) {
    return response;
  }
  
  // If response is an object
  if (response && typeof response === 'object') {
    // Check for common array properties
    if (propertyName && Array.isArray(response[propertyName])) {
      return response[propertyName];
    }
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
    if (Array.isArray(response.drivers)) {
      return response.drivers;
    }
  }
  
  // Return empty array if nothing found
  return [];
}

export const adminAPI = {
  // ==================== DASHBOARD STATS ====================
  
  /**
   * Get admin dashboard statistics
   */
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return response as unknown as AdminStats;
  },

  // ==================== DRIVER APPROVALS ====================
  
  /**
   * Get all pending driver applications
   * GET /driver-applications/pending
   */
  getPendingDrivers: async (): Promise<PendingDriver[]> => {
    const response = await apiClient.get('/driver-applications/pending');
    return extractArray<PendingDriver>(response);
  },

  /**
   * Approve a driver application
   * PATCH /driver-applications/:userId/approve
   */
  approveDriver: async (userId: string, notes?: string): Promise<void> => {
    await apiClient.patch(`/driver-applications/${userId}/approve`, { notes });
  },

  /**
   * Reject a driver application
   * PATCH /driver-applications/:userId/reject
   */
  rejectDriver: async (userId: string, reason: string): Promise<void> => {
    await apiClient.patch(`/driver-applications/${userId}/reject`, { reason });
  },

  // ==================== USER MANAGEMENT ====================
  
  /**
   * Get all users with pagination
   */
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    return extractArray<User>(response);
  },

  /**
   * Update a user's role
   */
  updateUserRole: async (userId: string, role: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Update a user's active status
   */
  updateUserStatus: async (userId: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // ==================== JOB MANAGEMENT ====================
  
  /**
   * Get all jobs with filters
   */
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

  /**
   * Delete a job
   */
  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/admin/jobs/${jobId}`);
  },

  // ==================== FEATURES MANAGEMENT ====================
  
  /**
   * Get all features
   */
  getFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get('/admin/features');
    return extractArray<Feature>(response);
  },

  /**
   * Create a new feature
   */
  createFeature: async (data: CreateFeatureData): Promise<Feature> => {
    const response = await apiClient.post('/admin/features', data);
    return response as unknown as Feature;
  },

  /**
   * Update an existing feature
   */
  updateFeature: async (id: string, data: UpdateFeatureData): Promise<Feature> => {
    const response = await apiClient.patch(`/admin/features/${id}`, data);
    return response as unknown as Feature;
  },

  /**
   * Delete a feature
   */
  deleteFeature: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/features/${id}`);
  },

  // ==================== TESTIMONIALS MANAGEMENT ====================
  
  /**
   * Get all testimonials
   */
  getTestimonials: async (): Promise<Testimonial[]> => {
    const response = await apiClient.get('/admin/testimonials');
    return extractArray<Testimonial>(response);
  },

  /**
   * Create a new testimonial
   */
  createTestimonial: async (data: CreateTestimonialData): Promise<Testimonial> => {
    const response = await apiClient.post('/admin/testimonials', data);
    return response as unknown as Testimonial;
  },

  /**
   * Update an existing testimonial
   */
  updateTestimonial: async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
    const response = await apiClient.patch(`/admin/testimonials/${id}`, data);
    return response as unknown as Testimonial;
  },

  /**
   * Delete a testimonial
   */
  deleteTestimonial: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/testimonials/${id}`);
  },
};