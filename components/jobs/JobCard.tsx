'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Job } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { MapPin, Clock, Package, Eye, Truck } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: Job;
  showActions?: boolean;
  showBidButton?: boolean;
  onBidSuccess?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  showActions = true,
  showBidButton = false,
  onBidSuccess 
}) => {
  const { user, isDriver, isAuthenticated } = useAuth();
  const [showBidModal, setShowBidModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      BIDDING: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      SUBMITTED: 'Submitted',
      BIDDING: 'Bidding Open',
      ACTIVE: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return texts[status] || status;
  };

  const canPlaceBid = showBidButton && isDriver && job.status === 'BIDDING' && isAuthenticated;

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      return;
    }
    setShowBidModal(true);
  };

  const handleBidSuccess = () => {
    if (onBidSuccess) {
      onBidSuccess();
    }
  };

  return (
    <>
      <Card hover className="h-full">
        <CardBody className="flex h-full flex-col">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
              {getStatusText(job.status)}
            </span>
            <span className="text-xs text-gray-500">{formatRelativeTime(job.createdAt)}</span>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {job.title || `Transport from ${job.pickUpLocation}`}
          </h3>

          {/* Details */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500" />
              <span className="truncate">
                {job.pickUpLocation} → {job.dropOffLocation}
              </span>
            </div>
            {job.cargoType && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500" />
                <span>{job.cargoType}{job.cargoWeight ? ` • ${job.cargoWeight} kg` : ''}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500" />
              <span>Scheduled: {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Flexible'}</span>
            </div>
          </div>

          {/* Price */}
          {job.price && (
            <div className="mb-4">
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(job.price)}
              </span>
              <span className="text-sm text-gray-500"> fixed price</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto space-y-2 pt-4">
            {showActions && (
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </Link>
            )}
            
            {canPlaceBid && (
              <Button 
                onClick={handlePlaceBid}
                variant="primary" 
                fullWidth 
                className="flex items-center justify-center gap-2"
              >
                <Truck className="h-4 w-4" />
                Place Bid
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Place Bid Modal */}
      {showBidModal && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          jobId={job.id}
          jobTitle={job.title || `Transport from ${job.pickUpLocation}`}
          onSuccess={handleBidSuccess}
        />
      )}
    </>
  );
};