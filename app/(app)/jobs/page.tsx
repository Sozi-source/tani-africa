'use client';

export const dynamic = 'force-dynamic';

import { useMemo, useState } from 'react';

import { useJobs } from '@/lib/hooks/useJobs';
import { useAuth } from '@/lib/hooks/useAuth';

import { Job } from '@/types';

import { JobCard } from '@/app/(app)/dashboard/components/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

import {
  Briefcase,
  Grid3x3,
  List,
} from 'lucide-react';

/* =====================================================
   Page
===================================================== */

export default function JobsPage() {
  const { jobs, loading, error, refetch } = useJobs();
  const { isDriver } = useAuth();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAll, setShowAll] = useState(false);

  /* =====================================================
     Visible jobs (safe for sharing)
  ===================================================== */

  const visibleJobs = useMemo(() => {
    // Public rule:
    // Drivers should only see BIDDING jobs
    // Clients/Admins can safely see their own via dashboard
    if (isDriver) {
      return jobs.filter(job => job.status === 'BIDDING');
    }
    return jobs;
  }, [jobs, isDriver]);

  const displayedJobs = showAll
    ? visibleJobs
    : visibleJobs.slice(0, 9);

  /* =====================================================
     States
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-700 font-medium">
          Failed to load jobs
        </p>
        <Button onClick={refetch} className="bg-orange-600 hover:bg-orange-700">
          Try Again
        </Button>
      </div>
    );
  }

  /* =====================================================
     Render
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header ===== */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Available Jobs
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse transport jobs open for bidding
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
              aria-label="Grid view"
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
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Jobs Grid/List ===== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {visibleJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No jobs available
            </h3>
            <p className="text-gray-500 mt-1">
              Please check back later for new opportunities
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
            {displayedJobs.map((job: Job) => (
              <JobCard
                key={job.id}
                job={job}
                showBidButton={isDriver}
              />
            ))}
          </div>
        )}

        {/* ===== Show More ===== */}
        {visibleJobs.length > 9 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 rounded-lg border border-orange-600 text-orange-700 hover:bg-orange-50 font-medium"
            >
              {showAll ? 'Show Less' : 'View More Jobs'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}