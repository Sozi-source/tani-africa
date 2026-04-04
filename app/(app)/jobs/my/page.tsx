'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';

import { JobCard } from '@/components/jobs/JobCard';
import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';

import { Plus, Search, Package } from 'lucide-react';
import type { Job } from '@/types';

export default function MyJobsPage() {
  const { user } = useAuth();
  const { jobs, loading, error, refetch } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');

  /* ================= NORMALIZE JOBS SAFELY ================= */

  const jobsArray: Job[] = useMemo(() => {
    if (Array.isArray(jobs)) return jobs as Job[];

    if (jobs && typeof jobs === 'object') {
      const anyJobs = jobs as unknown as {
        data?: Job[];
        jobs?: Job[];
        items?: Job[];
      };

      if (Array.isArray(anyJobs.data)) return anyJobs.data;
      if (Array.isArray(anyJobs.jobs)) return anyJobs.jobs;
      if (Array.isArray(anyJobs.items)) return anyJobs.items;
    }

    return [];
  }, [jobs]);

  /* ================= FILTER ================= */

  const myJobs: Job[] = useMemo(() => {
    if (!user?.id) return [];
    return jobsArray.filter((job: Job) => job.clientId === user.id);
  }, [jobsArray, user?.id]);

  const filteredJobs: Job[] = useMemo(() => {
    if (!searchTerm) return myJobs;

    const q = searchTerm.toLowerCase();
    return myJobs.filter((job: Job) =>
      job.title?.toLowerCase().includes(q) ||
      job.pickUpLocation?.toLowerCase().includes(q) ||
      job.dropOffLocation?.toLowerCase().includes(q)
    );
  }, [myJobs, searchTerm]);

  /* ================= EFFECT ================= */

  useEffect(() => {
    refetch();
  }, [refetch]);

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

  /* ================= RENDER ================= */

  return (
    <RoleBasedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                My Jobs
              </h1>
              <p className="text-sm text-gray-600">
                {myJobs.length} job{myJobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Link href="/jobs/create">
              <button className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                <Plus className="h-4 w-4" />
                Post Job
              </button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search jobs…"
              className="
                w-full rounded-lg border border-gray-300 bg-white
                py-2.5 pl-9 pr-3 text-sm
                focus:border-orange-600 focus:ring-2 focus:ring-orange-200
              "
            />
          </div>

          {/* Content */}
          {filteredJobs.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                No jobs found
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Post your first job to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job: Job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

        </div>
      </div>
    </RoleBasedRoute>
  );
}