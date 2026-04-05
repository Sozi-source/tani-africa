'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Package } from 'lucide-react';
import { Job } from '@/types';

/* ================= STATUS CONFIG ================= */
const JOB_STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  SUBMITTED: { label: 'Submitted',  badgeClass: 'bg-yellow-100 text-yellow-800' },
  BIDDING:   { label: 'Bidding',    badgeClass: 'bg-yellow-100 text-yellow-800' },
  ACTIVE:    { label: 'In Transit', badgeClass: 'bg-green-100 text-green-700'  },
  COMPLETED: { label: 'Completed',  badgeClass: 'bg-gray-100 text-gray-700'    },
  CANCELLED: { label: 'Cancelled',  badgeClass: 'bg-red-100 text-red-700'      },
};

function getStatusConfig(status: string) {
  return (
    JOB_STATUS_CONFIG[status] ?? {
      label: status || 'Unknown',
      badgeClass: 'bg-gray-100 text-gray-700',
    }
  );
}

/* ================= PROPS ================= */
interface JobCardProps {
  job: Job;
  showBidButton?: boolean;
  onPlaceBid?: (job: Job) => void;
}

/* ================= COMPONENT ================= */
export function JobCard({ job, showBidButton = false, onPlaceBid }: JobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const status = getStatusConfig(job.status);

  const handleNavigate = () => {
    // Route to role-specific job detail page
    if (user?.role === 'DRIVER') {
      router.push(`/dashboard/driver/jobs/${job.id}`);
    } else if (user?.role === 'ADMIN') {
      router.push(`/dashboard/admin/jobs/${job.id}`);
    } else {
      // CLIENT or fallback
      router.push(`/dashboard/client/jobs/${job.id}`);
    }
  };

  return (
    <Card
      hover
      className="cursor-pointer border border-gray-200"
      onClick={handleNavigate}
    >
      <CardBody className="p-4 space-y-3">
        {/* ===== TOP ROW ===== */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.badgeClass}`}
            >
              {status.label}
            </span>
            {job.bids && job.bids.length > 0 && (
              <span className="text-xs text-gray-500">
                {job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {job.price && (
            <span className="text-sm font-semibold text-red-600">
              KES {job.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* ===== TITLE ===== */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`}
        </h3>

        {/* ===== LOCATIONS ===== */}
        <div className="flex items-start gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {job.pickUpLocation} → {job.dropOffLocation}
          </span>
        </div>

        {/* ===== CARGO ===== */}
        {(job.cargoType || job.cargoWeight) && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Package className="h-3 w-3 flex-shrink-0" />
            <span>
              {job.cargoType}
              {job.cargoWeight ? ` • ${job.cargoWeight} kg` : ''}
            </span>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="pt-2 flex justify-end">
          {showBidButton && job.status === 'BIDDING' ? (
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onPlaceBid?.(job);
              }}
            >
              Place Bid
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              View Details
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}