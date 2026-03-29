'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useState } from 'react';

export default function AddVehiclePage() {
  const router = useRouter();
  const { createVehicle } = useVehicles();
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = async (data: any) => {
    await createVehicle(data);
    router.push('/vehicles');
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/vehicles');
  };

  return (
    <ProtectedRoute>
      <AddVehicleModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </ProtectedRoute>
  );
}