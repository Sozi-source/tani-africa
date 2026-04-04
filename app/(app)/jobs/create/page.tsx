'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { CreateJobData } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const { createJob, loading: jobsLoading } = useJobs();

  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= REDIRECTS ================= */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (user.role !== 'CLIENT') {
      toast.error('Only clients can create jobs');
      router.replace('/dashboard');
    }
  }, [authLoading, user, router]);

  /* ================= HANDLERS ================= */

  const handleSubmit = async (data: CreateJobData) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a job');
      router.replace('/auth/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJob({
        ...data,
        clientId: user.id,
      });

      toast.success('Job created successfully');
      router.push('/jobs/my');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create job');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  /* ================= LOADING ================= */

  if (authLoading || jobsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'CLIENT') {
    return null;
  }

  /* ================= RENDER ================= */

  return (
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <CreateJobModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ProtectedRoute>
  );
}