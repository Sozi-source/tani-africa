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
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { BackNavigation } from '@/components/ui/BackNavigation';
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
  Info,
  ChevronRight
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
      
      const driverJobsData = jobs.filter(job => job.driverId === driverId);
      setDriverJobs(driverJobsData);
      
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
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      ACTIVE: { label: 'Active', color: 'text-green-800', bgColor: 'bg-green-50' },
      SUSPENDED: { label: 'Suspended', color: 'text-red-800', bgColor: 'bg-red-50' },
      PENDING: { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      APPROVED: { label: 'Approved', color: 'text-green-800', bgColor: 'bg-green-50' },
      REJECTED: { label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-50' },
    };
    const cfg = config[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-50' };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  const getJobStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      SUBMITTED: { label: 'Submitted', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      BIDDING: { label: 'Bidding', color: 'text-blue-800', bgColor: 'bg-blue-50' },
      ACTIVE: { label: 'Active', color: 'text-green-800', bgColor: 'bg-green-50' },
      COMPLETED: { label: 'Completed', color: 'text-gray-800', bgColor: 'bg-gray-50' },
      CANCELLED: { label: 'Cancelled', color: 'text-red-800', bgColor: 'bg-red-50' },
    };
    return config[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-50' };
  };

  const getBidStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      SUBMITTED: { label: 'Submitted', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      PENDING: { label: 'Pending', color: 'text-blue-800', bgColor: 'bg-blue-50' },
      ACCEPTED: { label: 'Accepted', color: 'text-green-800', bgColor: 'bg-green-50' },
      REJECTED: { label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-50' },
      EXPIRED: { label: 'Expired', color: 'text-gray-800', bgColor: 'bg-gray-50' },
    };
    return config[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-50' };
  };

  if (loading || usersLoading || jobsLoading || bidsLoading || vehiclesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Driver Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">The driver you're looking for doesn't exist.</p>
          <Link href="/admin/drivers">
            <Button className="mt-4">Back to Drivers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Back Navigation (mobile only) */}
        <BackNavigation label="Back to Drivers" href="/admin/drivers" />

        {/* Header */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {driver.firstName} {driver.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {getStatusBadge(driver.isActive ? 'ACTIVE' : 'SUSPENDED')}
                {driver.approvalStatus === false && driver.role === 'DRIVER' && (
                  <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    Pending Approval
                  </span>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined: {new Date(driver.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Action Buttons - Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {driver.approvalStatus === false && (
                <>
                  <Button
                    onClick={handleApproveDriver}
                    disabled={isUpdating}
                    variant="primary"
                    size="sm"
                    className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="mr-1 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isUpdating}
                    variant="danger"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Reject
                  </Button>
                </>
              )}
              {driver.isActive ? (
                <Button
                  onClick={handleSuspendDriver}
                  disabled={isUpdating}
                  variant="danger"
                  size="sm"
                  className="whitespace-nowrap bg-orange-600 hover:bg-orange-700"
                >
                  <Ban className="mr-1 h-3.5 w-3.5" />
                  Suspend
                </Button>
              ) : (
                <Button
                  onClick={handleActivateDriver}
                  disabled={isUpdating}
                  variant="primary"
                  size="sm"
                  className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Activate
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={isUpdating}
                className="whitespace-nowrap"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Stack on mobile */}
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
          
          {/* Left Column - Driver Info */}
          <div className="lg:w-1/3 space-y-4 sm:space-y-5">
            {/* Profile Card */}
            <Card>
              <CardBody className="p-4 sm:p-5">
                <div className="text-center mb-4 sm:mb-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg mb-3">
                    {driver.firstName?.[0]}{driver.lastName?.[0]}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 break-all">{driver.email}</p>
                  {driver.phone && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      {driver.phone}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-gray-900 capitalize">{driver.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Driver ID</span>
                    <span className="font-mono text-gray-600">{driver.id.slice(0, 8)}...</span>
                  </div>
                  {driver.drivingLicense && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">License</span>
                      <span className="font-medium text-gray-900">{driver.drivingLicense}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Member Since</span>
                    <span className="text-gray-600">{new Date(driver.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardBody className="p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  Performance Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Total Jobs</span>
                    <span className="font-semibold text-gray-900">{stats.totalJobs}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">{stats.completedJobs}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-600">{stats.cancelledJobs}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Earnings</span>
                    <span className="font-semibold text-primary-600">KES {stats.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Bids</span>
                    <span className="font-semibold text-gray-900">{stats.totalBids}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Accepted</span>
                    <span className="font-semibold text-green-600">{stats.acceptedBids}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className={`font-semibold ${stats.successRate >= 70 ? 'text-green-600' : stats.successRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {stats.successRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Rating</span>
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
                <CardBody className="p-4 sm:p-5">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Car className="h-4 w-4 text-primary-500" />
                    Vehicles ({vehicles.length})
                  </h3>
                  <div className="space-y-2">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{vehicle.plateNumber}</p>
                          <p className="text-xs text-gray-500 capitalize truncate">
                            {vehicle.category?.replace(/_/g, ' ').toLowerCase()}
                          </p>
                        </div>
                        {vehicle.isApproved ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Activity Tabs */}
          <div className="lg:w-2/3">
            {/* Tabs - Horizontal scroll on mobile */}
            <div className="border-b border-gray-200 mb-4 sm:mb-5 overflow-x-auto">
              <nav className="flex gap-1 min-w-max">
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
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                        isActive
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
              <div className="space-y-3 sm:space-y-4">
                {driverJobs.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                    <Package className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No jobs assigned to this driver</p>
                  </div>
                ) : (
                  driverJobs.map((job) => {
                    const statusConfig = getJobStatusBadge(job.status);
                    return (
                      <Card key={job.id} hover>
                        <CardBody className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
                                {job.title || `Job #${job.id.slice(-8)}`}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
                              </div>
                              {job.price && (
                                <p className="text-sm sm:text-base font-bold text-primary-600">
                                  KES {job.price.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Link href={`/admin/jobs/${job.id}`} className="self-start sm:self-center">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                View
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
              <div className="space-y-3 sm:space-y-4">
                {driverBids.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                    <Gavel className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No bids placed by this driver</p>
                  </div>
                ) : (
                  driverBids.map((bid) => {
                    const statusConfig = getBidStatusBadge(bid.status);
                    return (
                      <Card key={bid.id} hover>
                        <CardBody className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(bid.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
                                {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Bid: <span className="font-semibold text-primary-600">KES {bid.price.toLocaleString()}</span>
                              </p>
                              {bid.message && (
                                <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">"{bid.message}"</p>
                              )}
                            </div>
                            <Link href={`/jobs/${bid.jobId}`} className="self-start sm:self-center">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="mr-1 h-3.5 w-3.5" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {vehicles.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                    <Car className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No vehicles registered</p>
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <Card key={vehicle.id} hover>
                      <CardBody className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{vehicle.plateNumber}</h4>
                          </div>
                          {vehicle.isApproved ? (
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 capitalize truncate">
                          {vehicle.category?.replace(/_/g, ' ').toLowerCase()}
                        </p>
                        {vehicle.capacity && (
                          <p className="text-xs text-gray-500 mt-1">Capacity: {vehicle.capacity} tons</p>
                        )}
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {[...driverJobs, ...driverBids].sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ).slice(0, 10).length === 0 ? (
                  <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-100">
                    <Clock className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  [...driverJobs, ...driverBids]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((item) => {
                      const isJob = 'pickUpLocation' in item;
                      const statusConfig = isJob ? getJobStatusBadge(item.status) : getBidStatusBadge(item.status);
                      return (
                        <Card key={item.id} hover>
                          <CardBody className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {isJob ? (
                                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                ) : (
                                  <Gavel className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                    {statusConfig.label}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
                                  {isJob 
                                    ? (item.title || `Job #${item.id.slice(-8)}`)
                                    : `Bid on ${item.job?.title || `Job #${item.jobId.slice(-8)}`}`
                                  }
                                </p>
                                <p className="text-xs font-semibold text-primary-600">
                                  KES {item.price?.toLocaleString()}
                                </p>
                              </div>
                              <Link href={isJob ? `/admin/jobs/${item.id}` : `/jobs/${item.jobId}`}>
                                <Button size="sm" variant="ghost" className="p-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Reject Driver Application</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting {driver?.firstName} {driver?.lastName}'s application.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDriver}
                disabled={!rejectionReason.trim() || isUpdating}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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