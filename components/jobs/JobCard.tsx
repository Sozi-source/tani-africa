'use client';

import Link from 'next/link';
import { Job } from '@/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, Package, Calendar, Eye, Truck } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';

interface JobCardProps {
  job: Job;
  showBidButton?: boolean;
  showActions?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, showBidButton }) => {
  const { isDriver, isAuthenticated } = useAuth();
  const [showBidModal, setShowBidModal] = useState(false);

  const statusClasses: Record<string, string> = {
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    BIDDING: 'bg-orange-100 text-orange-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const canBid =
    showBidButton &&
    isAuthenticated &&
    isDriver &&
    job.status === 'BIDDING';

  return (
    <>
      <Card className="h-full">
        <CardBody className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusClasses[job.status]}`}
            >
              {job.status}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">
            {job.title || 'Transport Job'}
          </h3>

          <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            {job.pickUpLocation} → {job.dropOffLocation}
          </div>

          <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-600" />
            {job.scheduledDate
              ? new Date(job.scheduledDate).toLocaleDateString()
              : 'Flexible'}
          </div>

          {job.price && (
            <div className="mt-2 mb-4">
              <span className="text-xl font-bold text-red-600">
                {formatCurrency(job.price)}
              </span>
            </div>
          )}

          <div className="mt-auto space-y-2">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" fullWidth>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </Link>

            {canBid && (
              <Button
                fullWidth
                variant="primary"
                onClick={() => setShowBidModal(true)}
              >
                <Truck className="h-4 w-4 mr-1" />
                Place Bid
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {showBidModal && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          jobId={job.id}
          jobTitle={job.title || 'Transport Job'}
        />
      )}
    </>
  );
};