'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Package } from 'lucide-react';
import { Job } from '@/types';

const JOB_STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  SUBMITTED: { label: 'Submitted',  badgeClass: 'bg-yellow-100 text-yellow-800 border-l-yellow-500' },
  BIDDING:   { label: 'Bidding',    badgeClass: 'bg-teal-100 text-teal-800 border-l-teal-500' },
  ACTIVE:    { label: 'In Transit', badgeClass: 'bg-green-100 text-green-700 border-l-green-500' },
  COMPLETED: { label: 'Completed',  badgeClass: 'bg-gray-100 text-gray-700 border-l-gray-500' },
  CANCELLED: { label: 'Cancelled',  badgeClass: 'bg-red-100 text-red-700 border-l-red-500' },
};

function getStatusConfig(status: string) {
  return JOB_STATUS_CONFIG[status] ?? {
    label: status || 'Unknown',
    badgeClass: 'bg-gray-100 text-gray-700 border-l-gray-500',
  };
}

interface JobCardProps {
  job: Job;
  showBidButton?: boolean;
  onPlaceBid?: (job: Job) => void;
}

export function JobCard({ job, showBidButton = false, onPlaceBid }: JobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const status = getStatusConfig(job.status);

  const handleNavigate = () => {
    if (user?.role === 'DRIVER') {
      router.push(`/dashboard/driver/jobs/${job.id}`);
    } else if (user?.role === 'ADMIN') {
      router.push(`/dashboard/admin/jobs/${job.id}`);
    } else {
      router.push(`/dashboard/client/jobs/${job.id}`);
    }
  };

  return (
    <Card
      hover
      variant={job.status === 'BIDDING' ? 'teal' : job.status === 'ACTIVE' ? 'success' : job.status === 'COMPLETED' ? 'default' : 'default'}
      className="cursor-pointer transition-all duration-300"
      onClick={handleNavigate}
    >
      <CardBody className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-l-4 ${status.badgeClass}`}
            >
              {status.label}
            </span>
            {job.bids && job.bids.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {job.price && (
            <span className="text-sm font-bold text-maroon-600">
              KES {job.price.toLocaleString()}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`}
        </h3>

        <div className="flex items-start gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-teal-500" />
          <span className="line-clamp-1">
            {job.pickUpLocation} → {job.dropOffLocation}
          </span>
        </div>

        {(job.cargoType || job.cargoWeight) && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Package className="h-3 w-3 flex-shrink-0" />
            <span>
              {job.cargoType}
              {job.cargoWeight ? ` • ${job.cargoWeight} kg` : ''}
            </span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          {showBidButton && job.status === 'BIDDING' ? (
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onPlaceBid?.(job);
              }}
            >
              Place Bid
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="border-maroon-200 text-maroon-600 hover:bg-maroon-50">
              View Details
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}