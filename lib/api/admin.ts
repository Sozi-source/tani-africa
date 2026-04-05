// lib/api/admin.ts
import apiClient from './client';

import type {
  AdminStats,
  PendingDriver,
  PendingJob,
  User,
  Job,
} from '@/types';

/* =====================================================
   Helpers
===================================================== */

function extractArray<T>(response: any): T[] {
  if (!response) return [];

  const data = response.data ?? response;

  if (Array.isArray(data)) return data;

  if (typeof data === 'object') {
    const candidates = [
      data.data,
      data.items,
      data.results,
      data.users,
      data.jobs,
      data.drivers,
    ];

    const found = candidates.find(Array.isArray);
    if (found) return found as T[];
  }

  return [];
}

function extractObject<T>(response: any): T | null {
  if (!response) return null;

  const data = response.data ?? response;

  if (typeof data === 'object' && !Array.isArray(data)) {
    return data.data ?? data;
  }

  return null;
}

/* =====================================================
   ✅ ADMIN API
===================================================== */

export const adminAPI = {
  /* ================= DASHBOARD ================= */

  async getStats(): Promise<AdminStats> {
    const res = await apiClient.get('/admin/stats');
    return extractObject<AdminStats>(res)!;
  },

  /* ================= DRIVER APPROVALS ================= */

  async getPendingDrivers(): Promise<PendingDriver[]> {
    // ✅ FIXED: Use correct endpoint from API docs
    const res = await apiClient.get('/driver-applications/pending');
    return extractArray<PendingDriver>(res);
  },

  async approveDriver(userId: string, notes?: string): Promise<void> {
    // ✅ FIXED: Use PATCH method and correct endpoint
    await apiClient.patch(`/driver-applications/${userId}/approve`, { notes });
  },

  async rejectDriver(userId: string, reason: string): Promise<void> {
    // ✅ FIXED: Use PATCH method and correct endpoint
    await apiClient.patch(`/driver-applications/${userId}/reject`, { reason });
  },

  /* ================= JOB APPROVALS ================= */

  async getPendingJobs(): Promise<PendingJob[]> {
    const res = await apiClient.get('/admin/jobs/pending');
    return extractArray<PendingJob>(res);
  },

  async approveJob(jobId: string, notes?: string): Promise<void> {
    await apiClient.post(`/admin/jobs/${jobId}/approve`, { notes });
  },

  async rejectJob(jobId: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/jobs/${jobId}/reject`, { reason });
  },

  /* ================= USERS ================= */

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<User[]> {
    const query = new URLSearchParams();

    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);

    const url = `/admin/users${query.toString() ? `?${query}` : ''}`;
    const res = await apiClient.get(url);
    return extractArray<User>(res);
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  /* ================= JOB MANAGEMENT ================= */

  async getAllJobs(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Job[]> {
    const query = new URLSearchParams();

    if (filters?.status) query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);
    if (filters?.page) query.append('page', String(filters.page));
    if (filters?.limit) query.append('limit', String(filters.limit));

    const url = `/admin/jobs${query.toString() ? `?${query}` : ''}`;
    const res = await apiClient.get(url);
    return extractArray<Job>(res);
  },

  async getJobById(jobId: string): Promise<Job> {
    const res = await apiClient.get(`/admin/jobs/${jobId}`);
    return extractObject<Job>(res)!;
  },

  async deleteJob(jobId: string): Promise<void> {
    await apiClient.delete(`/admin/jobs/${jobId}`);
  },
};