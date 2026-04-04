'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBids } from '@/lib/hooks/useBids';
import { useJobs } from '@/lib/hooks/useJobs';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Search,
  MapPin,
  Clock,
  Eye,
  User,
  Package,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ================= STATUS STYLES (NAIVAS) ================= */

const STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  SUBMITTED: { label: 'Pending', className: 'bg-yellow-50 text-yellow-800' },
  PENDING:   { label: 'Pending', className: 'bg-yellow-50 text-yellow-800' },
  ACCEPTED:  { label: 'Accepted', className: 'bg-green-50 text-green-800' },
  REJECTED:  { label: 'Rejected', className: 'bg-orange-50 text-orange-800' },
  EXPIRED:   { label: 'Expired',  className: 'bg-gray-100 text-gray-700' },
};

/* ================= COMPONENT ================= */

export default function BidsPage() {
  const { user, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const {
    bids,
    loading: bidsLoading,
    getBidsByJob,
    updateBidStatus,
    refetch,
  } = useBids();
  const { jobs, loading: jobsLoading } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobBids, setJobBids] = useState<any[]>([]);
  const [loadingJobBids, setLoadingJobBids] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  /* ================= AUTH GUARD ================= */

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">
          Authentication Required
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Please log in to view bids.
        </p>
        <Link href="/auth/login">
          <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
            Login
          </Button>
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

  /* =====================================================================
     CLIENT VIEW — Bids Received
     ===================================================================== */

  if (isClient) {
    const myJobs = jobs.filter(j => j.clientId === user?.id);
    const jobsWithBids = myJobs.filter(j =>
      ['BIDDING', 'ACTIVE'].includes(j.status)
    );

    const filteredJobs = jobsWithBids.filter(job =>
      searchTerm
        ? job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.pickUpLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.dropOffLocation?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

    const viewJobBids = async (jobId: string) => {
      setSelectedJob(jobId);
      setLoadingJobBids(true);
      try {
        const data = await getBidsByJob(jobId);
        setJobBids(data as any[]);
      } catch {
        toast.error('Failed to load bids');
      } finally {
        setLoadingJobBids(false);
      }
    };

    const acceptBid = async (bidId: string) => {
      try {
        await updateBidStatus(bidId, 'ACCEPTED');
        toast.success('Bid accepted');
        await refetch();
        if (selectedJob) viewJobBids(selectedJob);
      } catch {
        toast.error('Failed to accept bid');
      }
    };

    const rejectBid = async (bidId: string) => {
      try {
        await updateBidStatus(bidId, 'REJECTED');
        toast.success('Bid rejected');
        await refetch();
        if (selectedJob) viewJobBids(selectedJob);
      } catch {
        toast.error('Failed to reject bid');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bids Received</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage bids on your shipments
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job or location…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="
              w-full rounded-lg border border-gray-300 bg-white
              py-2.5 pl-9 pr-3 text-sm
              focus:border-orange-600 focus:ring-2 focus:ring-orange-200
            "
          />
        </div>

        {/* Jobs */}
        {filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No jobs match your search' : 'No bids received yet'}
            </p>
            {!searchTerm && (
              <Link href="/jobs/create">
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                  Post a Job
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id}>
                <CardBody className="p-4 space-y-3">

                  <div className="flex justify-between items-start gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.title || `Job #${job.id.slice(-6)}`}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {job.pickUpLocation} → {job.dropOffLocation}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewJobBids(job.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Bids
                    </Button>
                  </div>

                  {selectedJob === job.id && (
                    <div className="pt-3 border-t border-gray-100">
                      {loadingJobBids ? (
                        <div className="py-6 flex justify-center">
                          <LoadingSpinner size="md" />
                        </div>
                      ) : jobBids.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No bids yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {jobBids.map(bid => {
                            const status =
                              STATUS_STYLES[bid.status] ?? STATUS_STYLES.EXPIRED;

                            return (
                              <div
                                key={bid.id}
                                className="rounded-lg border border-gray-200 bg-white p-3"
                              >
                                <div className="flex justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="h-3.5 w-3.5 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {bid.driver?.firstName} {bid.driver?.lastName}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                                      >
                                        {status.label}
                                      </span>
                                    </div>
                                    {bid.message && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        “{bid.message}”
                                      </p>
                                    )}
                                  </div>

                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-black">
                                      KES {bid.price.toLocaleString()}
                                    </p>
                                    {bid.estimatedDuration && (
                                      <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {bid.estimatedDuration} hrs
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {['SUBMITTED', 'PENDING'].includes(bid.status) && (
                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => acceptBid(bid.id)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => rejectBid(bid.id)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
    );
  }

  /* =====================================================================
     DRIVER + ADMIN VIEWS
     ===================================================================== */

  if (isDriver || isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isDriver ? 'My Bids' : 'All Bids'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isDriver
              ? 'Track all the bids you’ve placed'
              : 'Monitor bids across the platform'}
          </p>
        </div>

        {bids.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No bids found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map(bid => {
              const status =
                STATUS_STYLES[bid.status] ?? STATUS_STYLES.EXPIRED;

              return (
                <Card key={bid.id}>
                  <CardBody className="p-4 space-y-2">
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {bid.driver?.firstName} {bid.driver?.lastName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {bid.job?.title || `Job #${bid.jobId.slice(-6)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-black">
                          KES {bid.price.toLocaleString()}
                        </p>
                        <Link href={`/jobs/${bid.jobId}`}>
                          <Button size="sm" variant="outline" className="mt-2">
                            View Job
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}