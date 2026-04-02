'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { JobCard } from '@/components/jobs/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useEffect } from 'react';

export default function MyJobsPage() {
  const { user } = useAuth();
  const { jobs, loading, error, fetchJobs } = useJobs();

  useEffect(() => {
    fetchJobs();
  }, []);

  // Safety check - ensure jobs is an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];
  
  // Filter jobs for the current user
  const myJobs = jobsArray.filter(job => job.clientId === user?.id);
  const activeJobs = myJobs.filter(job => 
    ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status)
  );
  const completedJobs = myJobs.filter(job => job.status === 'COMPLETED');
  const cancelledJobs = myJobs.filter(job => job.status === 'CANCELLED');

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
        <button onClick={fetchJobs} className="mt-4 text-primary-600 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="container-custom py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">My Shipments</h1>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{activeJobs.length}</p>
            <p className="text-sm text-blue-600">Active Shipments</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedJobs.length}</p>
            <p className="text-sm text-green-600">Completed</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{cancelledJobs.length}</p>
            <p className="text-sm text-red-600">Cancelled</p>
          </div>
        </div>

        {/* Jobs List */}
        {myJobs.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No shipments found</p>
            <a href="/jobs/create" className="mt-4 inline-block text-primary-600 hover:underline">
              Post your first shipment →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {myJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </RoleBasedRoute>
  );
}