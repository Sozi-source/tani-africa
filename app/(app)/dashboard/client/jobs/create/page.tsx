'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { JobCard } from '@/components/jobs/JobCard';
import { useJobs } from '@/lib/hooks/useJobs';
import { CreateJobData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { Plus, Package, RefreshCw } from 'lucide-react';

/* =====================================================
   Page
===================================================== */

export default function ClientJobsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { jobs, loading, error, fetchJobs, createJob, refetch } = useJobs();

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (data: CreateJobData) => {
    try {
      await createJob(data);
      toast.success('Job posted successfully');
      setIsCreateOpen(false);
      await refetch(); // Refresh the list
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create job');
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage your delivery requests
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-maroon-600 hover:bg-maroon-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Button>
        </div>
      </div>

      {/* ===== Jobs List ===== */}
      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Click "Post Job" to create your first delivery request
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-maroon-600 hover:bg-maroon-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Post Your First Job
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}

      {/* ===== Create Job Modal ===== */}
      <CreateJobModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateJob}
        isSubmitting={loading}
      />
    </div>
  );
}