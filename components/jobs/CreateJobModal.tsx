'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { CreateJobData } from '@/types';

import { Info, Package, MapPin, Calendar, Weight, DollarSign } from 'lucide-react';

/* ================= VALIDATION SCHEMA ================= */

const jobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  pickUpLocation: z.string().min(1, 'Pickup location is required'),
  dropOffLocation: z.string().min(1, 'Dropoff location is required'),
  cargoWeight: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  scheduledDate: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData) => Promise<void>;
  isSubmitting?: boolean;
}

/* ================= COMPONENT ================= */

export function CreateJobModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateJobModalProps) {
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
      cargoWeight: undefined,
      price: undefined,
      scheduledDate: '',
    },
  });

  const description = watch('description', '');

  /* ================= EFFECTS ================= */

  useEffect(() => {
    setCharCount(description?.length ?? 0);
  }, [description]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  /* ================= SUBMIT ================= */

  const handleFormSubmit = async (data: JobFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    const payload: CreateJobData = {
      clientId: user.id,
      pickUpLocation: data.pickUpLocation,
      dropOffLocation: data.dropOffLocation,
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.cargoWeight !== undefined && { cargoWeight: data.cargoWeight }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.scheduledDate && {
        scheduledDate: new Date(data.scheduledDate).toISOString(),
      }),
    };

    await onSubmit(payload);
    reset();
  };

  /* ================= RENDER ================= */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post a New Job"
      size="lg"
    >
      <div className="flex justify-center">
        <div className="w-full max-w-xl">

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-5 max-h-[60vh] overflow-y-auto pr-2"
          >
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (Optional)</label>
              <input
                {...register('title')}
                placeholder="e.g., Urgent Delivery to Nairobi"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-maroon-500 focus:ring-2 focus:ring-maroon-200 transition-colors"
              />
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location <span className="text-maroon-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('pickUpLocation')}
                  placeholder="Enter pickup address"
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 focus:ring-2 transition-colors ${
                    errors.pickUpLocation
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-maroon-500 focus:ring-maroon-200'
                  }`}
                />
              </div>
              {errors.pickUpLocation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.pickUpLocation.message}
                </p>
              )}
            </div>

            {/* Dropoff Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff Location <span className="text-maroon-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('dropOffLocation')}
                  placeholder="Enter dropoff address"
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 focus:ring-2 transition-colors ${
                    errors.dropOffLocation
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-maroon-500 focus:ring-maroon-200'
                  }`}
                />
              </div>
              {errors.dropOffLocation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dropOffLocation.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                {...register('description')}
                rows={4}
                maxLength={1000}
                placeholder="Describe the cargo, special instructions, etc."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-maroon-500 focus:ring-2 focus:ring-maroon-200 transition-colors"
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {charCount}/1000 characters
              </p>
            </div>

            {/* Weight & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    {...register('cargoWeight', { valueAsNumber: true })}
                    placeholder="Weight"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (KES)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="Budget"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date (Optional)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  {...register('scheduledDate')}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 focus:border-maroon-500 focus:ring-2 focus:ring-maroon-200 transition-colors"
                />
              </div>
            </div>

            {/* Info Boxes */}
            <div className="rounded-lg bg-teal-50 border-l-4 border-teal-500 p-3 text-sm text-teal-800 flex gap-2">
              <Info className="h-5 w-5 shrink-0 text-teal-600" />
              Your job will be reviewed before going live to drivers.
            </div>

            <div className="rounded-lg bg-green-50 border-l-4 border-green-500 p-3 text-sm text-green-800 flex gap-2">
              <Package className="h-5 w-5 shrink-0 text-green-600" />
              Clear locations and fair pricing attract better bids.
            </div>

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-gray-200">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full bg-maroon-600 hover:bg-maroon-700 text-white"
              >
                {isSubmitting ? 'Posting job...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}