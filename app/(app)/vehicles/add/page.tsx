'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/hooks/useAuth';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal';

import toast from 'react-hot-toast';

export default function AddVehiclePage() {
  const router = useRouter();
  const { user } = useAuth();

  const { createVehicle } = useVehicles(user?.id);
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!user?.id) {
      toast.error('You must be logged in');
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await createVehicle(data);
      toast.success('Vehicle added successfully');
      router.push('/vehicles');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/vehicles');
  };

  return (
    <ProtectedRoute allowedRoles={['DRIVER']}>
      <AddVehicleModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ProtectedRoute>
  );
}