'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';

import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/Button';

import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';

import {
  Search,
  SlidersHorizontal,
  X,
  Package,
  Briefcase,
  Clock,
} from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { jobs = [], loading: jobsLoading, error, refetch } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  /* ================= FILTERING ================= */

  const filteredJobs = useMemo(() => {
    let list = Array.isArray(jobs) ? [...jobs] : [];

    // Drivers only see bidding jobs
    if (user?.role === 'DRIVER') {
      list = list.filter(j => j.status === 'BIDDING');
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.pickUpLocation?.toLowerCase().includes(q) ||
        j.dropOffLocation?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(j => j.status === statusFilter);
    }

    return list;
  }, [jobs, searchTerm, statusFilter, user?.role]);

  /* ================= LOADING & ERROR ================= */

  if (authLoading || jobsLoading) {
    return <DashboardLoader />;
  }

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={refetch}
      />
    );
  }

  /* ================= UI ================= */

  const statusOptions = [
    { value: 'ALL', label: 'All', icon: Briefcase },
    { value: 'SUBMITTED', label: 'Pending', icon: Clock },
    { value: 'BIDDING', label: 'Bidding', icon: Package },
    { value: 'ACTIVE', label: 'Active', icon: Package },
    { value: 'COMPLETED', label: 'Completed', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ===== HEADER ===== */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Available Jobs
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and bid on available transport jobs
          </p>
        </div>

        {/* ===== SEARCH + FILTER ===== */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="
                w-full rounded-lg border border-gray-300 bg-white
                py-2.5 pl-9 pr-9 text-sm
                focus:border-orange-600 focus:ring-2 focus:ring-orange-200
              "
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* ===== FILTER CHIPS ===== */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(opt => {
              const Icon = opt.icon;
              const active = statusFilter === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    ${active
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700'}
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ===== RESULT COUNT ===== */}
        <p className="text-sm text-gray-500">
          Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </p>

        {/* ===== CONTENT ===== */}
        {filteredJobs.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              No jobs found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}