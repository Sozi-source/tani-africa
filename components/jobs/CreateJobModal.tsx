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

import { Info, Package } from 'lucide-react';

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
      {/* ✅ Centered container */}
      <div className="flex justify-center">
        <div className="w-full max-w-xl">

          {/* ✅ Scrollable body (not full height) */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
          >
            {/* Job Title */}
            <input
              {...register('title')}
              placeholder="Job title (optional)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
            />

            {/* Pickup Location */}
            <div>
              <input
                {...register('pickUpLocation')}
                placeholder="Pickup location *"
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                  errors.pickUpLocation
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-orange-200'
                }`}
              />
              {errors.pickUpLocation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.pickUpLocation.message}
                </p>
              )}
            </div>

            {/* Dropoff Location */}
            <div>
              <input
                {...register('dropOffLocation')}
                placeholder="Dropoff location *"
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                  errors.dropOffLocation
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-orange-200'
                }`}
              />
              {errors.dropOffLocation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dropOffLocation.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <textarea
                {...register('description')}
                rows={4}
                maxLength={1000}
                placeholder="Job description (optional)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-600 focus:ring-2 focus:ring-orange-200"
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {charCount}/1000 characters
              </p>
            </div>

            {/* Weight & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                {...register('cargoWeight', { valueAsNumber: true })}
                placeholder="Weight (kg)"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-200"
              />
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="Budget (KES)"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Scheduled Date */}
            <input
              type="datetime-local"
              {...register('scheduledDate')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-200"
            />

            {/* Info */}
            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 flex gap-2">
              <Info className="h-5 w-5 shrink-0" />
              Your job will be reviewed before going live to drivers.
            </div>

            {/* Tip */}
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 flex gap-2">
              <Package className="h-5 w-5 shrink-0" />
              Clear locations and fair pricing attract better bids.
            </div>

            {/* ✅ Footer (not full-height, no sticky hacks) */}
            <div className="pt-4 mt-4 border-t border-gray-200 bg-white">
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSubmitting ? 'Posting job…' : 'Submit Job'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}