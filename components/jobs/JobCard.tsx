// components/jobs/JobCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Job } from '@/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { MapPin, Clock, Package, Eye, Truck, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: Job;
  showActions?: boolean;
  showBidButton?: boolean;
  showBranding?: boolean;
  showPostButton?: boolean;
  onBidSuccess?: () => void;
  onPostJob?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  showActions = true,
  showBidButton = false,
  showBranding = false,
  showPostButton = false,
  onBidSuccess,
  onPostJob
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      SUBMITTED: '📝',
      BIDDING: '💰',
      ACTIVE: '🚚',
      COMPLETED: '✅',
      CANCELLED: '❌',
    };
    return icons[status] || '📦';
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

  // Format scheduled date - using scheduledDate field
  const formatScheduledDate = (dateString?: string) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleDateString('en-KE', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card hover className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* TA Branding Header - Optional */}
        {showBranding && (
          <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">TA</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Tani Africa</p>
                  <p className="text-xs text-gray-500">Available Jobs</p>
                </div>
              </div>
              {showPostButton && onPostJob && (
                <button 
                  onClick={onPostJob}
                  className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
                >
                  Post Job
                </button>
              )}
            </div>
          </div>
        )}

        <CardBody className="flex h-full flex-col p-4">
          {/* Header - Status and Time */}
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
                <span>{getStatusIcon(job.status)}</span>
                <span>{getStatusText(job.status)}</span>
              </span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
            {job.title || `Transport from ${job.pickUpLocation}`}
          </h3>

          {/* Route with arrows */}
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-green-600" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{job.pickUpLocation}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-red-600" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{job.dropOffLocation}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mb-4 space-y-2">
            {/* Scheduled Date - using scheduledDate field */}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500" />
              <span>Scheduled: {formatScheduledDate(job.scheduledDate)}</span>
            </div>
            
            {/* Cargo Info */}
            {job.cargoType && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500" />
                <span>
                  {job.cargoType}
                  {job.cargoWeight && ` • ${job.cargoWeight} kg`}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          {job.price && (
            <div className="mb-4">
              <span className="text-xs text-gray-500">Budget</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                  {formatCurrency(job.price)}
                </span>
                <span className="text-sm text-gray-500"> fixed price</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto space-y-2 pt-4">
            {showActions && (
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" fullWidth className="flex items-center justify-center gap-2 text-sm">
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
                className="flex items-center justify-center gap-2 text-sm"
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