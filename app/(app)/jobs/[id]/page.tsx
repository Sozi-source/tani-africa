'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { useJobs } from '@/lib/hooks/useJobs';
import { useAuth } from '@/lib/hooks/useAuth';
import { Job } from '@/types';

import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Briefcase,
  Truck,
  AlertCircle,
} from 'lucide-react';

/* =====================================================
   Page
===================================================== */

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { getJobById } = useJobs();
  const { isDriver, isAdmin } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);

  /* =====================================================
     Fetch Job
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadJob = async () => {
      try {
        setLoading(true);
        const data = await getJobById(jobId);

        if (!cancelled) {
          if (!data) {
            setError('Job not found');
          } else {
            setJob(data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load job');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();
    return () => {
      cancelled = true;
    };
  }, [jobId, getJobById]);

  /* =====================================================
     Loading & Error states
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 px-4">
        <AlertCircle className="h-10 w-10 text-red-700" />
        <h2 className="text-xl font-semibold text-gray-900">
          Job not available
        </h2>
        <p className="text-gray-500">
          {error ?? 'This job could not be found.'}
        </p>

        <Link href="/jobs">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  /* =====================================================
     Permissions & routes
  ===================================================== */

  const canBid = isDriver && job.status === 'BIDDING';

  const dashboardHref = isAdmin
    ? `/dashboard/admin/jobs/${job.id}`
    : isDriver
    ? `/dashboard/driver/jobs/${job.id}`
    : `/dashboard/client/jobs/${job.id}`;

  /* =====================================================
     Render
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header ===== */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            {job.title ?? 'Transport Job'}
          </h1>
          <p className="text-sm text-gray-500">
            Job reference #{job.id.slice(-8)}
          </p>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== Main Section ===== */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody className="p-6 space-y-6">
              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    Pickup
                  </p>
                  <p className="font-medium">
                    {job.pickUpLocation}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" />
                    Dropoff
                  </p>
                  <p className="font-medium">
                    {job.dropOffLocation}
                  </p>
                </div>
              </div>

              {/* Description */}
              {job.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Description
                  </p>
                  <p className="text-gray-700">
                    {job.description}
                  </p>
                </div>
              )}

              {/* Schedule */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {job.scheduledDate
                  ? new Date(job.scheduledDate).toLocaleDateString()
                  : 'Flexible schedule'}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ===== Sidebar ===== */}
        <div className="space-y-4">
          {/* Budget */}
          <Card>
            <CardBody className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-1">
                Budget
              </p>
              <p className="text-3xl font-bold text-green-700">
                KES {(job.price ?? 0).toLocaleString()}
              </p>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardBody className="p-6 space-y-3">
              {canBid && (
                <Button
                  onClick={() => setShowBidModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Place Bid
                </Button>
              )}

              <Link href={dashboardHref}>
                <Button
                  variant="outline"
                  className="w-full border-orange-600 text-orange-700"
                >
                  <Briefcase className="h-4 w-4 mr-1" />
                  View in Dashboard
                </Button>
              </Link>

              {!canBid && isDriver && (
                <p className="text-xs text-gray-500 text-center">
                  Bidding is currently closed for this job
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ===== Place Bid Modal ===== */}
      {showBidModal && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          jobId={job.id}
          jobTitle={job.title ?? 'Transport Job'}
        />
      )}
    </div>
  );
}