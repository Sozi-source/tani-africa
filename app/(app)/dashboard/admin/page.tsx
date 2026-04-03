// app/(app)/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { useJobs } from '@/lib/hooks/useJobs';
import { useRouter } from 'next/navigation';
import {
  Users,
  Truck,
  Briefcase,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  UserPlus,
  Calendar,
  MapPin,
  Package,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  MessageSquare,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { DashboardLoader } from '../components/DashboardLoader';
import { DashboardError } from '../components/DashboardError';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';

interface AdminDashboardProps {
  user?: any;
}

export default function AdminDashboard({ user: propUser }: AdminDashboardProps) {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const user = propUser || authUser;
  
  const { stats, users, pendingDrivers, loading: adminLoading, error: adminError, refetch } = useAdmin();
  const { jobs, loading: jobsLoading } = useJobs();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'drivers' | 'jobs'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    console.log('AdminDashboard - User:', user);
    console.log('AdminDashboard - User role:', user?.role);
    console.log('Loading states:', { adminLoading, jobsLoading });
  }, [user, adminLoading, jobsLoading]);

  if (adminLoading || jobsLoading) {
    return <DashboardLoader />;
  }

  if (!user) {
    return (
      <DashboardError 
        message="User not found. Please log in again." 
        onRetry={() => router.push('/auth/login')} 
      />
    );
  }

  if (adminError) {
    return <DashboardError message={adminError} onRetry={refetch} />;
  }

  // Filter users based on search
  const filteredUsers = users?.filter(u => 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filter pending drivers
  const filteredDrivers = pendingDrivers?.filter(d =>
    d.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate stats
  const totalRevenue = stats?.totalRevenue || 0;
  const activeJobs = jobs?.filter(j => j.status === 'ACTIVE').length || 0;
  const completedJobs = jobs?.filter(j => j.status === 'COMPLETED').length || 0;
  const pendingJobs = jobs?.filter(j => j.status === 'SUBMITTED').length || 0;
  const totalUsers = stats?.totalUsers || users?.length || 0;
  const totalDrivers = stats?.totalDrivers || users?.filter(u => u.role === 'DRIVER').length || 0;
  const totalClients = stats?.totalClients || users?.filter(u => u.role === 'CLIENT').length || 0;
  const pendingDriversCount = pendingDrivers?.length || 0;

  const handleApproveDriver = async (userId: string) => {
    try {
      setProcessingId(userId);
      await apiClient.post(`/admin/drivers/${userId}/approve`);
      toast.success('Driver approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve driver');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDriver = async (userId: string) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    try {
      setProcessingId(userId);
      await apiClient.post(`/admin/drivers/${userId}/reject`, { reason: rejectionReason });
      toast.success('Driver rejected');
      setShowDriverModal(false);
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject driver');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role });
      toast.success(`User role updated to ${role}`);
      refetch();
      setShowUserModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      refetch();
      setShowUserModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.firstName || user.email}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-blue-600">👥 {totalClients} Clients</span>
                    <span className="text-xs text-green-600">🚚 {totalDrivers} Drivers</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs || 0}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-green-600">▶️ {activeJobs} Active</span>
                    <span className="text-xs text-gray-600">✅ {completedJobs} Completed</span>
                  </div>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingDriversCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Driver applications</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    KES {totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time earnings</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'drivers'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Truck className="h-4 w-4 inline mr-2" />
              Pending Drivers
              {pendingDriversCount > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  {pendingDriversCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'jobs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              Jobs
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        {(activeTab === 'users' || activeTab === 'drivers') && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats?.totalJobs ? Math.round((completedJobs / stats.totalJobs) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-xl font-bold text-gray-900">
                        {users?.filter(u => u.isActive !== false).length || 0}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardBody className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {jobs?.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {job.title || 'New Job'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.pickUpLocation} → {job.dropOffLocation}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        job.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                  {(!jobs || jobs.length === 0) && (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {/* Users Tab - Beautiful Redesign */}
{activeTab === 'users' && (
  <div className="space-y-4">
    {filteredUsers.length === 0 ? (
      <Card>
        <CardBody className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No users found</p>
        </CardBody>
      </Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => (
          <Card key={u.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden">
            <CardBody className="p-0">
              {/* Gradient Header based on role */}
              <div className={`h-2 ${
                u.role === 'ADMIN' ? 'bg-gradient-to-r from-purple-500 to-purple-700' :
                u.role === 'DRIVER' ? 'bg-gradient-to-r from-blue-500 to-blue-700' :
                'bg-gradient-to-r from-green-500 to-green-700'
              }`} />
              
              <div className="p-5">
                {/* Avatar and Role Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      u.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                      u.role === 'DRIVER' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                      'bg-gradient-to-br from-green-500 to-green-700'
                    }`}>
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {u.firstName} {u.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'DRIVER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.isActive !== false ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>
                
                {/* User Details */}
                <div className="space-y-2 mb-4">
                  {u.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{u.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  {u.totalTrips !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span>{u.totalTrips} trips completed</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(u);
                      setShowUserModal(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    variant={u.isActive !== false ? "danger" : "primary"}
                    onClick={() => handleUpdateUserStatus(u.id, u.isActive === false)}
                    className="flex-1"
                  >
                    {u.isActive !== false ? (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )}
  </div>
)}

        {/* Pending Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            {filteredDrivers.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending driver applications</p>
                </CardBody>
              </Card>
            ) : (
              filteredDrivers.map((driver) => (
                <Card key={driver.id} className="hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {driver.user?.firstName} {driver.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{driver.user?.email}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>License: {driver.licenseNumber}</span>
                            <span>Exp: {driver.experienceYears} years</span>
                            <span>Vehicle: {driver.vehicleType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowDriverModal(true);
                          }}
                        >
                          Review
                        </Button>
                        <Button
                          size="sm"
                          loading={processingId === driver.userId}
                          onClick={() => handleApproveDriver(driver.userId)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {!jobs || jobs.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No jobs found</p>
                </CardBody>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {job.title || 'Transport Job'}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            job.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                            job.status === 'BIDDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{job.pickUpLocation}</span>
                            <span>→</span>
                            <span className="text-gray-600">{job.dropOffLocation}</span>
                          </div>
                          <div className="flex gap-3">
                            {job.cargoType && (
                              <span className="text-xs text-gray-500">📦 {job.cargoType}</span>
                            )}
                            {job.cargoWeight && (
                              <span className="text-xs text-gray-500">⚖️ {job.cargoWeight}kg</span>
                            )}
                            <span className="text-xs text-gray-500">💰 KES {job.price?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="DRIVER">Driver</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedUser.isActive !== false ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateUserStatus(selectedUser.id, true)}
                    >
                      Active
                    </Button>
                    <Button
                      variant={selectedUser.isActive === false ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateUserStatus(selectedUser.id, false)}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateUserRole(selectedUser.id, selectedUser.role)}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Review Modal */}
      {showDriverModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Driver Application</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedDriver.user?.firstName} {selectedDriver.user?.lastName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <p className="text-gray-900">{selectedDriver.licenseNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900">{selectedDriver.experienceYears} years</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <p className="text-gray-900">{selectedDriver.vehicleType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDriverModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRejectDriver(selectedDriver.userId)}
                  loading={processingId === selectedDriver.userId}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveDriver(selectedDriver.userId)}
                  loading={processingId === selectedDriver.userId}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}