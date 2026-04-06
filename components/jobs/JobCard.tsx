'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Job, JOB_STATUS_CONFIG } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';

import {
  MapPin,
  Clock,
  Calendar,
  Eye,
  Truck,
  Package,
  Navigation,
} from 'lucide-react';

import {
  formatCurrency,
  formatRelativeTime,
} from '@/lib/utils/formatters';

interface JobCardProps {
  job: Job;
  /** Whether bidding is allowed from the parent context */
  showBidButton?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  showBidButton = false,
}) => {
  /* ================= AUTH ================= */

  const { isAuthenticated, isAdmin, isDriver, isClient } = useAuth();
  const [showBidModal, setShowBidModal] = useState(false);

  /* ================= STATUS UI ================= */

  const statusUI = JOB_STATUS_CONFIG[job.status];

  /* ================= PERMISSIONS ================= */

  const canBid =
    showBidButton &&
    isAuthenticated &&
    isDriver &&
    job.status === 'BIDDING';

  const canTrack =
    isAuthenticated &&
    (isClient || isAdmin) &&
    job.status === 'ACTIVE';

  /* ================= ROUTING ================= */

  const detailsHref = isAdmin
    ? `/dashboard/admin/jobs/${job.id}`
    : isDriver
    ? `/dashboard/driver/jobs/${job.id}`
    : `/dashboard/client/jobs/${job.id}`;

  const trackHref = `/dashboard/client/jobs/${job.id}/track`;

  /* ================= RENDER ================= */

  return (
    <>
      <Card className="h-full transition-all duration-300 hover:shadow-lg border-l-4 border-l-maroon-600">
        <CardBody className="p-4 sm:p-5 flex flex-col h-full">
          {/* ===== Status & Time ===== */}
          <div className="flex justify-between items-center mb-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusUI.color}`}
            >
              {statusUI.label}
            </span>

            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          {/* ===== Title ===== */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base sm:text-lg">
            {job.title || 'Transport Job'}
          </h3>

          {/* ===== Locations ===== */}
          <div className="text-sm text-gray-600 mb-2 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <span className="flex-1">
              {job.pickUpLocation} → {job.dropOffLocation}
            </span>
          </div>

          {/* ===== Schedule ===== */}
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-maroon-500 flex-shrink-0" />
            <span>
              {job.scheduledDate
                ? new Date(job.scheduledDate).toLocaleDateString()
                : 'Flexible'}
            </span>
          </div>

          {/* ===== Price ===== */}
          {job.price != null && (
            <div className="mt-2 mb-4">
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(job.price)}
              </span>
            </div>
          )}

          {/* ===== Actions ===== */}
          <div className="mt-auto space-y-2">
            <Link href={detailsHref}>
              <Button variant="outline" fullWidth className="border-maroon-200 hover:border-maroon-300 hover:bg-maroon-50">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </Link>

            {canBid && (
              <Button
                fullWidth
                variant="primary"
                onClick={() => setShowBidModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Truck className="h-4 w-4 mr-1" />
                Place Bid
              </Button>
            )}

            {canTrack && (
              <Link href={trackHref}>
                <Button
                  fullWidth
                  variant="outline"
                  className="border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Track Delivery
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ===== Place Bid Modal ===== */}
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