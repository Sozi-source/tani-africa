'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

import { useJobs } from '@/lib/hooks/useJobs';
import { Job } from '@/types';

import { JobCard } from '@/app/(app)/dashboard/components/JobCard';
import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';

import {
  Grid3x3,
  List,
  Briefcase,
} from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low';

export default function DriverJobsPage() {
  const { jobs, loading, error, refetch } = useJobs();

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAll, setShowAll] = useState(false);

  /* ================= FILTER: only jobs driver can see ================= */

  const availableJobs = useMemo(
    () => jobs.filter(j => j.status === 'BIDDING'),
    [jobs]
  );

  /* ================= SORT ================= */

  const sortedJobs = useMemo(() => {
    const list = [...availableJobs];

    switch (sortBy) {
      case 'newest':
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      case 'price_high':
        return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case 'price_low':
        return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      default:
        return list;
    }
  }, [availableJobs, sortBy]);

  const visibleJobs = showAll ? sortedJobs : sortedJobs.slice(0, 6);

  /* ================= STATES ================= */

  if (loading) return <DashboardLoader />;

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/dashboard/driver"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Available Deliveries
            </h1>
            <p className="text-sm text-gray-500">
              {sortedJobs.length} job(s) open for bidding
            </p>
          </div>

          {/* View + Sort */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_high">Price: High → Low</option>
              <option value="price_low">Price: Low → High</option>
            </select>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {visibleJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No available jobs
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Check back later for new delivery opportunities
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {visibleJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                showBidButton
              />
            ))}
          </div>
        )}

        {/* ===== SHOW MORE ===== */}
        {sortedJobs.length > 6 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 rounded-lg border text-sm font-medium text-orange-700 border-orange-600 hover:bg-orange-50"
            >
              {showAll ? 'Show Less' : 'View All Jobs'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}