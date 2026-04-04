'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';

import {
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MapPin,
} from 'lucide-react';

import { DashboardLoader } from '../components/DashboardLoader';
import type { User } from '@/types';

/* ================= Types ================= */

interface Job {
  id: string;
  title?: string;
  status: string;
  pickUpLocation: string;
  dropOffLocation: string;
}

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalDrivers: number;
  pendingDrivers: number;
  pendingJobs: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  completionRate: number;
}

/* ================= Helpers ================= */

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/* ================= Page ================= */

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingDriversCount, setPendingDriversCount] = useState(0);

  /* ---------- Fetch ---------- */

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes,
        jobsRes,
        usersRes,
        driversRes,
      ] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/jobs'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/drivers/pending'),
      ]);

      const statsRaw = statsRes?.data || {};
      const jobsArray = extractArray(jobsRes?.data);
      const usersArray = extractArray(usersRes?.data);
      const pendingDriversArray = extractArray(driversRes?.data);

      /* ---------- Derived Stats ---------- */

      const totalJobs = statsRaw.totalJobs ?? jobsArray.length;
      const activeJobs =
        statsRaw.activeJobs ??
        jobsArray.filter(j => j.status === 'ACTIVE').length;

      const completedJobs =
        statsRaw.completedJobs ??
        jobsArray.filter(j => j.status === 'COMPLETED').length;

      const completionRate =
        totalJobs > 0
          ? Math.round((completedJobs / totalJobs) * 100)
          : 0;

      setStats({
        totalUsers:
          statsRaw.totalUsers ?? usersArray.length,
        totalClients:
          statsRaw.totalClients ??
          usersArray.filter(u => u.role === 'CLIENT').length,
        totalDrivers:
          statsRaw.totalDrivers ??
          usersArray.filter(u => u.role === 'DRIVER').length,
        pendingDrivers:
          statsRaw.pendingDrivers ?? pendingDriversArray.length,
        pendingJobs: statsRaw.pendingJobs ?? 0,
        totalJobs,
        activeJobs,
        completedJobs,
        totalRevenue: statsRaw.totalRevenue ?? 0,
        completionRate,
      });

      setJobs(jobsArray.slice(0, 5));
      setUsers(usersArray.slice(0, 5));
      setPendingDriversCount(pendingDriversArray.length);

    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load admin dashboard');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Init ---------- */

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ---------- Guard ---------- */

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  /* ---------- States ---------- */

  if (loading) return <DashboardLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-xl text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return <DashboardLoader />;

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.firstName}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingDrivers + stats.pendingJobs}
            icon={Clock}
          />
          <StatCard
            title="Revenue"
            value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}k`}
            icon={DollarSign}
          />
        </div>

        {/* Jobs & Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent Jobs */}
          <Card title="Recent Jobs">
            {jobs.length === 0 ? (
              <Empty text="No jobs found" />
            ) : (
              jobs.map(job => (
                <Row key={job.id}>
                  <span>{job.title || 'Transport Job'}</span>
                  <span className="text-xs text-gray-500">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {job.pickUpLocation} → {job.dropOffLocation}
                  </span>
                </Row>
              ))
            )}
          </Card>

          {/* Recent Users */}
          <Card title="Recent Users">
            {users.length === 0 ? (
              <Empty text="No users found" />
            ) : (
              users.map(u => (
                <Row key={u.id}>
                  <span>{u.firstName} {u.lastName}</span>
                  <span className="text-xs text-gray-500">{u.role}</span>
                </Row>
              ))
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}

/* ================= Small Components ================= */

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-xl p-4 border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="px-4 py-3 border-b font-semibold text-sm">{title}</div>
      <div className="divide-y">{children}</div>
    </div>
  );
}

function Row({ children }: any) {
  return (
    <div className="px-4 py-3 flex justify-between text-sm">
      {children}
    </div>
  );
}

function Empty({ text }: any) {
  return (
    <div className="px-4 py-6 text-sm text-gray-500 text-center">
      {text}
    </div>
  );
}