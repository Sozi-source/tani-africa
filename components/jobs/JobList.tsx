import { Job } from '@/types';
import { JobCard } from './JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  error,
  emptyMessage = 'No jobs found'
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};