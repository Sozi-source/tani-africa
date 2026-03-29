'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useState } from 'react';

export default function CreateJobPage() {
  const router = useRouter();
  const { createJob } = useJobs();
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = async (data: any) => {
    await createJob(data);
    router.push('/jobs/my');
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  return (
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <CreateJobModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </ProtectedRoute>
  );
}