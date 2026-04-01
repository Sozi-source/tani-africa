'use client';

import { useState, useCallback, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { 
  AdminStats, 
  PendingDriver, 
  User, 
  Job, 
  Feature, 
  Testimonial,
  CreateFeatureData,
  UpdateFeatureData,
  CreateTestimonialData,
  UpdateTestimonialData 
} from '@/types';
import toast from 'react-hot-toast';

// ==================== ADMIN STATS HOOK ====================

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// ==================== DRIVER APPROVALS HOOK ====================

export const useDriverApprovals = () => {
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingDrivers();
      setDrivers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load pending drivers');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveDriver = useCallback(async (userId: string, notes?: string) => {
    try {
      await adminAPI.approveDriver(userId, notes);
      toast.success('Driver approved successfully');
      await fetchDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve driver');
      throw err;
    }
  }, [fetchDrivers]);

  const rejectDriver = useCallback(async (userId: string, reason: string) => {
    try {
      await adminAPI.rejectDriver(userId, reason);
      toast.success('Driver rejected');
      await fetchDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject driver');
      throw err;
    }
  }, [fetchDrivers]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, loading, error, approveDriver, rejectDriver, refetch: fetchDrivers };
};

// ==================== USER MANAGEMENT HOOK ====================

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers({ search });
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      toast.success('User role updated');
      await fetchUsers(searchTerm);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
      throw err;
    }
  }, [fetchUsers, searchTerm]);

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      await fetchUsers(searchTerm);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
      throw err;
    }
  }, [fetchUsers, searchTerm]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      await fetchUsers(searchTerm);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
      throw err;
    }
  }, [fetchUsers, searchTerm]);

  useEffect(() => {
    fetchUsers(searchTerm);
  }, [fetchUsers, searchTerm]);

  return {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    refetch: () => fetchUsers(searchTerm),
  };
};

// ==================== ADMIN JOBS HOOK ====================

export const useAdminJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllJobs({ 
        status: filter !== 'all' ? filter : undefined,
        search: searchTerm || undefined
      });
      setJobs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      await adminAPI.deleteJob(jobId);
      toast.success('Job deleted successfully');
      await fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete job');
      throw err;
    }
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    deleteJob,
    refetch: fetchJobs,
  };
};

// ==================== FEATURES MANAGEMENT HOOK ====================

export const useAdminFeatures = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getFeatures();
      setFeatures(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFeature = useCallback(async (data: CreateFeatureData) => {
    try {
      const newFeature = await adminAPI.createFeature(data);
      toast.success('Feature created successfully');
      await fetchFeatures();
      return newFeature;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create feature');
      throw err;
    }
  }, [fetchFeatures]);

  const updateFeature = useCallback(async (id: string, data: UpdateFeatureData) => {
    try {
      const updated = await adminAPI.updateFeature(id, data);
      toast.success('Feature updated successfully');
      await fetchFeatures();
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update feature');
      throw err;
    }
  }, [fetchFeatures]);

  const deleteFeature = useCallback(async (id: string) => {
    try {
      await adminAPI.deleteFeature(id);
      toast.success('Feature deleted successfully');
      await fetchFeatures();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete feature');
      throw err;
    }
  }, [fetchFeatures]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    loading,
    error,
    createFeature,
    updateFeature,
    deleteFeature,
    refetch: fetchFeatures,
  };
};

// ==================== TESTIMONIALS MANAGEMENT HOOK ====================

export const useAdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getTestimonials();
      setTestimonials(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestimonial = useCallback(async (data: CreateTestimonialData) => {
    try {
      const newTestimonial = await adminAPI.createTestimonial(data);
      toast.success('Testimonial created successfully');
      await fetchTestimonials();
      return newTestimonial;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create testimonial');
      throw err;
    }
  }, [fetchTestimonials]);

  const updateTestimonial = useCallback(async (id: string, data: UpdateTestimonialData) => {
    try {
      const updated = await adminAPI.updateTestimonial(id, data);
      toast.success('Testimonial updated successfully');
      await fetchTestimonials();
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update testimonial');
      throw err;
    }
  }, [fetchTestimonials]);

  const deleteTestimonial = useCallback(async (id: string) => {
    try {
      await adminAPI.deleteTestimonial(id);
      toast.success('Testimonial deleted successfully');
      await fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete testimonial');
      throw err;
    }
  }, [fetchTestimonials]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return {
    testimonials,
    loading,
    error,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    refetch: fetchTestimonials,
  };
};