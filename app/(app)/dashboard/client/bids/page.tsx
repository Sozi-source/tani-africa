// app/(app)/dashboard/client/bids/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import apiClient, { extractArray } from '@/lib/api/client';
import { 
  Clock, User, MessageSquare, CheckCircle, XCircle,
  Truck, MapPin, Package, RefreshCw, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Bid {
  id: string;
  price: number;
  estimatedDuration?: number;
  message?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  driverId: string;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    rating?: number;
    photo?: string;
  };
}

interface Job {
  id: string;
  title?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  status: string;
  price?: number;
  bids?: Bid[];
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-l-4 border-l-yellow-500' },
    ACCEPTED: { label: 'Accepted', className: 'bg-green-100 text-green-700 border-l-4 border-l-green-500' },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-l-4 border-l-red-500' },
    EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700 border-l-4 border-l-gray-500' },
  };
  const cfg = config[status] || config.SUBMITTED;
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>;
};

export default function ClientBidsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    fetchJobsWithBids();
  }, []);

  const fetchJobsWithBids = async () => {
    setLoading(true);
    try {
      // ✅ Use apiClient instead of direct fetch
      const jobsResponse = await apiClient.get('/jobs');
      const jobsArray = extractArray<Job>(jobsResponse);
      
      // Fetch bids for each job using the correct endpoint
      const jobsWithBids = await Promise.all(
        jobsArray.map(async (job: Job) => {
          try {
            const bidsResponse = await apiClient.get(`/bids/job/${job.id}`);
            const bidsArray = extractArray<Bid>(bidsResponse);
            return { ...job, bids: bidsArray };
          } catch (err) {
            console.error(`Failed to fetch bids for job ${job.id}:`, err);
            return { ...job, bids: [] };
          }
        })
      );
      
      setJobs(jobsWithBids);
    } catch (error) {
      console.error('Failed to fetch jobs with bids:', error);
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string, jobId: string) => {
    setProcessingId(bidId);
    try {
      // ✅ Use apiClient with query parameter
      await apiClient.patch(`/bids/${bidId}/status?status=ACCEPTED`);
      toast.success('Bid accepted! Driver has been assigned.');
      await fetchJobsWithBids();
    } catch (error: any) {
      console.error('Failed to accept bid:', error);
      toast.error(error?.response?.data?.message || 'Failed to accept bid');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setProcessingId(bidId);
    try {
      // ✅ Use apiClient with query parameter
      await apiClient.patch(`/bids/${bidId}/status?status=REJECTED`);
      toast.success('Bid rejected');
      await fetchJobsWithBids();
    } catch (error: any) {
      console.error('Failed to reject bid:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject bid');
    } finally {
      setProcessingId(null);
    }
  };

  // Collect all bids from all jobs
  const allBids = jobs.flatMap(job => 
    (job.bids || []).map(bid => ({ ...bid, job }))
  );
  
  const pendingBids = allBids.filter(b => b.status === 'SUBMITTED' && b.job?.status === 'BIDDING');
  const acceptedBids = allBids.filter(b => b.status === 'ACCEPTED');
  const rejectedBids = allBids.filter(b => b.status === 'REJECTED');
  
  const getFilteredBids = () => {
    switch (selectedTab) {
      case 'pending': return pendingBids;
      case 'accepted': return acceptedBids;
      case 'rejected': return rejectedBids;
      default: return allBids;
    }
  };

  const totalBids = allBids.length;
  const totalSpent = acceptedBids.reduce((sum, bid) => sum + bid.price, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bids Received</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage bids from drivers on your shipments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-l-4 border-maroon-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Bids</p>
                <p className="text-2xl font-bold text-maroon-600">{totalBids}</p>
              </div>
              <div className="p-2 bg-maroon-100 rounded-lg">
                <Package className="h-5 w-5 text-maroon-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBids.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{acceptedBids.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-teal-600">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="p-2 bg-teal-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'all'
                ? 'text-maroon-600 border-b-2 border-maroon-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Bids ({allBids.length})
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'pending'
                ? 'text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({pendingBids.length})
          </button>
          <button
            onClick={() => setSelectedTab('accepted')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'accepted'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Accepted ({acceptedBids.length})
          </button>
          <button
            onClick={() => setSelectedTab('rejected')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedTab === 'rejected'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected ({rejectedBids.length})
          </button>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={fetchJobsWithBids}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Bids List */}
        {getFilteredBids().length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bids found</h3>
            <p className="text-sm text-gray-500">
              {selectedTab === 'pending' 
                ? "You don't have any pending bids to review"
                : selectedTab === 'accepted'
                ? "You haven't accepted any bids yet"
                : selectedTab === 'rejected'
                ? "You haven't rejected any bids"
                : "When drivers bid on your jobs, they will appear here"}
            </p>
            {selectedTab !== 'all' && (
              <button
                onClick={() => setSelectedTab('all')}
                className="mt-4 text-maroon-600 hover:text-maroon-700 text-sm font-medium"
              >
                View all bids
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredBids().map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isPending={bid.status === 'SUBMITTED' && bid.job?.status === 'BIDDING'}
                onAccept={() => handleAcceptBid(bid.id, bid.job.id)}
                onReject={() => handleRejectBid(bid.id)}
                isProcessing={processingId === bid.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bid Card Component
function BidCard({ bid, isPending, onAccept, onReject, isProcessing }: any) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardBody className="p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          
          {/* Left - Driver & Job Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* Driver Avatar */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-maroon-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                {bid.driver?.firstName?.[0]}{bid.driver?.lastName?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">
                    {bid.driver?.firstName} {bid.driver?.lastName}
                  </h3>
                  {getStatusBadge(bid.status)}
                </div>
                {bid.driver?.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-xs">★</span>
                    <span className="text-xs text-gray-600">{bid.driver.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Job Details */}
            <div className="ml-13 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Package className="h-3 w-3" />
                <span className="font-medium text-gray-700">
                  {bid.job?.title || 'Transport Job'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin className="h-3 w-3" />
                <span>{bid.job?.pickUpLocation} → {bid.job?.dropOffLocation}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {bid.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{bid.estimatedDuration} day(s)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{formatRelativeTime(bid.createdAt)}</span>
                </div>
              </div>
              
              {/* Message (expandable) */}
              {bid.message && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs text-maroon-600 hover:text-maroon-700 font-medium"
                  >
                    {expanded ? 'Show less' : 'Show message'}
                  </button>
                  {expanded && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <MessageSquare className="h-3 w-3 inline mr-1 text-gray-400" />
                      "{bid.message}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right - Price & Actions */}
          <div className="text-right min-w-[140px]">
            <div className="text-2xl font-bold text-maroon-600">
              {formatCurrency(bid.price)}
            </div>
            
            {isPending && (
              <div className="flex gap-2 mt-3 justify-end">
                <button
                  onClick={onReject}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Decline
                </button>
                <button
                  onClick={onAccept}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-maroon-600 text-white rounded-lg text-sm font-medium hover:bg-maroon-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Accept
                </button>
              </div>
            )}
            
            {bid.status === 'ACCEPTED' && (
              <Link href={`/dashboard/client/jobs/${bid.job?.id}/track`}>
                <Button size="sm" className="mt-3 bg-teal-600 hover:bg-teal-700 w-full">
                  <Truck className="h-3 w-3 mr-1" />
                  Track
                </Button>
              </Link>
            )}
            
            {bid.status === 'REJECTED' && (
              <div className="mt-3 text-xs text-gray-400">
                Rejected • {formatRelativeTime(bid.updatedAt || bid.createdAt)}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}