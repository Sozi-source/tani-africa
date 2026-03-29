import { Vehicle } from '@/types';
import { VehicleCard } from './VehicleCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  showAddButton?: boolean;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  loading,
  error,
  onDelete,
  showActions = true,
  showAddButton = true,
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

  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No vehicles added yet</p>
        {showAddButton && (
          <Link href="/vehicles/add">
            <Button variant="primary" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vehicle
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onDelete={onDelete ? () => onDelete(vehicle.id) : undefined}
          showActions={showActions}
        />
      ))}
    </div>
  );
};