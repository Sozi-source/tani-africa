'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAdminUsers, useDriverApprovals } from '@/lib/hooks/useAdmin';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Truck,
  Package,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Award,
  Clock,
  TrendingUp,
  MapPin,
  Car,
  Gavel,
  Eye,
  Edit,
  RefreshCw,
  Ban,
  UserCheck,
  MessageSquare,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DriverStats {
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalEarnings: number;
  averageRating: number;
  totalBids: number;
  acceptedBids: number;
  successRate: number;
}

export default function AdminDriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const { users, loading: usersLoading, updateUserStatus, updateUserRole } = useAdminUsers();
  const { approveDriver, rejectDriver } = useDriverApprovals();
  const { jobs, loading: jobsLoading } = useJobs();
  const { bids, loading: bidsLoading } = useBids();
  const { vehicles, loading: vehiclesLoading } = useVehicles(params.id as string);
  
  const [driver, setDriver] = useState<any>(null);
  const [driverJobs, setDriverJobs] = useState<any[]>([]);
  const [driverBids, setDriverBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'bids' | 'vehicles' | 'activity'>('jobs');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const driverId = params.id as string;

  useEffect(() => {
    if (driverId && users.length > 0) {
      const foundDriver = users.find(u => u.id === driverId);
      setDriver(foundDriver);
      
      // Filter jobs for this driver
      const driverJobsData = jobs.filter(job => job.driverId === driverId);
      setDriverJobs(driverJobsData);
      
      // Filter bids for this driver
      const driverBidsData = bids.filter(bid => bid.driverId === driverId);
      setDriverBids(driverBidsData);
      
      setLoading(false);
    }
  }, [driverId, users, jobs, bids]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleApproveDriver = async () => {
    setIsUpdating(true);
    try {
      await approveDriver(driverId);
      toast.success(`${driver?.firstName} ${driver?.lastName} has been approved as a driver`);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to approve driver');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectDriver = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsUpdating(true);
    try {
      await rejectDriver(driverId, rejectionReason);
      toast.success(`Driver application rejected`);
      setShowRejectModal(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reject driver');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSuspendDriver = async () => {
    if (confirm(`Are you sure you want to suspend ${driver?.firstName} ${driver?.lastName}?`)) {
      setIsUpdating(true);
      try {
        await updateUserStatus(driverId, false);
        toast.success('Driver suspended successfully');
        window.location.reload();
      } catch (error) {
        toast.error('Failed to suspend driver');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleActivateDriver = async () => {
    setIsUpdating(true);
    try {
      await updateUserStatus(driverId, true);
      toast.success('Driver activated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to activate driver');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateStats = (): DriverStats => {
    const completedJobs = driverJobs.filter(job => job.status === 'COMPLETED');
    const cancelledJobs = driverJobs.filter(job => job.status === 'CANCELLED');
    const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0);
    const acceptedBids = driverBids.filter(bid => bid.status === 'ACCEPTED');
    const successRate = driverBids.length > 0 
      ? (acceptedBids.length / driverBids.length) * 100 
      : 0;
    
    return {
      totalJobs: driverJobs.length,
      completedJobs: completedJobs.length,
      cancelledJobs: cancelledJobs.length,
      totalEarnings,
      averageRating: driver?.rating || 0,
      totalBids: driverBids.length,
      acceptedBids: acceptedBids.length,
      successRate: Math.round(successRate),
    };
  };

  const stats = calculateStats();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    };
    const cfg = config[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  const getJobStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800' },
      BIDDING: { label: 'Bidding', color: 'bg-blue-100 text-blue-800' },
      ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    return config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getBidStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800' },
      PENDING: { label: 'Pending', color: 'bg-blue-100 text-blue-800' },
      ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-800' },
    };
    return config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading || usersLoading || jobsLoading || bidsLoading || vehiclesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="container-custom py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Driver Not Found</h2>
        <p className="mt-2 text-gray-600">The driver you're looking for doesn't exist.</p>
        <Link href="/admin/drivers">
          <Button className="mt-4">Back to Drivers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/drivers"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Drivers
          </Link>
          
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {driver.firstName} {driver.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {getStatusBadge(driver.isActive ? 'ACTIVE' : 'SUSPENDED')}
                {driver.approvalStatus === false && driver.role === 'DRIVER' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                    <Clock className="h-3 w-3" />
                    Pending Approval
                  </span>
                )}
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined: {new Date(driver.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {driver.approvalStatus === false && (
                <>
                  <Button
                    onClick={handleApproveDriver}
                    disabled={isUpdating}
                    variant="primary"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Approve Driver
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isUpdating}
                    variant="danger"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {driver.isActive ? (
                <Button
                  onClick={handleSuspendDriver}
                  disabled={isUpdating}
                  variant="danger"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend Driver
                </Button>
              ) : (
                <Button
                  onClick={handleActivateDriver}
                  disabled={isUpdating}
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate Driver
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                disabled={isUpdating}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Driver Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <CardBody className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
                    {driver.firstName?.[0]}{driver.lastName?.[0]}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h2>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                  {driver.phone && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      {driver.phone}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{driver.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Driver ID</span>
                    <span className="text-sm font-mono text-gray-600">{driver.id.slice(0, 8)}...</span>
                  </div>
                  {driver.drivingLicense && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">License Number</span>
                      <span className="text-sm font-medium text-gray-900">{driver.drivingLicense}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm text-gray-600">{new Date(driver.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Login</span>
                    <span className="text-sm text-gray-600">
                      {driver.lastLoginAt ? new Date(driver.lastLoginAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardBody className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  Performance Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Jobs</span>
                    <span className="font-semibold text-gray-900">{stats.totalJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">{stats.completedJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-600">{stats.cancelledJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-primary-600">KES {stats.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bids Placed</span>
                    <span className="font-semibold text-gray-900">{stats.totalBids}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accepted Bids</span>
                    <span className="font-semibold text-green-600">{stats.acceptedBids}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className={`font-semibold ${stats.successRate >= 70 ? 'text-green-600' : stats.successRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {stats.successRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rating</span>
                    <span className="font-semibold text-yellow-600 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {stats.averageRating}/5
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Vehicles Card */}
            {vehicles.length > 0 && (
              <Card>
                <CardBody className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary-500" />
                    Vehicles ({vehicles.length})
                  </h3>
                  <div className="space-y-2">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{vehicle.plateNumber}</p>
                          <p className="text-xs text-gray-500 capitalize">{vehicle.category?.replace(/_/g, ' ').toLowerCase()}</p>
                        </div>
                        {vehicle.isApproved ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Activity Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap gap-4">
                {[
                  { id: 'jobs', label: 'Jobs', icon: Package, count: driverJobs.length },
                  { id: 'bids', label: 'Bids', icon: Gavel, count: driverBids.length },
                  { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
                  { id: 'activity', label: 'Activity', icon: Clock, count: null },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        isActive
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {tab.count !== null && tab.count > 0 && (
                        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
                          isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {driverJobs.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No jobs assigned to this driver</p>
                  </div>
                ) : (
                  driverJobs.map((job) => {
                    const statusConfig = getJobStatusBadge(job.status);
                    return (
                      <Card key={job.id} hover>
                        <CardBody className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {job.title || `Job #${job.id.slice(-8)}`}
                              </h4>
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.pickUpLocation} → {job.dropOffLocation}
                              </div>
                              {job.price && (
                                <p className="text-lg font-bold text-primary-600">
                                  KES {job.price.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Link href={`/admin/jobs/${job.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-1 h-4 w-4" />
                                View Job
                              </Button>
                            </Link>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Bids Tab */}
            {activeTab === 'bids' && (
              <div className="space-y-4">
                {driverBids.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <Gavel className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No bids placed by this driver</p>
                  </div>
                ) : (
                  driverBids.map((bid) => {
                    const statusConfig = getBidStatusBadge(bid.status);
                    return (
                      <Card key={bid.id} hover>
                        <CardBody className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(bid.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Bid Amount: <span className="font-semibold text-primary-600">KES {bid.price.toLocaleString()}</span>
                              </p>
                              {bid.estimatedDuration && (
                                <p className="text-sm text-gray-500">Est. Duration: {bid.estimatedDuration} hours</p>
                              )}
                              {bid.message && (
                                <p className="mt-2 text-sm text-gray-500 italic">"{bid.message}"</p>
                              )}
                            </div>
                            <Link href={`/jobs/${bid.jobId}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-1 h-4 w-4" />
                                View Job
                              </Button>
                            </Link>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div className="grid gap-4 sm:grid-cols-2">
                {vehicles.length === 0 ? (
                  <div className="col-span-2 bg-white rounded-xl p-12 text-center border border-gray-100">
                    <Car className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No vehicles registered</p>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <Card key={vehicle.id} hover>
                      <CardBody className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary-500" />
                            <h4 className="font-semibold text-gray-900">{vehicle.plateNumber}</h4>
                          </div>
                          {vehicle.isApproved ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{vehicle.category?.replace(/_/g, ' ').toLowerCase()}</p>
                        {vehicle.capacity && <p className="text-sm text-gray-500">Capacity: {vehicle.capacity} tons</p>}
                        {vehicle.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{vehicle.description}</p>}
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {[...driverJobs, ...driverBids].sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ).slice(0, 10).length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  [...driverJobs, ...driverBids]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((item) => {
                      const isJob = 'pickUpLocation' in item;
                      const config = isJob ? getJobStatusBadge(item.status) : getBidStatusBadge(item.status);
                      return (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardBody className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {isJob ? (
                                  <Package className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Gavel className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                                    {config.label}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="font-medium text-gray-900">
                                  {isJob 
                                    ? (item.title || `Job #${item.id.slice(-8)}`)
                                    : `Bid on ${item.job?.title || `Job #${item.jobId.slice(-8)}`}`
                                  }
                                </p>
                                {isJob && item.price && (
                                  <p className="text-sm text-primary-600 font-semibold">KES {item.price.toLocaleString()}</p>
                                )}
                                {!isJob && (
                                  <p className="text-sm text-primary-600 font-semibold">KES {item.price.toLocaleString()}</p>
                                )}
                              </div>
                              <Link href={isJob ? `/admin/jobs/${item.id}` : `/jobs/${item.jobId}`}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Driver Application</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting {driver?.firstName} {driver?.lastName}'s application.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDriver}
                disabled={!rejectionReason.trim() || isUpdating}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}