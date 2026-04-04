// app/(app)/dashboard/admin/page.tsx - Fixed data fetching
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, Truck, Briefcase, DollarSign, Clock, CheckCircle, 
  TrendingUp, Activity, Shield, Search, RefreshCw, Eye,
  LayoutDashboard, UsersRound, ClipboardList, MapPin, Package, 
  Star, Sparkles, Bell, Crown, AlertCircle, XCircle,
  UserCheck, UserX
} from 'lucide-react';
import { DashboardLoader } from '../components/DashboardLoader';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';

// Types
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
  averageRating: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [pendingDriversCount, setPendingDriversCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [statsRes, jobsRes, driversRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/jobs?limit=5'),
        apiClient.get('/admin/drivers/pending')
      ]);
      
      console.log('Stats response:', statsRes);
      console.log('Jobs response:', jobsRes);
      console.log('Drivers response:', driversRes);
      
      // Extract data safely
      const statsData = statsRes?.data || statsRes || {};
      const jobsData = jobsRes?.data || jobsRes || [];
      const driversData = driversRes?.data || driversRes || [];
      
      // Ensure jobs is an array
      const jobsArray = Array.isArray(jobsData) ? jobsData : 
                       (jobsData.data ? (Array.isArray(jobsData.data) ? jobsData.data : []) : []);
      
      // Ensure drivers is an array
      const driversArray = Array.isArray(driversData) ? driversData : 
                          (driversData.data ? (Array.isArray(driversData.data) ? driversData.data : []) : []);
      
      // Calculate derived stats
      const totalJobs = statsData?.totalJobs || jobsArray.length || 0;
      const activeJobs = statsData?.activeJobs || jobsArray.filter((j: any) => j.status === 'ACTIVE').length || 0;
      const completedJobs = statsData?.completedJobs || jobsArray.filter((j: any) => j.status === 'COMPLETED').length || 0;
      const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
      
      setStats({
        totalUsers: statsData?.totalUsers || 0,
        totalClients: statsData?.totalClients || 0,
        totalDrivers: statsData?.totalDrivers || 0,
        pendingDrivers: statsData?.pendingDrivers || driversArray.length || 0,
        pendingJobs: statsData?.pendingJobs || 0,
        totalJobs: totalJobs,
        activeJobs: activeJobs,
        completedJobs: completedJobs,
        totalRevenue: statsData?.totalRevenue || 0,
        completionRate: statsData?.completionRate || completionRate,
        averageRating: statsData?.averageRating || 4.8,
      });
      
      setRecentJobs(jobsArray.slice(0, 5));
      setPendingDriversCount(driversArray.length || statsData?.pendingDrivers || 0);
      
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Check admin access
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return <DashboardLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <DashboardLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user?.firstName}! Here's what's happening today.
            </p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users} 
            color="blue"
            subtext={`${stats.totalClients} Clients • ${stats.totalDrivers} Drivers`}
          />
          <StatCard 
            title="Total Jobs" 
            value={stats.totalJobs} 
            icon={Briefcase} 
            color="purple"
            subtext={`${stats.activeJobs} Active • ${stats.completedJobs} Completed`}
          />
          <StatCard 
            title="Pending" 
            value={stats.pendingDrivers + stats.pendingJobs} 
            icon={Clock} 
            color="yellow"
            subtext={`${stats.pendingDrivers} Drivers • ${stats.pendingJobs} Jobs`}
          />
          <StatCard 
            title="Revenue" 
            value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}k`} 
            icon={DollarSign} 
            color="green"
            subtext={`${stats.completionRate}% Completion Rate`}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-400">Completion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-gray-400">Active Jobs</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-xs text-gray-400">Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingDrivers + stats.pendingJobs}</p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentJobs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">No recent jobs</div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{job.title || 'Transport Job'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      {job.pickUpLocation} → {job.dropOffLocation}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    job.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                    job.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}