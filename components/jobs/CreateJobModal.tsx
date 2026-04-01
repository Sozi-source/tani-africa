// src/components/jobs/CreateJobModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { CreateJobData } from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { MapPin, Package, Weight, DollarSign, Calendar, FileText, Info } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  pickUpLocation: z.string().min(1, 'Pickup location is required'),
  dropOffLocation: z.string().min(1, 'Dropoff location is required'),
  cargoType: z.string().optional(),
  cargoWeight: z.number().min(0, 'Weight must be positive').optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  scheduledDate: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData) => Promise<void>;
  isSubmitting?: boolean;
}

const cargoTypes = [
  { value: '', label: 'Select cargo type' },
  { value: 'General Goods', label: 'General Goods' },
  { value: 'Perishable', label: 'Perishable (Food, Flowers, etc.)' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Construction Materials', label: 'Construction Materials' },
  { value: 'Agricultural Products', label: 'Agricultural Products' },
  { value: 'Hazardous Materials', label: 'Hazardous Materials' },
  { value: 'Livestock', label: 'Livestock' },
  { value: 'Other', label: 'Other' },
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { user } = useAuth();
  const [charCount, setCharCount] = useState(0);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      pickUpLocation: '',
      dropOffLocation: '',
      cargoType: '',
      cargoWeight: undefined,
      price: undefined,
      scheduledDate: '',
    },
  });

  const description = watch('description', '');
  
  useEffect(() => {
    setCharCount(description?.length || 0);
  }, [description]);

  const handleFormSubmit = async (data: JobFormData) => {
    // Validate user is logged in
    if (!user?.id) {
      toast.error('You must be logged in to post a job');
      return;
    }

    // Build job data
    const jobData: CreateJobData = {
      pickUpLocation: data.pickUpLocation,
      dropOffLocation: data.dropOffLocation,
      clientId: user.id,
      ...(data.title && data.title.trim() !== '' && { title: data.title.trim() }),
      ...(data.description && data.description.trim() !== '' && { description: data.description.trim() }),
      ...(data.cargoType && data.cargoType !== '' && { cargoType: data.cargoType }),
      ...(data.cargoWeight !== undefined && data.cargoWeight > 0 && { cargoWeight: Number(data.cargoWeight) }),
      ...(data.price !== undefined && data.price > 0 && { price: Number(data.price) }),
      ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate).toISOString() }),
    };

    await onSubmit(jobData);
    reset();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  // Form Field Component
  const FormField = ({ 
    label, 
    icon: Icon, 
    required, 
    children 
  }: { 
    label: string; 
    icon: React.ComponentType<{ className?: string }>; 
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
        <Icon className="h-4 w-4 text-gray-500" />
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Post a New Job"
      showConfirmButton
      confirmText={isSubmitting ? 'Posting...' : 'Post Job'}
      onConfirm={handleSubmit(handleFormSubmit)}
      showCancelButton
      cancelText="Cancel"
      size="lg"
      isLoading={isSubmitting}
    >
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        <div className="space-y-4">
          {/* Job Title */}
          <FormField label="Job Title" icon={FileText}>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="e.g., Transport Furniture from Nairobi to Mombasa"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
            <p className="text-xs text-gray-500">Optional - A clear title helps drivers understand your needs</p>
          </FormField>

          {/* Pickup Location */}
          <FormField label="Pickup Location" icon={MapPin} required>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="City, address, or landmark"
              {...register('pickUpLocation')}
            />
            {errors.pickUpLocation && (
              <p className="text-sm text-red-600">{errors.pickUpLocation.message}</p>
            )}
          </FormField>

          {/* Dropoff Location */}
          <FormField label="Dropoff Location" icon={MapPin} required>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="City, address, or landmark"
              {...register('dropOffLocation')}
            />
            {errors.dropOffLocation && (
              <p className="text-sm text-red-600">{errors.dropOffLocation.message}</p>
            )}
          </FormField>

          {/* Cargo Type and Weight */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Cargo Type" icon={Package}>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                {...register('cargoType')}
              >
                {cargoTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Cargo Weight (kg)" icon={Weight}>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="500"
                {...register('cargoWeight', { valueAsNumber: true })}
              />
              {errors.cargoWeight && (
                <p className="text-sm text-red-600">{errors.cargoWeight.message}</p>
              )}
              <p className="text-xs text-gray-500">Optional - Helps drivers with vehicle capacity</p>
            </FormField>
          </div>

          {/* Price and Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Price (KES)" icon={DollarSign}>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="5000"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
              <p className="text-xs text-gray-500">Optional - Leave blank for bidding</p>
            </FormField>

            <FormField label="Scheduled Date" icon={Calendar}>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                {...register('scheduledDate')}
              />
              {errors.scheduledDate && (
                <p className="text-sm text-red-600">{errors.scheduledDate.message}</p>
              )}
              <p className="text-xs text-gray-500">Optional - When should the job be completed?</p>
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description" icon={FileText}>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Describe your cargo, special requirements, loading/unloading instructions, or any additional details..."
              {...register('description')}
              maxLength={1000}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Optional - Be specific to attract the right drivers</span>
              <span>{charCount}/1000 characters</span>
            </div>
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </FormField>

          {/* Info message */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div className="space-y-1 text-xs text-blue-700">
                <p className="font-medium">How it works:</p>
                <p>✓ Your job will be listed for drivers to view and place bids</p>
                <p>✓ You'll receive notifications when drivers submit bids</p>
                <p>✓ Review bids and select the best driver for your needs</p>
                <p>✓ Track your job status in your dashboard</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex gap-3">
              <Package className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="space-y-1 text-xs text-green-700">
                <p className="font-medium">Tips for a successful job post:</p>
                <p>• Be specific about pickup and dropoff locations</p>
                <p>• Include accurate weight and dimensions if possible</p>
                <p>• Provide clear instructions for special handling</p>
                <p>• Set a reasonable price or leave for bidding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};