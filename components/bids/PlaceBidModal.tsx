'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { CreateBidData } from '@/types';

const bidSchema = z.object({
  price: z.number().min(1, 'Price must be at least 1'),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 day').optional(),
  message: z.string().optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBidData) => Promise<void>;
  jobId: string;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  jobId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      price: undefined,
      estimatedDuration: undefined,
      message: '',
    },
  });

  const handleFormSubmit = async (data: BidFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({ ...data, jobId });
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
      title="Place a Bid"
      showConfirmButton
      confirmText="Submit Bid"
      onConfirm={handleSubmit(handleFormSubmit)}
      showCancelButton
      cancelText="Cancel"
      isLoading={isLoading}
    >
      <form className="space-y-4">
        <Input
          label="Your Price (KES)"
          type="number"
          placeholder="5000"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
        />

        <Input
          label="Estimated Duration (days) - Optional"
          type="number"
          placeholder="2"
          {...register('estimatedDuration', { valueAsNumber: true })}
          error={errors.estimatedDuration?.message}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Message to Client (Optional)</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Explain why you're the best fit for this job..."
            {...register('message')}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
        </div>
      </form>
    </Modal>
  );
};