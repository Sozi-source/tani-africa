'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/formatters';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  Clock,
  Package,
  Truck,
  User,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface Bid {
  id: string;
  price: number;
  estimatedDuration?: number;
  message?: string;
  status: string;
  createdAt: string;
  driverId: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    rating?: number;
  };
}

export default function ClientJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.id as string;
  
  const { getJobById, updateJobStatus, loading: jobsLoading } = useJobs();
  
  const [job, setJob] = useState<any>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null);
  const [rejectingBid, setRejectingBid] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJob();
      fetchBidsForJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobData = await getJobById(jobId);
      if (!jobData) {
        setError('Job not found');
      } else {
        setJob(jobData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use the correct endpoint to fetch bids for this job
  const fetchBidsForJob = async () => {
    setBidsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/v1/bids/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const bidsArray = Array.isArray(data) ? data : data.data || [];
      setBids(bidsArray);
    } catch (err: any) {
      console.error('Failed to fetch bids:', err);
    } finally {
      setBidsLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingBid(bidId);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Accept the bid using query parameter
      const acceptRes = await fetch(`http://localhost:3001/api/v1/bids/${bidId}/status?status=ACCEPTED`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!acceptRes.ok) {
        const error = await acceptRes.json();
        throw new Error(error.message || 'Failed to accept bid');
      }
      
      toast.success('Bid accepted! Driver has been assigned.');
      await loadJob();
      await fetchBidsForJob();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept bid');
    } finally {
      setAcceptingBid(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setRejectingBid(bidId);
    try {
      const token = localStorage.getItem('accessToken');
      
      const rejectRes = await fetch(`http://localhost:3001/api/v1/bids/${bidId}/status?status=REJECTED`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!rejectRes.ok) {
        const error = await rejectRes.json();
        throw new Error(error.message || 'Failed to reject bid');
      }
      
      toast.success('Bid rejected');
      await fetchBidsForJob();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject bid');
    } finally {
      setRejectingBid(null);
    }
  };

  const handleCancelJob = async () => {
    if (confirm('Are you sure you want to cancel this job?')) {
      try {
        await updateJobStatus(jobId, 'CANCELLED');
        toast.success('Job cancelled');
        await loadJob();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to cancel job');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'The job you are looking for does not exist.'}</p>
        <Button onClick={() => router.push('/dashboard/client/jobs')}>
          Back to My Jobs
        </Button>
      </div>
    );
  }

  const statusColors = {
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    BIDDING: 'bg-teal-100 text-teal-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  // Count bids by status
  const pendingBids = bids.filter(b => b.status === 'SUBMITTED');
  const acceptedBids = bids.filter(b => b.status === 'ACCEPTED');
  const rejectedBids = bids.filter(b => b.status === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {job.title || 'Job Details'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {(job.status === 'SUBMITTED' || job.status === 'BIDDING') && (
            <Button variant="danger" onClick={handleCancelJob}>
              Cancel Job
            </Button>
          )}
          {job.status === 'ACTIVE' && (
            <Button
              variant="success"
              onClick={() => router.push(`/dashboard/client/jobs/${jobId}/track`)}
            >
              Track Delivery
            </Button>
          )}
          <button
            onClick={fetchBidsForJob}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
            disabled={bidsLoading}
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${bidsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className={`rounded-lg p-4 ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                job.status === 'ACTIVE' ? 'bg-green-600 animate-pulse' : 'bg-current'
              }`} />
              <span className="font-semibold">Status: {job.status}</span>
              {bids.length > 0 && (
                <span className="ml-2 text-xs bg-white/50 px-2 py-0.5 rounded-full">
                  {bids.length} bid{bids.length !== 1 ? 's' : ''} received
                </span>
              )}
            </div>
          </div>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-maroon-700">Shipment Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-maroon-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-medium text-gray-900">{job.pickUpLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Dropoff Location</p>
                    <p className="font-medium text-gray-900">{job.dropOffLocation}</p>
                  </div>
                </div>
              </div>

              {job.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{job.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {job.cargoWeight && (
                  <div className="bg-teal-50 p-2 rounded-lg">
                    <p className="text-xs text-teal-600">Weight</p>
                    <p className="font-semibold text-gray-900">{job.cargoWeight} kg</p>
                  </div>
                )}
                {job.price && (
                  <div className="bg-maroon-50 p-2 rounded-lg">
                    <p className="text-xs text-maroon-600">Budget</p>
                    <p className="font-semibold text-maroon-700">{formatCurrency(job.price)}</p>
                  </div>
                )}
                {job.scheduledDate && (
                  <div className="bg-yellow-50 p-2 rounded-lg">
                    <p className="text-xs text-yellow-600">Scheduled</p>
                    <p className="font-semibold text-gray-900">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-semibold text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Driver Info (if assigned) */}
          {job.driver && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-teal-600" />
                  Assigned Driver
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-maroon-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                    {job.driver.firstName?.[0]}{job.driver.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{job.driver.firstName} {job.driver.lastName}</p>
                    {job.driver.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {job.driver.phone}
                      </p>
                    )}
                    {job.driver.email && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {job.driver.email}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/client/jobs/${jobId}/track`)}
                  >
                    Track
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar - Bids Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                Bids ({bids.length})
              </h2>
              {pendingBids.length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {pendingBids.length} pending
                </span>
              )}
            </CardHeader>
            <CardBody>
              {bidsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : bids.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No bids yet</p>
                  <p className="text-xs text-gray-400 mt-1">Drivers will bid on your job soon</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids
                    .sort((a, b) => a.price - b.price)
                    .map((bid) => (
                      <div
                        key={bid.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {bid.driver?.firstName} {bid.driver?.lastName}
                            </p>
                            <p className="text-2xl font-bold text-maroon-600">
                              {formatCurrency(bid.price)}
                            </p>
                            {bid.estimatedDuration && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {bid.estimatedDuration} days
                              </p>
                            )}
                          </div>
                          {(job.status === 'SUBMITTED' || job.status === 'BIDDING') && bid.status === 'SUBMITTED' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptBid(bid.id)}
                                disabled={acceptingBid === bid.id}
                                className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Accept bid"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectBid(bid.id)}
                                disabled={rejectingBid === bid.id}
                                className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Reject bid"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {bid.status === 'ACCEPTED' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Accepted
                            </span>
                          )}
                          {bid.status === 'REJECTED' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Rejected
                            </span>
                          )}
                        </div>
                        {bid.message && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                            "{bid.message}"
                          </p>
                        )}
                        {bid.driver?.rating && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            Rating: {bid.driver.rating.toFixed(1)}/5
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}