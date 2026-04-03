// app/(app)/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Users, Truck, Briefcase, DollarSign, UserCheck, UserX,
  Clock, CheckCircle, XCircle, TrendingUp, Activity, Shield,
  Search, RefreshCw, Eye, LogOut, LayoutDashboard, UsersRound,
  ClipboardList, MapPin, Package, Star, Sparkles, Bell, Crown,
  AlertCircle
} from 'lucide-react';
import { DashboardLoader } from '../components/DashboardLoader';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'DRIVER' | 'CLIENT';
  isActive: boolean;
  createdAt: string;
  rating?: number;
  totalTrips?: number;
}

interface Job {
  id: string;
  title: string;
  pickUpLocation: string;
  dropOffLocation: string;
  status: 'SUBMITTED' | 'BIDDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  price: number;
  cargoType?: string;
  cargoWeight?: number;
  createdAt: string;
}

interface PendingDriver {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  licenseNumber: string;
  experienceYears: number;
  vehicleType: string;
  appliedAt: string;
  rating?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalDrivers: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingDrivers: number;
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
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'user' | 'driver' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  const calculateAverageRating = (usersList: User[]): number => {
    const driversWithRating = usersList.filter(u => u.role === 'DRIVER' && u.rating && u.rating > 0);
    if (driversWithRating.length === 0) return 0;
    const sum = driversWithRating.reduce((acc, driver) => acc + (driver.rating || 0), 0);
    return parseFloat((sum / driversWithRating.length).toFixed(1));
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, usersRes, jobsRes, driversRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/jobs'),
        apiClient.get('/admin/drivers/pending')
      ]);
      
      const statsData = statsRes.data || statsRes;
      const usersData = usersRes.data || usersRes;
      const jobsData = jobsRes.data || jobsRes;
      const driversData = driversRes.data || driversRes;
      
      const usersArray = Array.isArray(usersData) ? usersData : [];
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      const driversArray = Array.isArray(driversData) ? driversData : [];
      
      const totalJobs = jobsArray.length;
      const activeJobs = jobsArray.filter((j: Job) => j.status === 'ACTIVE').length;
      const completedJobs = jobsArray.filter((j: Job) => j.status === 'COMPLETED').length;
      const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
      
      let averageRating = statsData?.averageRating || statsData?.avgRating || 0;
      if (averageRating === 0) {
        averageRating = calculateAverageRating(usersArray);
      }
      
      setStats({
        totalUsers: statsData?.totalUsers || usersArray.length,
        totalClients: statsData?.totalClients || usersArray.filter((u: User) => u.role === 'CLIENT').length,
        totalDrivers: statsData?.totalDrivers || usersArray.filter((u: User) => u.role === 'DRIVER').length,
        totalJobs: statsData?.totalJobs || totalJobs,
        activeJobs: statsData?.activeJobs || activeJobs,
        completedJobs: statsData?.completedJobs || completedJobs,
        pendingDrivers: statsData?.pendingDrivers || driversArray.length,
        totalRevenue: statsData?.totalRevenue || 0,
        completionRate: statsData?.completionRate || completionRate,
        averageRating: averageRating,
      });
      
      setUsers(usersArray);
      setJobs(jobsArray);
      setPendingDrivers(driversArray);
      
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    fetchAllData();
  }, []);

  if (!loading && (!user?.role || user.role !== 'ADMIN')) {
    router.push('/dashboard');
    return null;
  }

  const handleApproveDriver = async (userId: string) => {
    setProcessing(true);
    try {
      await apiClient.post(`/admin/drivers/${userId}/approve`);
      toast.success('Driver approved successfully');
      await fetchAllData();
      setModalType(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDriver = async (userId: string) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await apiClient.post(`/admin/drivers/${userId}/reject`, { reason: rejectionReason });
      toast.success('Driver rejected');
      await fetchAllData();
      setModalType(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role });
      toast.success(`User role updated to ${role}`);
      await fetchAllData();
      setModalType(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      await fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      await fetchAllData();
      setModalType(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDrivers = pendingDrivers.filter(d =>
    `${d.user?.firstName} ${d.user?.lastName} ${d.user?.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const statsCards = [
    { title: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue', sub: `${stats?.totalClients || 0}C / ${stats?.totalDrivers || 0}D` },
    { title: 'Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'purple', sub: `${stats?.activeJobs || 0}A / ${stats?.completedJobs || 0}C` },
    { title: 'Pending', value: stats?.pendingDrivers || 0, icon: Clock, color: 'amber', sub: 'Driver apps' },
    { title: 'Revenue', value: `KES ${((stats?.totalRevenue || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'green', sub: `${stats?.completionRate || 0}% complete` },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: UsersRound, count: stats?.totalUsers },
    { id: 'drivers', label: 'Drivers', icon: Truck, count: stats?.pendingDrivers, highlight: (stats?.pendingDrivers || 0) > 0 },
    { id: 'jobs', label: 'Jobs', icon: ClipboardList, count: stats?.totalJobs },
  ];

  if (loading) return <DashboardLoader />;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
        <p className="text-sm md:text-base text-gray-500 mb-4">{error}</p>
        <button onClick={fetchAllData} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm md:text-base">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      
      {/* Compact Welcome Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-teal-500 to-sky-500 text-white">
          <div className="px-4 py-3 md:py-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <span className="text-base md:text-lg font-medium">{greeting},</span>
                  <span className="text-base md:text-lg font-semibold">{user?.firstName}!</span>
                  <span className="hidden sm:inline text-white/80 text-sm md:text-base">•</span>
                  <span className="text-sm md:text-base text-white/90 flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {stats?.pendingDrivers || 0} pending {(stats?.pendingDrivers || 0) === 1 ? 'driver' : 'drivers'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('drivers')}
                  className="text-sm md:text-base bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Review
                </button>
                <button onClick={() => setShowBanner(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Notification when banner closed */}
      {!showBanner && (stats?.pendingDrivers || 0) > 0 && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="px-4 py-2 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm md:text-base text-amber-700">
                <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>{stats?.pendingDrivers || 0} pending driver {(stats?.pendingDrivers || 0) === 1 ? 'application' : 'applications'}</span>
              </div>
              <button onClick={() => setActiveTab('drivers')} className="text-sm md:text-base text-amber-600 font-medium hover:underline">Review now →</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm md:text-base text-gray-500 hidden md:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchAllData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="h-5 w-5 md:h-5 md:w-5" />
              </button>
              <button onClick={() => { logout(); router.push('/auth/login'); }} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                <LogOut className="h-5 w-5 md:h-5 md:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
        
        {/* Stats Grid - Increased Font Sizes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            const colors = {
              blue: 'bg-blue-50 text-blue-600',
              purple: 'bg-purple-50 text-purple-600',
              amber: 'bg-amber-50 text-amber-600',
              green: 'bg-green-50 text-green-600',
            };
            return (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className={`p-2 md:p-3 rounded-xl ${colors[stat.color as keyof typeof colors]}`}>
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-400">{stat.sub}</span>
                </div>
                <p className="text-2xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm md:text-base text-gray-500 mt-1">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs - Increased Font Sizes */}
        <div className="flex gap-1 md:gap-2 border-b border-gray-200 mb-4 md:mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base whitespace-nowrap border-b-2 transition-all ${
                  isActive ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-xs md:text-sm px-1.5 py-0.5 rounded-full ${tab.highlight ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search - Increased Font Sizes */}
        {(activeTab === 'users' || activeTab === 'drivers') && (
          <div className="relative mb-4 md:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 text-sm md:text-base rounded-xl border border-gray-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        )}

        {/* Overview Tab - Increased Font Sizes */}
        {activeTab === 'overview' && (
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 md:p-2 bg-green-100 rounded-lg"><TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" /></div>
                  <span className="text-xs md:text-sm text-gray-500">Completion</span>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stats?.completionRate || 0}%</p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg"><Activity className="h-4 w-4 md:h-5 md:w-5 text-blue-600" /></div>
                  <span className="text-xs md:text-sm text-gray-500">Active Jobs</span>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stats?.activeJobs || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg"><Star className="h-4 w-4 md:h-5 md:w-5 text-purple-600" /></div>
                  <span className="text-xs md:text-sm text-gray-500">Rating</span>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 md:h-4 md:w-4 ${
                          star <= Math.round(stats?.averageRating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 md:p-2 bg-amber-100 rounded-lg"><Shield className="h-4 w-4 md:h-5 md:w-5 text-amber-600" /></div>
                  <span className="text-xs md:text-sm text-gray-500">Pending</span>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stats?.pendingDrivers || 0}</p>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-base md:text-lg">Recent Jobs</h3>
                <span className="text-xs md:text-sm text-gray-400">Last {Math.min(5, jobs.length)}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {jobs.slice(0, 5).map(job => (
                  <div key={job.id} className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-medium text-gray-900 truncate">{job.title || 'Transport Job'}</p>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
                      </div>
                    </div>
                    <span className={`text-xs md:text-sm px-2 py-1 rounded-full ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      job.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="px-4 md:px-6 py-8 text-center text-gray-500 text-sm md:text-base">No jobs yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab - Increased Font Sizes */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-sm md:text-base font-semibold ${
                      u.role === 'ADMIN' ? 'bg-purple-500' : u.role === 'DRIVER' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate max-w-[150px]">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs md:text-sm px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'DRIVER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>{u.role}</span>
                    {u.rating && u.rating > 0 && (
                      <div className="flex items-center gap-0.5 mt-1 justify-end">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-500">{u.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setSelectedItem(u); setModalType('user'); }} className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Manage
                  </button>
                  <button onClick={() => handleUpdateUserStatus(u.id, !u.isActive)} className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                    u.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && <div className="col-span-full text-center py-12 text-gray-500 text-sm md:text-base">No users found</div>}
          </div>
        )}

        {/* Drivers Tab - Increased Font Sizes */}
        {activeTab === 'drivers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredDrivers.map(d => (
              <div key={d.id} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-gray-900">{d.user?.firstName} {d.user?.lastName}</p>
                      <p className="text-xs md:text-sm text-gray-500">{d.user?.email}</p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs md:text-sm px-2 py-0.5 rounded-full">Pending</span>
                </div>
                <div className="text-xs md:text-sm text-gray-500 mb-3 truncate">License: {d.licenseNumber} • {d.experienceYears} yrs exp</div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedItem(d); setModalType('driver'); }} className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Review
                  </button>
                  <button onClick={() => handleApproveDriver(d.userId)} disabled={processing} className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {filteredDrivers.length === 0 && <div className="col-span-full text-center py-12 text-gray-500 text-sm md:text-base">No pending drivers</div>}
          </div>
        )}

        {/* Jobs Tab - Increased Font Sizes */}
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 flex-1">{job.title || 'Transport Job'}</h3>
                  <span className={`text-xs md:text-sm px-2 py-0.5 rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    job.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{job.status}</span>
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-2">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.cargoType && <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">📦 {job.cargoType}</span>}
                  <span className="text-xs md:text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">KES {job.price?.toLocaleString()}</span>
                </div>
                <button onClick={() => router.push(`/jobs/${job.id}`)} className="w-full py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3 md:h-4 md:w-4" /> View Details
                </button>
              </div>
            ))}
            {jobs.length === 0 && <div className="col-span-full text-center py-12 text-gray-500 text-sm md:text-base">No jobs found</div>}
          </div>
        )}
      </div>

      {/* User Modal - Increased Font Sizes */}
      {modalType === 'user' && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-base md:text-lg">Manage User</h3>
              <button onClick={() => setModalType(null)}><XCircle className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base ${
                  selectedItem.role === 'ADMIN' ? 'bg-purple-500' : selectedItem.role === 'DRIVER' ? 'bg-blue-500' : 'bg-green-500'
                }`}>{selectedItem.firstName?.[0]}{selectedItem.lastName?.[0]}</div>
                <div><p className="font-semibold text-base">{selectedItem.firstName} {selectedItem.lastName}</p><p className="text-sm text-gray-500">{selectedItem.email}</p></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={selectedItem.role} onChange={(e) => setSelectedItem({...selectedItem, role: e.target.value})} className="w-full rounded-lg border p-2.5 text-sm">
                  <option value="CLIENT">Client</option><option value="DRIVER">Driver</option><option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModalType(null)} className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={() => handleUpdateUserRole(selectedItem.id, selectedItem.role)} className="flex-1 py-2 text-sm bg-teal-600 text-white rounded-lg">Save</button>
                <button onClick={() => handleDeleteUser(selectedItem.id)} className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Modal - Increased Font Sizes */}
      {modalType === 'driver' && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-base md:text-lg">Review Driver Application</h3>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-sm text-gray-500">Name</label><p className="text-base font-medium">{selectedItem.user?.firstName} {selectedItem.user?.lastName}</p></div>
              <div><label className="text-sm text-gray-500">License Number</label><p className="text-base">{selectedItem.licenseNumber}</p></div>
              <div><label className="text-sm text-gray-500">Experience</label><p className="text-base">{selectedItem.experienceYears} years</p></div>
              <div><label className="text-sm text-gray-500">Vehicle Type</label><p className="text-base">{selectedItem.vehicleType || 'Not specified'}</p></div>
              {selectedItem.rating && selectedItem.rating > 0 && (
                <div><label className="text-sm text-gray-500">Rating</label><p className="text-base flex items-center gap-1">{selectedItem.rating} <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /></p></div>
              )}
              <div><label className="text-sm font-medium">Rejection Reason</label><textarea rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm" placeholder="Enter reason for rejection..." /></div>
            </div>
            <div className="p-5 flex gap-3 border-t border-gray-100">
              <button onClick={() => setModalType(null)} className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => handleRejectDriver(selectedItem.userId)} disabled={processing} className="flex-1 py-2 text-sm text-red-600 bg-red-50 rounded-lg">Reject</button>
              <button onClick={() => handleApproveDriver(selectedItem.userId)} disabled={processing} className="flex-1 py-2 text-sm bg-green-600 text-white rounded-lg">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}