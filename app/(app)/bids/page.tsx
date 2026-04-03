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
  Package,
  ChevronRight,
  Search,
  Filter,
  User,
  Briefcase,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // For drivers: get their bids
  const myBids = bids.filter(bid => bid.driverId === user?.id);
  
  // For clients: get bids on their jobs
  const myJobs = jobs.filter(job => job.clientId === user?.id);
  const jobsWithBids = myJobs.filter(job => job.status === 'BIDDING' || job.status === 'ACTIVE');
  
  // Filter my bids
  const filteredMyBids = myBids.filter(bid => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        bid.job?.title?.toLowerCase().includes(searchLower) ||
        bid.job?.pickUpLocation?.toLowerCase().includes(searchLower) ||
        bid.job?.dropOffLocation?.toLowerCase().includes(searchLower)
      );
    }
    if (statusFilter !== 'ALL' && bid.status !== statusFilter) return false;
    return true;
  });

  // Filter jobs with bids
  const filteredJobsWithBids = jobsWithBids.filter(job => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        job.title?.toLowerCase().includes(searchLower) ||
        job.pickUpLocation?.toLowerCase().includes(searchLower) ||
        job.dropOffLocation?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      SUBMITTED: { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      PENDING: { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      ACCEPTED: { label: 'Accepted', color: 'text-green-800', bgColor: 'bg-green-50' },
      REJECTED: { label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-50' },
      EXPIRED: { label: 'Expired', color: 'text-gray-800', bgColor: 'bg-gray-50' },
    };
    const cfg = config[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-50' };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Not Authenticated</h2>
        <p className="text-sm text-gray-600">Please log in to view bids</p>
        <Link href="/auth/login">
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  const loading = bidsLoading || jobsLoading;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Client View
  if (isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Header */}
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Bids Received</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">Review and manage bids on your shipments</p>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {/* Jobs with Bids */}
          {filteredJobsWithBids.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No jobs match your search' : 'No bids received yet'}
              </p>
              {!searchTerm && (
                <Link href="/jobs/create">
                  <Button className="mt-4 text-sm">Post a Job</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredJobsWithBids.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardBody className="p-0">
                    {/* Job Header */}
                    <div className="border-b border-gray-100 bg-gray-50 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {job.title || `Job #${job.id.slice(-8)}`}
                          </h3>
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
                          </div>
                          {job.price && (
                            <div className="mt-1 text-xs font-semibold text-primary-600">
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
                            className="text-xs"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Bids
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bids List for Selected Job */}
                    {selectedJob === job.id && (
                      <div className="p-3 sm:p-4">
                        {loadingJobBids ? (
                          <div className="flex justify-center py-8">
                            <LoadingSpinner size="md" />
                          </div>
                        ) : jobBids.length === 0 ? (
                          <p className="py-6 text-center text-sm text-gray-500">No bids for this job yet</p>
                        ) : (
                          <div className="space-y-2">
                            {jobBids.map((bid) => (
                              <div key={bid.id} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5 text-gray-400" />
                                      <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                        {bid.driver?.firstName} {bid.driver?.lastName}
                                      </span>
                                      {getStatusBadge(bid.status)}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-primary-600">
                                        KES {bid.price.toLocaleString()}
                                      </p>
                                      {bid.estimatedDuration && (
                                        <p className="text-[10px] text-gray-400">{bid.estimatedDuration} hrs</p>
                                      )}
                                    </div>
                                  </div>
                                  {bid.message && (
                                    <p className="text-xs text-gray-500">"{bid.message}"</p>
                                  )}
                                  {(bid.status === 'SUBMITTED' || bid.status === 'PENDING') && (
                                    <div className="flex gap-2 pt-1">
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleAcceptBid(bid.id)}
                                        className="flex-1 text-xs"
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleRejectBid(bid.id)}
                                        className="flex-1 text-xs"
                                      >
                                        Reject
                                      </Button>
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
    const activeBids = filteredMyBids.filter(bid => ['SUBMITTED', 'PENDING'].includes(bid.status));
    const acceptedBids = filteredMyBids.filter(bid => bid.status === 'ACCEPTED');
    const rejectedBids = filteredMyBids.filter(bid => ['REJECTED', 'EXPIRED'].includes(bid.status));

    const statusOptions = [
      { value: 'ALL', label: 'All', count: filteredMyBids.length },
      { value: 'SUBMITTED', label: 'Pending', count: activeBids.length },
      { value: 'ACCEPTED', label: 'Accepted', count: acceptedBids.length },
      { value: 'REJECTED', label: 'Rejected', count: rejectedBids.length },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Header */}
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">My Bids</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">Track all the bids you've placed</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            <div className="rounded-lg bg-white p-3 text-center shadow-sm border border-gray-100">
              <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{myBids.length}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-[10px] sm:text-xs text-green-600">Accepted</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900">{acceptedBids.length}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-center">
              <p className="text-[10px] sm:text-xs text-yellow-600">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-900">{activeBids.length}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
            
            {/* Status Filter - Horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                      statusFilter === option.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {myBids.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500">
                Showing {filteredMyBids.length} of {myBids.length} bids
              </p>
            </div>
          )}

          {/* Bids List */}
          {filteredMyBids.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
              <Truck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter !== 'ALL' ? 'No bids match your filters' : 'You haven\'t placed any bids yet'}
              </p>
              {!searchTerm && statusFilter === 'ALL' && (
                <Link href="/jobs">
                  <Button className="mt-4 text-sm">Browse Jobs</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyBids.map((bid) => (
                <Link key={bid.id} href={`/jobs/${bid.jobId}`}>
                  <Card hover className="cursor-pointer transition-all hover:shadow-md">
                    <CardBody className="p-3 sm:p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {getStatusBadge(bid.status)}
                              <span className="text-[10px] text-gray-400">
                                {new Date(bid.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
                              {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                            </h3>
                            {bid.job && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin className="h-2.5 w-2.5" />
                                <span className="truncate">{bid.job.pickUpLocation} → {bid.job.dropOffLocation}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary-600">
                              KES {bid.price.toLocaleString()}
                            </p>
                            {bid.estimatedDuration && (
                              <p className="text-[10px] text-gray-400">{bid.estimatedDuration} hrs</p>
                            )}
                          </div>
                        </div>
                        {bid.message && (
                          <p className="text-[11px] text-gray-500 line-clamp-2">"{bid.message}"</p>
                        )}
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
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Header */}
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">All Bids</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">Monitor all bids across the platform</p>
          </div>

          {/* Stats */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white p-3 text-center shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Bids</p>
              <p className="text-xl font-bold text-gray-900">{bids.length}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xs text-green-600">Accepted</p>
              <p className="text-xl font-bold text-green-900">
                {bids.filter(b => b.status === 'ACCEPTED').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by driver or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {/* Bids List - Mobile Cards */}
          {bids.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No bids found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => (
                <Card key={bid.id} className="overflow-hidden">
                  <CardBody className="p-3 sm:p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-900">
                              {bid.driver?.firstName} {bid.driver?.lastName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                          </p>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(bid.status)}
                            <span className="text-[10px] text-gray-400">
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary-600">
                            KES {bid.price.toLocaleString()}
                          </p>
                          <Link href={`/jobs/${bid.jobId}`}>
                            <Button size="sm" variant="outline" className="text-xs mt-1">
                              View Job
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}