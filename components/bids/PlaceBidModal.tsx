'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useBids } from '@/lib/hooks/useBids';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  Truck, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  Send, 
  Info, 
  Gavel, 
  TrendingUp, 
  Award,
  Sparkles,
  Star
} from 'lucide-react';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle?: string;
  onSuccess?: () => void;
}

export function PlaceBidModal({ isOpen, onClose, jobId, jobTitle, onSuccess }: PlaceBidModalProps) {
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

    const priceValue = parseInt(price);
    if (!price || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (priceValue < 100) {
      toast.error('Minimum bid is KES 100');
      return;
    }

    setLoading(true);
    try {
      await placeBid({
        price: priceValue,
        estimatedDuration: duration ? parseInt(duration) : undefined,
        message: message || undefined,
        jobId,
      });
      
      toast.success('🎉 Bid placed successfully!');
      onSuccess?.();
      onClose();
      // Reset form
      setPrice('');
      setDuration('');
      setMessage('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
      showConfirmButton={false}
      showCancelButton={false}
    >
      <div className="relative max-h-[85vh] overflow-y-auto">
        {/* Decorative Elements */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full opacity-50 blur-xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full opacity-50 blur-xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {/* Header - Reduced padding and size */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-md mb-2">
              <Gavel className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Place Your Bid</h2>
            <p className="text-xs text-gray-500 mt-0.5">Win this job with your best offer</p>
          </div>

          {/* Job Info Card - Reduced padding */}
          {jobTitle && (
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-3 border border-primary-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <Truck className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-primary-600 font-medium">You're bidding on</p>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{jobTitle}</p>
                </div>
                <Sparkles className="h-3 w-3 text-amber-500" />
              </div>
            </div>
          )}

          {/* Price Input - Reduced padding */}
          <div className="group">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary-500" />
                Your Bid Amount
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="text-xs font-medium">KES</span>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 pl-12 text-base font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                required
                min={100}
                step={100}
              />
              {price && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5" />
                    <span>Competitive</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-0.5">
              <p className="text-xs text-gray-400">Min: KES 100</p>
              <p className="text-xs text-primary-600">Suggested: KES {jobTitle ? '2,500' : '500'}+</p>
            </div>
          </div>

          {/* Estimated Duration - Reduced padding */}
          <div className="group">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary-500" />
                Estimated Duration
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter hours"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 pr-16 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                min={1}
                step={0.5}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                hours
              </div>
            </div>
          </div>

          {/* Message - Reduced rows */}
          <div className="group">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary-500" />
                Message to Client
              </span>
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the client why you're the best choice..."
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all resize-none"
            />
            {message && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Star className="h-2.5 w-2.5 text-amber-500" />
                Adding a personal message increases your chances by 40%
              </p>
            )}
          </div>

          {/* Tips Card - Compact version */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2.5 border border-amber-100">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-white rounded-lg shadow-sm">
                <Award className="h-3 w-3 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800 mb-1">✨ Pro Tips</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-amber-700">
                  <div className="flex items-center gap-0.5">
                    <span className="text-amber-500 text-xs">✓</span>
                    <span>Competitive pricing</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-amber-500 text-xs">✓</span>
                    <span>Fast delivery</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-amber-500 text-xs">✓</span>
                    <span>Professional message</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-amber-500 text-xs">✓</span>
                    <span>Good communication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Reduced padding */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-2 text-sm rounded-lg border-2 hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-1 justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 justify-center">
                  <Send className="h-3 w-3" />
                  Place Bid
                </span>
              )}
            </Button>
          </div>

          {/* Trust Badge - Minimal */}
          <div className="text-center pt-1">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Info className="h-2.5 w-2.5" />
              Secure bid, reviewed by client
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
}