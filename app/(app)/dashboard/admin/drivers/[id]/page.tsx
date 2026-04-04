// app/(app)/admin/drivers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin';
import { useAdminUsers } from '@/lib/hooks/useAdmin';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, User, Mail, Phone, Shield, Calendar, Truck, 
  CheckCircle, XCircle, AlertCircle, Car, FileText, 
  Clock, Award, Star, MapPin, Package, Gavel,
  DollarSign, TrendingUp, UserCheck, UserX
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;
  
  const { users, updateUserStatus } = useAdminUsers();
  const { vehicles } = useVehicles(driverId);
  const { jobs } = useJobs();
  const { bids } = useBids();
  
  const [driver, setDriver] = useState<any>(null);
  const [driverJobs, setDriverJobs] = useState<any[]>([]);
  const [driverBids, setDriverBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'bids' | 'vehicles'>('overview');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (users.length > 0) {
      const found = users.find(u => u.id === driverId);
      setDriver(found);
      
      // Filter jobs and bids for this driver
      const jobsData = Array.isArray(jobs) ? jobs : [];
      const bidsData = Array.isArray(bids) ? bids : [];
      
      setDriverJobs(jobsData.filter(j => j.driverId === driverId));
      setDriverBids(bidsData.filter(b => b.driverId === driverId));
      setLoading(false);
    }
  }, [driverId, users, jobs, bids]);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await adminAPI.approveDriver(driverId);
      toast.success('Driver approved successfully');
      router.push('/admin/drivers/pending');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      await adminAPI.rejectDriver(driverId, rejectionReason);
      toast.success('Driver rejected');
      router.push('/admin/drivers/pending');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject driver');
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm(`Are you sure you want to suspend ${driver?.firstName} ${driver?.lastName}?`)) return;
    setProcessing(true);
    try {
      await updateUserStatus(driverId, false);
      toast.success('Driver suspended');
      window.location.reload();
    } catch (err: any) {
      toast.error('Failed to suspend driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleActivate = async () => {
    setProcessing(true);
    try {
      await updateUserStatus(driverId, true);
      toast.success('Driver activated');
      window.location.reload();
    } catch (err: any) {
      toast.error('Failed to activate driver');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate stats
  const completedJobs = driverJobs.filter(j => j.status === 'COMPLETED');
  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const acceptedBids = driverBids.filter(b => b.status === 'ACCEPTED');
  const successRate = driverBids.length > 0 
    ? Math.round((acceptedBids.length / driverBids.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <p className="text-gray-500">Driver not found</p>
          <Link href="/admin/drivers/pending">
            <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">
              Back to Drivers
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Back Button */}
          <Link href="/admin/drivers/pending" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Pending Drivers
          </Link>

          {/* Driver Profile Card */}
          <Card className="mb-6">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mx-auto md:mx-0">
                  {driver.firstName?.[0]}{driver.lastName?.[0]}
                </div>
                
                {/* Driver Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h1>
                  <p className="text-gray-500">{driver.email}</p>
                  {driver.phone && <p className="text-sm text-gray-500 mt-1">{driver.phone}</p>}
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Driver
                    </span>
                    {driver.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                    {driver.approvalStatus === false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        <Clock className="h-3 w-3" />
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center md:justify-end">
                  {driver.approvalStatus === false ? (
                    <>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={processing}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processing ? 'Processing...' : 'Approve Driver'}
                      </button>
                    </>
                  ) : driver.isActive ? (
                    <button
                      onClick={handleSuspend}
                      disabled={processing}
                      className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      Suspend Driver
                    </button>
                  ) : (
                    <button
                      onClick={handleActivate}
                      disabled={processing}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Activate Driver
                    </button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-4 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'jobs', label: 'Jobs', icon: Package, count: driverJobs.length },
                { id: 'bids', label: 'Bids', icon: Gavel, count: driverBids.length },
                { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardBody className="p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-500" />
                    Personal Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name</span>
                      <span className="font-medium">{driver.firstName} {driver.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{driver.email}</span>
                    </div>
                    {driver.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">{driver.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since</span>
                      <span className="font-medium">{new Date(driver.createdAt).toLocaleDateString()}</span>
                    </div>
                    {driver.drivingLicense && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">License Number</span>
                        <span className="font-medium">{driver.drivingLicense}</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Performance Stats */}
              <Card>
                <CardBody className="p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Performance Stats
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Jobs</span>
                      <span className="font-bold text-lg">{driverJobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Completed Jobs</span>
                      <span className="font-bold text-green-600">{completedJobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Earnings</span>
                      <span className="font-bold text-orange-600">KES {totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Bids</span>
                      <span className="font-bold">{driverBids.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Accepted Bids</span>
                      <span className="font-bold text-green-600">{acceptedBids.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Success Rate</span>
                      <span className={`font-bold ${successRate >= 70 ? 'text-green-600' : successRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {successRate}%
                      </span>
                    </div>
                    {driver.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rating</span>
                        <span className="font-bold text-yellow-600 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          {driver.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Documents */}
              <Card className="md:col-span-2">
                <CardBody className="p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Documents
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">License</p>
                      <p className="text-xs text-gray-500">{driver.drivingLicense || 'Not provided'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <Car className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">Vehicle Registration</p>
                      <p className="text-xs text-gray-500">{vehicles.length} vehicle(s)</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">Background Check</p>
                      <p className="text-xs text-green-600">Verified</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {driverJobs.length === 0 ? (
                <Card>
                  <CardBody className="p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No jobs assigned to this driver</p>
                  </CardBody>
                </Card>
              ) : (
                driverJobs.map(job => (
                  <Card key={job.id} hover>
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              job.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {job.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">{job.title || 'Transport Job'}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            {job.pickUpLocation} → {job.dropOffLocation}
                          </div>
                          <p className="font-bold text-orange-600 mt-2">KES {job.price?.toLocaleString()}</p>
                        </div>
                        <Link href={`/admin/jobs/${job.id}`}>
                          <button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                            View
                          </button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Bids Tab */}
          {activeTab === 'bids' && (
            <div className="space-y-4">
              {driverBids.length === 0 ? (
                <Card>
                  <CardBody className="p-12 text-center">
                    <Gavel className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No bids placed by this driver</p>
                  </CardBody>
                </Card>
              ) : (
                driverBids.map(bid => (
                  <Card key={bid.id} hover>
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                              bid.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {bid.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900">Bid: KES {bid.price?.toLocaleString()}</h3>
                          <p className="text-sm text-gray-500">on Job #{bid.jobId.slice(-8)}</p>
                          {bid.message && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{bid.message}"</p>
                          )}
                        </div>
                        <Link href={`/jobs/${bid.jobId}`}>
                          <button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                            View Job
                          </button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardBody className="p-12 text-center">
                    <Car className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No vehicles registered</p>
                  </CardBody>
                </Card>
              ) : (
                vehicles.map(vehicle => (
                  <Card key={vehicle.id} hover>
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-orange-500" />
                          <h3 className="font-semibold text-gray-900">{vehicle.plateNumber}</h3>
                        </div>
                        {vehicle.isApproved ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{vehicle.category?.replace(/_/g, ' ').toLowerCase()}</p>
                      {vehicle.capacity && (
                        <p className="text-sm text-gray-500 mt-1">Capacity: {vehicle.capacity} tons</p>
                      )}
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Driver Application</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject <strong>{driver?.firstName} {driver?.lastName}</strong>'s application?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for rejection
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleBasedRoute>
  );
}