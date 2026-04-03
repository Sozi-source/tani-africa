'use client';

import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Package } from 'lucide-react';
import { Job } from '@/types';
import { useRouter } from 'next/navigation';

const JOB_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
  BIDDING: { label: 'Bidding', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: '🚚' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: '✅' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

function getStatusConfig(status: string) {
  return JOB_STATUS_CONFIG[status] || {
    label: status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: '📦'
  };
}

interface JobCardProps {
  job: Job;
  showBidButton?: boolean;
  onPlaceBid?: (job: Job) => void;
}

export function JobCard({ job, showBidButton = false, onPlaceBid }: JobCardProps) {
  const config = getStatusConfig(job.status);
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/jobs/${job.id}`);
  };
  
  return (
    <Card hover className="cursor-pointer transition-all hover:shadow-md" onClick={handleClick}>
      <CardBody className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-2.5">
          {/* Top row with status and price */}
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-medium ${config.color}`}>
                <span>{config.icon}</span>
                <span className="hidden xs:inline">{config.label}</span>
              </span>
              {job.bids && job.bids.length > 0 && (
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {job.price && (
              <span className="text-xs sm:text-sm font-bold text-amber-600 whitespace-nowrap">
                KES {job.price.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Job details */}
          <div>
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
              {job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`}
            </h3>
            <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mt-1">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
            </div>
            {job.cargoType && (
              <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
                <Package className="h-2.5 w-2.5 mr-1" />
                <span>{job.cargoType}{job.cargoWeight ? ` • ${job.cargoWeight} kg` : ''}</span>
              </div>
            )}
          </div>
          
          {/* Action button */}
          <div className="flex justify-end pt-1">
            {showBidButton && job.status === 'BIDDING' ? (
              <Button
                size="sm"
                variant="primary"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onPlaceBid?.(job); 
                }}
                className="w-full sm:w-auto text-xs sm:text-sm py-1.5 px-3"
              >
                Place Bid
              </Button>
            ) : !showBidButton && (
              <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm py-1.5 px-3">
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}