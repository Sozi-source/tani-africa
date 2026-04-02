'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { VehicleList } from '@/components/vehicles/VehicleList';

export default function VehiclesPage() {
  const { user } = useAuth();
  const { vehicles, loading, error, deleteVehicle, fetchVehicles } = useVehicles(user?.id);

  const handleDelete = async (id: string) => {
    await deleteVehicle(id);
    await fetchVehicles();
  };

  return (
    <RoleBasedRoute allowedRoles={['DRIVER', 'ADMIN']}>
      <div className="container-custom py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">My Fleet</h1>
        <VehicleList
          vehicles={vehicles}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          showAddButton
        />
      </div>
    </RoleBasedRoute>
  );
}