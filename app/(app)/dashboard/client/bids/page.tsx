'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Truck,
  MapPin,
  Package
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
  jobId: string;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    rating?: number;
  };
}

interface Job {
  id: string;
  title?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  status: string;
}

interface BidWithJob extends Bid {
  job: Job;
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    ACCEPTED: { label: 'Accepted', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-700' },
  };
  const cfg = config[status] || config.SUBMITTED;
  return <span className={`text-xs px-2 py-1 rounded-full ${cfg.className}`}>{cfg.label}</span>;
};

export default function ClientBidsPage() {
  const { user } = useAuth();
  const { jobs, fetchJobs, loading: jobsLoading } = useJobs();
  
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchJobs();
      await fetchBids();
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/v1/bids', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const bidsArray = Array.isArray(data) ? data : data.data || [];
      setBids(bidsArray);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const updateBidStatus = async (bidId: string, status: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:3001/api/v1/bids/${bidId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:3001/api/v1/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  };

  // Filter bids for client's jobs
  const clientJobIds = jobs.map(j => j.id);
  const clientBids: BidWithJob[] = bids
    .filter(bid => clientJobIds.includes(bid.jobId))
    .map(bid => {
      const job = jobs.find(j => j.id === bid.jobId);
      return {
        ...bid,
        job: job as Job
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAcceptBid = async (bidId: string, jobId: string) => {
    setProcessingId(bidId);
    try {
      await updateBidStatus(bidId, 'ACCEPTED');
      await updateJobStatus(jobId, 'ACTIVE');
      toast.success('Bid accepted! Driver has been assigned.');
      await loadData();
    } catch (error) {
      console.error('Failed to accept bid:', error);
      toast.error('Failed to accept bid');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setProcessingId(bidId);
    try {
      await updateBidStatus(bidId, 'REJECTED');
      toast.success('Bid rejected');
      await loadData();
    } catch (error) {
      console.error('Failed to reject bid:', error);
      toast.error('Failed to reject bid');
    } finally {
      setProcessingId(null);
    }
  };

  if (jobsLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pendingBids = clientBids.filter(b => b.status === 'SUBMITTED' && b.job?.status === 'BIDDING');
  const acceptedBids = clientBids.filter(b => b.status === 'ACCEPTED');
  const rejectedBids = clientBids.filter(b => b.status === 'REJECTED');

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bids on My Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage bids from drivers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-500 shadow-sm">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingBids.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
            <p className="text-xs text-gray-500">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{acceptedBids.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
            <p className="text-xs text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{rejectedBids.length}</p>
          </div>
        </div>

        {/* Pending Bids */}
        {pendingBids.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Review</h2>
            <div className="space-y-4">
              {pendingBids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  isPending={true}
                  onAccept={() => handleAcceptBid(bid.id, bid.job.id)}
                  onReject={() => handleRejectBid(bid.id)}
                  isProcessing={processingId === bid.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accepted Bids */}
        {acceptedBids.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Accepted Bids</h2>
            <div className="space-y-4">
              {acceptedBids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  isPending={false}
                  onAccept={() => {}}
                  onReject={() => {}}
                  isProcessing={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Bids */}
        {rejectedBids.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rejected Bids</h2>
            <div className="space-y-4">
              {rejectedBids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  isPending={false}
                  onAccept={() => {}}
                  onReject={() => {}}
                  isProcessing={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {clientBids.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bids yet</h3>
            <p className="text-sm text-gray-500">
              When drivers bid on your jobs, they will appear here
            </p>
            <Link href="/dashboard/client/jobs">
              <Button className="mt-4 bg-maroon-600 hover:bg-maroon-700">
                View My Jobs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Bid Card Component
function BidCard({ bid, isPending, onAccept, onReject, isProcessing }: any) {
  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left - Job Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">
                {bid.job?.title || 'Transport Job'}
              </h3>
              {getStatusBadge(bid.status)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="h-3 w-3" />
              <span>{bid.job?.pickUpLocation} → {bid.job?.dropOffLocation}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-gray-400" />
                <span>{bid.driver?.firstName} {bid.driver?.lastName || 'Driver'}</span>
              </div>
              {bid.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{bid.estimatedDuration} day(s)</span>
                </div>
              )}
            </div>
            
            {bid.message && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                <MessageSquare className="h-3 w-3 inline mr-1 text-gray-400" />
                "{bid.message}"
              </div>
            )}
          </div>
          
          {/* Right - Price & Actions */}
          <div className="text-right">
            <div className="text-2xl font-bold text-maroon-600">
              {formatCurrency(bid.price)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatRelativeTime(bid.createdAt)}
            </div>
            
            {isPending && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={onAccept}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Accept
                </button>
                <button
                  onClick={onReject}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </button>
              </div>
            )}
            
            {bid.status === 'ACCEPTED' && (
              <Link href={`/dashboard/client/jobs/${bid.job?.id}/track`}>
                <Button size="sm" className="mt-3 bg-teal-600 hover:bg-teal-700">
                  <Truck className="h-3 w-3 mr-1" />
                  Track
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}