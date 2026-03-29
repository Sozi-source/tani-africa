'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { CreateVehicleData } from '@/types';
import { VEHICLE_CATEGORIES } from '@/lib/utils/constants';

const vehicleSchema = z.object({
  category: z.string().min(1, 'Vehicle category is required'),
  plateNumber: z.string().min(1, 'Plate number is required'),
  capacity: z.number().optional(),
  description: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVehicleData) => Promise<void>;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      category: '',
      plateNumber: '',
      capacity: undefined,
      description: '',
    },
  });

  const handleFormSubmit = async (data: VehicleFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vehicle"
      showConfirmButton
      confirmText="Add Vehicle"
      onConfirm={handleSubmit(handleFormSubmit)}
      showCancelButton
      cancelText="Cancel"
      isLoading={isLoading}
    >
      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle Category</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            {...register('category')}
          >
            <option value="">Select category</option>
            {Object.entries(VEHICLE_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
        </div>

        <Input
          label="Plate Number"
          placeholder="KCA 123A"
          {...register('plateNumber')}
          error={errors.plateNumber?.message}
        />

        <Input
          label="Capacity (tons) - Optional"
          type="number"
          placeholder="5"
          {...register('capacity', { valueAsNumber: true })}
          error={errors.capacity?.message}
        />

        <Input
          label="Description (Optional)"
          placeholder="e.g., White truck with refrigeration"
          {...register('description')}
          error={errors.description?.message}
        />
      </form>
    </Modal>
  );
};