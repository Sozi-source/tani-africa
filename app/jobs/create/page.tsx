'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreateJobData } from '@/types';

export default function CreateJobPage() {
  const router = useRouter();
  const { createJob, loading: jobsLoading } = useJobs();
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // Redirect if user is not a client
  useEffect(() => {
    if (!authLoading && user && user.role !== 'CLIENT') {
      toast.error('Only clients can create jobs');
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (data: CreateJobData) => {
    // Validate user exists before proceeding
    if (!user?.id) {
      toast.error('You must be logged in to create a job');
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJob({
        ...data,
        clientId: user.id, // Now guaranteed to be string
      });
      toast.success('Job created successfully!');
      router.push('/jobs/my');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job. Please try again.');
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  // Show loading state
  if (authLoading || jobsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render if user is not a client or no user
  if (!user || user.role !== 'CLIENT') {
    return null;
  }

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