// components/jobs/JobList.tsx
'use client';

import { Job } from '@/types';
import { JobCard } from './JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { Package, AlertCircle } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  showActions?: boolean;
  showBidButton?: boolean;
  showBranding?: boolean;
  showPostButton?: boolean;
  onRefresh?: () => void;
  gridCols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  error,
  emptyMessage = 'No jobs found',
  showActions = true,
  showBidButton = false,
  showBranding = false,
  showPostButton = false,
  onRefresh,
  gridCols = { mobile: 1, tablet: 2, desktop: 3 }
}) => {
  const router = useRouter();

  const getGridClasses = () => {
    const classes = ['grid', 'gap-3', 'sm:gap-4', 'md:gap-5'];
    
    // Mobile (default 1 column)
    if (gridCols.mobile === 1) classes.push('grid-cols-1');
    if (gridCols.mobile === 2) classes.push('grid-cols-2');
    
    // Tablet
    if (gridCols.tablet === 2) classes.push('sm:grid-cols-2');
    if (gridCols.tablet === 3) classes.push('sm:grid-cols-3');
    
    // Desktop
    if (gridCols.desktop === 2) classes.push('lg:grid-cols-2');
    if (gridCols.desktop === 3) classes.push('lg:grid-cols-3');
    if (gridCols.desktop === 4) classes.push('lg:grid-cols-4');
    
    return classes.join(' ');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-gray-500">Loading jobs...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
        <p className="text-red-600 text-sm font-medium">Error loading jobs</p>
        <p className="text-red-500 text-xs mt-1">{error}</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="mt-3 text-sm text-red-700 hover:text-red-800 underline font-medium"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
          <Package className="h-12 w-12" />
        </div>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
        {showPostButton && (
          <button
            onClick={() => router.push('/jobs/create')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Post a Job
          </button>
        )}
      </div>
    );
  }

  // Jobs grid
  return (
    <div className={getGridClasses()}>
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job}
          showActions={showActions}
          showBidButton={showBidButton}
          showBranding={showBranding}
          showPostButton={showPostButton}
          onPostJob={() => router.push('/jobs/create')}
        />
      ))}
    </div>
  );
};