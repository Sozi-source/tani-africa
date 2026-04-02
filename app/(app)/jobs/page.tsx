'use client';

import { useState } from 'react';
import { useJobs } from '@/lib/hooks/useJobs';
import { useAuth } from '@/lib/hooks/useAuth';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';

export default function JobsPage() {
  const { user, isClient } = useAuth();
  const { jobs, loading, error } = useJobs();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    location: '',
  });

  const filteredJobs = jobs.filter(job => {
    if (filters.status && job.status !== filters.status) return false;
    if (filters.minPrice && job.price && job.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && job.price && job.price > Number(filters.maxPrice)) return false;
    if (filters.location && !job.pickUpLocation.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-red-600">Error loading jobs: {error}</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          <p className="mt-2 text-gray-600">Find the perfect job for your truck</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          {isClient && (
            <Link href="/jobs/create">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post Job
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
          <JobFilters filters={filters} setFilters={setFilters} />
        </div>
      )}

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No jobs found matching your criteria</p>
          {isClient && (
            <Link href="/jobs/create">
              <Button variant="primary" className="mt-4">
                Post a Job
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}