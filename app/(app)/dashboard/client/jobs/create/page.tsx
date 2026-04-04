'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { useJobs } from '@/lib/hooks/useJobs';
import { CreateJobData } from '@/types';

import { Plus } from 'lucide-react';

/* =====================================================
   Page
===================================================== */

export default function ClientJobsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { createJob, loading } = useJobs();

  /* ================= Handlers ================= */

  const handleCreateJob = async (data: CreateJobData) => {
    try {
      await createJob(data);
      toast.success('Job posted successfully');
      setIsCreateOpen(false);
    } catch (error: any) {
      toast.error(
        error?.message || 'Failed to create job'
      );
    }
  };

  /* ================= Render ================= */

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Jobs
          </h1>
          <p className="text-sm text-gray-500">
            Create and manage your delivery requests
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Post Job
        </Button>
      </div>

      {/* ===== Jobs List Placeholder ===== */}
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
        Jobs you create will appear here.
      </div>

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