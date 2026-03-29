'use client';

import { useParams, useRouter } from 'next/navigation';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JobCard } from '@/components/jobs/JobCard';
import { BidCard } from '@/components/bids/BidCard';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { ArrowLeft, Gavel } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { user, isClient, isDriver } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { bids, placeBid, updateBidStatus, fetchBids, loading: bidsLoading } = useBids(jobId);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const job = jobs.find(j => j.id === jobId);

  const handlePlaceBid = async (data: any) => {
    await placeBid(data);
    await fetchBids();
  };

  const handleAcceptBid = async (bidId: string) => {
    await updateBidStatus(bidId, 'ACCEPTED');
  };

  const handleRejectBid = async (bidId: string) => {
    await updateBidStatus(bidId, 'REJECTED');
  };

  if (jobsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-gray-500">Job not found</p>
        <Link href="/jobs">
          <Button variant="primary" className="mt-4">
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const isJobOwner = isClient && job.clientId === user?.id;
  const canPlaceBid = isDriver && job.status === 'BIDDING' && job.driverId !== user?.id;

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        <Link href="/jobs" className="inline-flex items-center text-primary-600 hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <JobCard job={job} showActions={false} />
          </div>

          {/* Actions */}
          <div>
            {canPlaceBid && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Place a Bid</h3>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsBidModalOpen(true)}
                  className="flex items-center justify-center gap-2"
                >
                  <Gavel className="h-4 w-4" />
                  Submit Your Bid
                </Button>
              </div>
            )}

            {/* Bids Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Bids ({bids.length})
              </h3>
              {bidsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : bids.length === 0 ? (
                <p className="text-center text-gray-500">No bids yet</p>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      showActions={isJobOwner && bid.status === 'SUBMITTED'}
                      isClient={isJobOwner}
                      onAccept={() => handleAcceptBid(bid.id)}
                      onReject={() => handleRejectBid(bid.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <PlaceBidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          onSubmit={handlePlaceBid}
          jobId={jobId}
        />
      </div>
    </ProtectedRoute>
  );
}