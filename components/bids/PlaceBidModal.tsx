'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useBids } from '@/lib/hooks/useBids';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Clock,
  MessageSquare,
  Send,
  Info,
} from 'lucide-react';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle?: string;
  onSuccess?: () => void;
}

export function PlaceBidModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  onSuccess,
}: PlaceBidModalProps) {
  const { user } = useAuth();
  const { placeBid } = useBids();

  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to place a bid');
      return;
    }

    const priceValue = Number(price);
    if (!priceValue || priceValue < 100) {
      toast.error('Minimum bid is KES 100');
      return;
    }

    setLoading(true);
    try {
      await placeBid({
        jobId,
        price: priceValue,
        estimatedDuration: duration ? Number(duration) : undefined,
        message: message || undefined,
      });

      toast.success('Bid placed successfully');
      setPrice('');
      setDuration('');
      setMessage('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Place Your Bid"
      size="md"
      showConfirmButton={false}
      showCancelButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Job Context */}
        {jobTitle && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Bidding for</p>
            <p className="font-medium text-gray-900 truncate">
              {jobTitle}
            </p>
          </div>
        )}

        {/* Bid Amount */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <DollarSign className="h-4 w-4 text-gray-500" />
            Bid Amount (KES)
          </label>
          <input
            type="number"
            min={100}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="
              mt-1 w-full rounded-lg border border-gray-300
              px-3 py-2 text-gray-900
              focus:border-red-600 focus:ring-2 focus:ring-red-200
            "
            placeholder="e.g. 2500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum bid is KES 100
          </p>
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4 text-gray-500" />
            Estimated Duration (days)
          </label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="
              mt-1 w-full rounded-lg border border-gray-300
              px-3 py-2 text-gray-900
              focus:border-red-600 focus:ring-2 focus:ring-red-200
            "
            placeholder="e.g. 2"
          />
        </div>

        {/* Message */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Message to Client (optional)
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="
              mt-1 w-full rounded-lg border border-gray-300
              px-3 py-2 text-gray-900
              focus:border-red-600 focus:ring-2 focus:ring-red-200
            "
            placeholder="Briefly explain why you are the best choice"
          />
        </div>

        {/* Tip */}
        <div className="flex gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          Clear pricing and a professional message improve your chances
          of being selected.
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <Send className="h-4 w-4 mr-1" />
            Place Bid
          </Button>
        </div>
      </form>
    </Modal>
  );
}