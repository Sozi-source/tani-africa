'use client';

import { Job } from '@/types';
import { JobCard } from './JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Package, Truck } from 'lucide-react';

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
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700 text-sm">
        <p className="font-medium">Error loading jobs</p>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <div className="bg-maroon-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-maroon-400" />
        </div>
        <p className="text-gray-500 font-medium">No jobs found</p>
        <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} showBidButton />
      ))}
    </div>
  );
};