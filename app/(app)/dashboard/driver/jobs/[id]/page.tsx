'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useDriverJobs } from '@/lib/hooks/useDriverJobs';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';
import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';
import { Job } from '@/types';

import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Navigation,
  Package,
  Clock,
  Gavel,
} from 'lucide-react';

type TabType = 'details' | 'navigation';

export default function DriverJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { availableJobs, assignedJobs, loading: jobsLoading, refetch } = useDriverJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [completing, setCompleting] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);

  /* =====================================================
     Find job from already-fetched data
  ===================================================== */

  useEffect(() => {
    if (jobsLoading) return;

    const allJobs = [...availableJobs, ...assignedJobs];
    const found = allJobs.find(j => j.id === jobId);

    if (found) {
      setJob(found);
      setError(null);
    } else {
      setError('Job not found or you do not have access to it.');
    }

    setLoading(false);
  }, [jobId, availableJobs, assignedJobs, jobsLoading]);

  /* =====================================================
     Actions
  ===================================================== */

  const handleCompleteJob = async () => {
    if (!job) return;
    if (!confirm('Are you sure this delivery is complete?')) return;

    setCompleting(true);
    try {
      await import('@/lib/api/client').then(({ default: apiClient }) =>
        apiClient.patch(`/jobs/${job.id}/status`, { status: 'COMPLETED' })
      );
      await refetch();
      router.push('/dashboard/driver');
    } catch {
      alert('Failed to mark job as completed');
    } finally {
      setCompleting(false);
    }
  };

  /* =====================================================
     States
  ===================================================== */

  if (loading || jobsLoading) return <DashboardLoader />;

  if (error || !job) {
    return (
      <DashboardError
        message={error ?? 'Job not found'}
        onRetry={() => router.push('/dashboard/driver')}
      />
    );
  }

  const isAvailable = availableJobs.some(j => j.id === job.id);
  const isAssigned  = assignedJobs.some(j => j.id === job.id);

  const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(
    job.pickUpLocation
  )}/${encodeURIComponent(job.dropOffLocation)}`;

  const jobTitle = job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`;

  /* =====================================================
     Render
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard/driver"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAvailable ? 'Available Job' : 'My Delivery'}
              </h1>
              <p className="text-sm text-gray-500">Job #{job.id.slice(-8)}</p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                job.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : job.status === 'BIDDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Status Banners */}
        {isAssigned && job.status === 'ACTIVE' && (
          <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-lg">
            <p className="font-semibold text-orange-800">Delivery in Progress</p>
            <p className="text-sm text-orange-700">
              Complete this job after successful delivery
            </p>
          </div>
        )}

        {isAvailable && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
            <p className="font-semibold text-blue-800">Open for Bidding</p>
            <p className="text-sm text-blue-700">
              Place a competitive bid to win this job
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b flex">
            {(['details', 'navigation'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-orange-600 text-orange-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'details' ? 'Job Details' : 'Navigation'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Locations */}
                <div>
                  <h3 className="font-semibold mb-3">Shipment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="font-medium">{job.pickUpLocation}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500">Dropoff</p>
                      <p className="font-medium">{job.dropOffLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Cargo */}
                {(job.cargoType || job.cargoWeight) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span>
                      {job.cargoType}
                      {job.cargoWeight ? ` • ${job.cargoWeight} kg` : ''}
                    </span>
                  </div>
                )}

                {/* Description */}
                {job.description && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{job.description}</p>
                  </div>
                )}

                {/* Bids count */}
                {job.bids && job.bids.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                    <Clock className="h-4 w-4" />
                    <span>
                      {job.bids.length} bid{job.bids.length !== 1 ? 's' : ''} placed so far
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    {isAvailable ? 'Budget' : 'Earnings'}
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    KES {(job.price ?? 0).toLocaleString()}
                  </p>
                </div>

                {/* Place Bid — available jobs in BIDDING status */}
                {isAvailable && job.status === 'BIDDING' && (
                  <button
                    onClick={() => setBidModalOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Gavel className="h-5 w-5" />
                    Place Bid
                  </button>
                )}

                {/* Complete Job — assigned active jobs */}
                {isAssigned && job.status === 'ACTIVE' && (
                  <button
                    onClick={handleCompleteJob}
                    disabled={completing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {completing ? 'Completing…' : 'Mark as Completed'}
                  </button>
                )}
              </div>
            )}

            {/* NAVIGATION TAB */}
            {activeTab === 'navigation' && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-700" />
                  <p className="text-sm font-medium">
                    {job.pickUpLocation} → {job.dropOffLocation}
                  </p>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  <Navigation className="inline-block h-4 w-4 mr-1" />
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Place Bid Modal */}
      <PlaceBidModal
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        jobId={job.id}
        jobTitle={jobTitle}
        onSuccess={() => {
          refetch();
          router.push('/dashboard/driver');
        }}
      />
    </div>
  );
}