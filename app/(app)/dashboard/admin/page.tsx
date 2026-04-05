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
  UserCheck,
  Truck,
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

type ColorVariant = 'maroon' | 'teal' | 'green' | 'yellow';

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
        totalUsers: statsRaw.totalUsers ?? usersArray.length,
        totalClients: statsRaw.totalClients ??
          usersArray.filter(u => u.role === 'CLIENT').length,
        totalDrivers: statsRaw.totalDrivers ??
          usersArray.filter(u => u.role === 'DRIVER').length,
        pendingDrivers: statsRaw.pendingDrivers ?? pendingDriversArray.length,
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  if (loading) return <DashboardLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-xl text-center max-w-md shadow-lg border-l-4 border-maroon-500">
          <AlertCircle className="h-10 w-10 text-maroon-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return <DashboardLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user?.firstName}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-maroon-300 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="maroon" />
          <StatCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="teal" />
          <StatCard title="Pending Approvals" value={stats.pendingDrivers + stats.pendingJobs} icon={Clock} color="yellow" />
          <StatCard title="Revenue" value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} color="green" />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SmallStatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle} color="green" />
          <SmallStatCard title="Active Jobs" value={stats.activeJobs} icon={Activity} color="teal" />
          <SmallStatCard title="Total Drivers" value={stats.totalDrivers} icon={Truck} color="maroon" />
          <SmallStatCard title="Total Clients" value={stats.totalClients} icon={UserCheck} color="yellow" />
        </div>

        {/* Jobs & Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent Jobs */}
          <Card title="Recent Jobs" icon={Briefcase} color="maroon">
            {jobs.length === 0 ? (
              <Empty text="No jobs found" />
            ) : (
              jobs.map(job => (
                <Row key={job.id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{job.title || 'Transport Job'}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-teal-500" />
                      {job.pickUpLocation} → {job.dropOffLocation}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    job.status === 'ACTIVE' ? 'bg-teal-100 text-teal-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {job.status}
                  </span>
                </Row>
              ))
            )}
          </Card>

          {/* Recent Users */}
          <Card title="Recent Users" icon={Users} color="teal">
            {users.length === 0 ? (
              <Empty text="No users found" />
            ) : (
              users.map(u => (
                <Row key={u.id}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-maroon-600 flex items-center justify-center text-white text-xs font-semibold">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    u.role === 'ADMIN' ? 'bg-maroon-100 text-maroon-700' :
                    u.role === 'DRIVER' ? 'bg-teal-100 text-teal-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {u.role}
                  </span>
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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: ColorVariant;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const bgColors: Record<ColorVariant, string> = {
    maroon: 'bg-maroon-100',
    teal: 'bg-teal-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
  };

  const iconColors: Record<ColorVariant, string> = {
    maroon: 'text-maroon-600',
    teal: 'text-teal-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${bgColors[color]}`}>
          <Icon className={`h-5 w-5 ${iconColors[color]}`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
}

interface SmallStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: ColorVariant;
}

function SmallStatCard({ title, value, icon: Icon, color }: SmallStatCardProps) {
  const bgColors: Record<ColorVariant, string> = {
    maroon: 'bg-maroon-50 text-maroon-600',
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
      </div>
      <div className={`p-2 rounded-lg ${bgColors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  color: ColorVariant;
}

function Card({ title, children, icon: Icon, color }: CardProps) {
  const borderColors: Record<ColorVariant, string> = {
    maroon: 'border-maroon-500',
    teal: 'border-teal-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
  };

  const textColors: Record<ColorVariant, string> = {
    maroon: 'text-maroon-600',
    teal: 'text-teal-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className={`bg-white rounded-xl border-l-4 ${borderColors[color]} border border-gray-200 shadow-sm hover:shadow-md transition-all`}>
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 ${textColors[color]}`} />}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 flex justify-between items-center text-sm hover:bg-gray-50 transition-colors">
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-5 py-8 text-sm text-gray-500 text-center">
      <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
      {text}
    </div>
  );
}