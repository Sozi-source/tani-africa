'use client';

import { Job } from '@/types';
import { JobCard } from './JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Package } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  showPostButton?: boolean;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  error,
  showPostButton = false,
}) => {
  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-300" />
        <p className="text-sm text-gray-500 mt-2">No jobs found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} showBidButton />
      ))}
    </div>
  );
};