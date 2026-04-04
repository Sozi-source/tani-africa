// app/(app)/dashboard/driver/jobs/history/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

import { useJobs } from '@/lib/hooks/useJobs';
import { Job } from '@/types';

import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';

import {
  CheckCircle,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

/* =====================================================
   Types
===================================================== */

type FilterPeriod = 'week' | 'month' | 'year' | 'all';

/* =====================================================
   Page
===================================================== */

export default function DriverJobHistoryPage() {
  const { jobs, loading, error, refetch } = useJobs();

  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  /* =====================================================
     Completed jobs only
  ===================================================== */

  const completedJobs = useMemo(
    () => jobs.filter(job => job.status === 'COMPLETED'),
    [jobs]
  );

  /* =====================================================
     Period filtering
  ===================================================== */

  const filteredJobs = useMemo(() => {
    if (period === 'all') return completedJobs;

    const now = new Date();

    return completedJobs.filter(job => {
      const date = new Date(job.updatedAt);

      switch (period) {
        case 'week':
          return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        case 'year':
          return date.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [completedJobs, period]);

  /* =====================================================
     Stats
  ===================================================== */

  const stats = useMemo(() => {
    const totalEarnings = filteredJobs.reduce(
      (sum, j) => sum + (j.price ?? 0),
      0
    );

    return {
      total: filteredJobs.length,
      totalEarnings,
      avgPerJob:
        filteredJobs.length > 0
          ? Math.round(totalEarnings / filteredJobs.length)
          : 0,
    };
  }, [filteredJobs]);

  /* =====================================================
     States
  ===================================================== */

  if (loading) return <DashboardLoader />;

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={refetch}
      />
    );
  }

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
            Delivery History
          </h1>
          <p className="text-sm text-gray-500">
            Your completed deliveries
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Completed Jobs</p>
            <p className="text-2xl font-bold text-green-700">
              {stats.total}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-orange-700">
              KES {stats.totalEarnings.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Avg / Job</p>
            <p className="text-2xl font-bold text-yellow-600">
              KES {stats.avgPerJob.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {(['week', 'month', 'year', 'all'] as FilterPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                period === p
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Job List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No completed jobs
            </h3>
            <p className="text-gray-500 mt-1">
              Your delivery history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => {
              const isOpen = expandedJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition"
                >
                  <button
                    onClick={() =>
                      setExpandedJobId(isOpen ? null : job.id)
                    }
                    className="w-full text-left p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.title ?? 'Delivery Job'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {job.pickUpLocation} → {job.dropOffLocation}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        Completed on{' '}
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">
                        KES {(job.price ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Earnings
                      </p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t px-4 py-3 text-sm text-gray-700 space-y-2">
                      {job.description && (
                        <div>
                          <p className="text-xs text-gray-500">
                            Description
                          </p>
                          <p>{job.description}</p>
                        </div>
                      )}

                      <Link
                        href={`/dashboard/driver/jobs/${job.id}`}
                        className="inline-block text-sm font-medium text-orange-700 hover:underline"
                      >
                        View Job Details →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}