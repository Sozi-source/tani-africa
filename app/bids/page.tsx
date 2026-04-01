'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBids } from '@/lib/hooks/useBids';
import { useJobs } from '@/lib/hooks/useJobs';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  Package,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BidWithDetails {
  id: string;
  price: number;
  estimatedDuration?: number;
  message?: string;
  status: string;
  jobId: string;
  driverId: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  job?: {
    id: string;
    title?: string;
    pickUpLocation: string;
    dropOffLocation: string;
    price?: number;
    status: string;
    client?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function BidsPage() {
  const { user, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const { bids, loading: bidsLoading, getBidsByJob, getBidsByDriver, updateBidStatus, refetch } = useBids();
  const { jobs, loading: jobsLoading } = useJobs();
  const [activeTab, setActiveTab] = useState<'myBids' | 'receivedBids'>('myBids');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobBids, setJobBids] = useState<BidWithDetails[]>([]);
  const [loadingJobBids, setLoadingJobBids] = useState(false);

  // For drivers: get their bids
  const myBids = bids.filter(bid => bid.driverId === user?.id);
  
  // For clients: get bids on their jobs
  const myJobs = jobs.filter(job => job.clientId === user?.id);
  const jobsWithBids = myJobs.filter(job => job.status === 'BIDDING' || job.status === 'ACTIVE');
  
  // For admin: view all bids
  const allBids = bids;

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleViewJobBids = async (jobId: string) => {
    setSelectedJob(jobId);
    setLoadingJobBids(true);
    try {
      const bidsData = await getBidsByJob(jobId);
      setJobBids(bidsData as BidWithDetails[]);
    } catch (error) {
      toast.error('Failed to load bids');
    } finally {
      setLoadingJobBids(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      await updateBidStatus(bidId, 'ACCEPTED');
      toast.success('Bid accepted!');
      await refetch();
      if (selectedJob) {
        await handleViewJobBids(selectedJob);
      }
    } catch (error) {
      toast.error('Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await updateBidStatus(bidId, 'REJECTED');
      toast.success('Bid rejected');
      await refetch();
      if (selectedJob) {
        await handleViewJobBids(selectedJob);
      }
    } catch (error) {
      toast.error('Failed to reject bid');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      PENDING: { label: 'Pending', color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-3 w-3" /> },
      ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
      EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> },
    };
    const cfg = config[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${cfg.color}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Not Authenticated</h2>
        <p className="text-gray-600">Please log in to view bids</p>
        <Link href="/auth/login">
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  const loading = bidsLoading || jobsLoading;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Client View
  if (isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bids Received</h1>
            <p className="mt-2 text-gray-600">Review and manage bids on your shipments</p>
          </div>

          {/* Jobs with Bids */}
          {jobsWithBids.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">No bids received yet</p>
                <p className="mt-1 text-sm text-gray-400">
                  When drivers bid on your jobs, they'll appear here
                </p>
                <Link href="/jobs/create">
                  <Button className="mt-4">Post a Job</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobsWithBids.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardBody className="p-0">
                    {/* Job Header */}
                    <div className="border-b border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title || `Job #${job.id.slice(-8)}`}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{job.pickUpLocation} → {job.dropOffLocation}</span>
                          </div>
                          {job.price && (
                            <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary-600">
                              <DollarSign className="h-4 w-4" />
                              KES {job.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewJobBids(job.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View Bids
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bids List for Selected Job */}
                    {selectedJob === job.id && (
                      <div className="p-4">
                        {loadingJobBids ? (
                          <div className="flex justify-center py-8">
                            <LoadingSpinner size="md" />
                          </div>
                        ) : jobBids.length === 0 ? (
                          <p className="py-8 text-center text-gray-500">No bids for this job yet</p>
                        ) : (
                          <div className="space-y-3">
                            {jobBids.map((bid) => (
                              <div key={bid.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-400" />
                                      <span className="font-medium text-gray-900">
                                        {bid.driver?.firstName} {bid.driver?.lastName}
                                      </span>
                                      {getStatusBadge(bid.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        KES {bid.price.toLocaleString()}
                                      </div>
                                      {bid.estimatedDuration && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {bid.estimatedDuration} hours
                                        </div>
                                      )}
                                    </div>
                                    {bid.message && (
                                      <p className="mt-2 text-sm text-gray-600">"{bid.message}"</p>
                                    )}
                                  </div>
                                  {bid.status === 'SUBMITTED' || bid.status === 'PENDING' ? (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleAcceptBid(bid.id)}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleRejectBid(bid.id)}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      {bid.status === 'ACCEPTED' ? '✓ Accepted' : '✗ Rejected'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Driver View
  if (isDriver) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
            <p className="mt-2 text-gray-600">Track all the bids you've placed</p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{myBids.length}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-600">Accepted</p>
              <p className="text-2xl font-bold text-green-900">
                {myBids.filter(b => b.status === 'ACCEPTED').length}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {myBids.filter(b => b.status === 'SUBMITTED' || b.status === 'PENDING').length}
              </p>
            </div>
          </div>

          {/* Bids List */}
          {myBids.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <Truck className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">You haven't placed any bids yet</p>
                <p className="mt-1 text-sm text-gray-400">Browse available jobs and start bidding</p>
                <Link href="/jobs">
                  <Button className="mt-4">Browse Jobs</Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-3">
              {myBids.map((bid) => (
                <Link key={bid.id} href={`/jobs/${bid.jobId}`}>
                  <Card hover className="cursor-pointer transition-all hover:shadow-md">
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {getStatusBadge(bid.status)}
                            <span className="text-xs text-gray-500">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="mb-2 font-semibold text-gray-900">
                            {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                          </h3>
                          {bid.job && (
                            <div className="mb-2 flex items-center text-sm text-gray-600">
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>{bid.job.pickUpLocation} → {bid.job.dropOffLocation}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 font-semibold text-primary-600">
                              <DollarSign className="h-4 w-4" />
                              KES {bid.price.toLocaleString()}
                            </span>
                            {bid.estimatedDuration && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="h-4 w-4" />
                                {bid.estimatedDuration} hours
                              </span>
                            )}
                          </div>
                          {bid.message && (
                            <p className="mt-2 text-sm text-gray-500">"{bid.message}"</p>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin View
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">All Bids</h1>
            <p className="mt-2 text-gray-600">Monitor all bids across the platform</p>
            <p className="text-sm text-gray-400 mt-1">Total: {allBids.length} bids</p>
          </div>

          {/* Bids Table */}
          {allBids.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">No bids found</p>
              </CardBody>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allBids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{bid.id.slice(-8)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {bid.driver?.firstName} {bid.driver?.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                          {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary-600">
                          KES {bid.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(bid.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/jobs/${bid.jobId}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              View Job
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}