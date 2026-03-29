import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Vehicle } from '@/types';
import { Truck, Gauge, Hash, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { VEHICLE_CATEGORIES } from '@/lib/utils/constants';

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: () => void;
  showActions?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onDelete, showActions = true }) => {
  const getCategoryName = (category: string) => {
    return VEHICLE_CATEGORIES[category] || category.replace(/_/g, ' ');
  };

  return (
    <Card hover className="h-full">
      <CardBody className="flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary-100 p-2">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">{vehicle.plateNumber}</span>
          </div>
          {vehicle.isApproved ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>

        <p className="mb-2 text-sm text-gray-600">{getCategoryName(vehicle.category)}</p>
        
        {vehicle.capacity && (
          <div className="mb-2 flex items-center text-sm text-gray-500">
            <Gauge className="mr-2 h-4 w-4" />
            <span>{vehicle.capacity} tons capacity</span>
          </div>
        )}
        
        {vehicle.description && (
          <p className="mb-4 text-sm text-gray-500 line-clamp-2">{vehicle.description}</p>
        )}

        <div className="mb-4 flex items-center text-xs text-gray-400">
          <Hash className="mr-1 h-3 w-3" />
          <span>ID: {vehicle.id.slice(-8)}</span>
        </div>

        {showActions && onDelete && (
          <div className="mt-auto pt-4">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={onDelete}
              className="flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Vehicle
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};