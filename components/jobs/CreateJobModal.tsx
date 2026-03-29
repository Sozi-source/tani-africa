'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { CreateJobData } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { jobsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const jobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  pickUpLocation: z.string().min(1, 'Pickup location is required'),
  dropOffLocation: z.string().min(1, 'Dropoff location is required'),
  cargoWeight: z.number().min(0, 'Weight must be positive').optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  scheduledDate: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      pickUpLocation: '',
      dropOffLocation: '',
      cargoWeight: undefined,
      price: undefined,
      scheduledDate: '',
    },
  });

  const handleFormSubmit = async (data: JobFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to post a job');
      return;
    }

    setIsLoading(true);
    try {
      // Format data exactly as the API expects
      const jobData = {
        pickUpLocation: data.pickUpLocation,
        dropOffLocation: data.dropOffLocation,
        clientId: user.id,
        ...(data.title && data.title.trim() !== '' && { title: data.title }),
        ...(data.description && data.description.trim() !== '' && { description: data.description }),
        ...(data.cargoWeight && { cargoWeight: Number(data.cargoWeight) }),
        ...(data.price && { price: Number(data.price) }),
        ...(data.scheduledDate && { scheduledDate: data.scheduledDate }),
      };

      console.log('📤 Creating job:', jobData);

      const response = await jobsAPI.create(jobData as CreateJobData);
      
      console.log('✅ Job created:', response);
      toast.success('Job posted successfully!');
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('❌ Error creating job:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create job';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post a New Job"
      showConfirmButton
      confirmText="Post Job"
      onConfirm={handleSubmit(handleFormSubmit)}
      showCancelButton
      cancelText="Cancel"
      size="lg"
      isLoading={isLoading}
    >
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        <div className="space-y-4">
          {/* Job Title */}
          <Input
            label="Job Title (Optional)"
            placeholder="e.g., Transport Furniture from Nairobi to Mombasa"
            {...register('title')}
            error={errors.title?.message}
          />

          {/* Pickup Location */}
          <Input
            label="Pickup Location *"
            placeholder="City, address, or landmark"
            {...register('pickUpLocation')}
            error={errors.pickUpLocation?.message}
          />

          {/* Dropoff Location */}
          <Input
            label="Dropoff Location *"
            placeholder="City, address, or landmark"
            {...register('dropOffLocation')}
            error={errors.dropOffLocation?.message}
          />

          {/* Cargo Weight and Price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Cargo Weight (kg) - Optional"
              type="number"
              placeholder="500"
              {...register('cargoWeight', { valueAsNumber: true })}
              error={errors.cargoWeight?.message}
            />
            <Input
              label="Price (KES) - Optional"
              type="number"
              placeholder="5000"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Describe your cargo, special requirements, or any additional details..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Scheduled Date */}
          <Input
            label="Scheduled Date (Optional)"
            type="datetime-local"
            {...register('scheduledDate')}
            error={errors.scheduledDate?.message}
          />

          {/* Info message */}
          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-600">
            <p>✓ Job will be listed for drivers to bid on</p>
            <p>✓ You can track your job status in your dashboard</p>
            <p>✓ You'll receive notifications when drivers place bids</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};