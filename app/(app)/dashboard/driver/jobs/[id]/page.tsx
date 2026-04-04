'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useJobs } from '@/lib/hooks/useJobs';
import { Job } from '@/types';

import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';

import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Navigation,
} from 'lucide-react';

/* =====================================================
   Types
===================================================== */

type TabType = 'details' | 'navigation';

/* =====================================================
   Page
===================================================== */

export default function DriverActiveJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { getJobById, updateJobStatus } = useJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [completing, setCompleting] = useState(false);

  /* =====================================================
     Fetch Job
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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
      } catch {
        if (!cancelled) setError('Failed to load job');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId, getJobById]);

  /* =====================================================
     Actions
  ===================================================== */

  const handleCompleteJob = async () => {
    if (!job) return;

    if (!confirm('Are you sure this delivery is complete?')) return;

    setCompleting(true);
    try {
      await updateJobStatus(job.id, 'COMPLETED');
      router.push('/dashboard/driver/jobs/history');
    } catch {
      alert('Failed to mark job as completed');
    } finally {
      setCompleting(false);
    }
  };

  /* =====================================================
     States
  ===================================================== */

  if (loading) return <DashboardLoader />;

  if (error || !job) {
    return (
      <DashboardError
        message={error ?? 'Job not found'}
        onRetry={() => router.push('/dashboard/driver')}
      />
    );
  }

  const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(
    job.pickUpLocation
  )}/${encodeURIComponent(job.dropOffLocation)}`;

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

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Active Delivery
          </h1>
          <p className="text-sm text-gray-500">
            Job #{job.id.slice(-8)}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Status Banner */}
        <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-lg mb-6">
          <p className="font-semibold text-orange-800">
            Delivery in Progress
          </p>
          <p className="text-sm text-orange-700">
            Complete this job after successful delivery
          </p>
        </div>

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

                {job.description && (
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p>{job.description}</p>
                  </div>
                )}

                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Earnings</p>
                  <p className="text-xl font-bold text-green-700">
                    KES {(job.price ?? 0).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={handleCompleteJob}
                  disabled={completing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {completing ? 'Completing…' : 'Mark as Completed'}
                </button>
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
    </div>
  );
}