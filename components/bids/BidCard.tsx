'use client';

import { Bid } from '@/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { User, Clock, MessageSquare, CheckCircle, XCircle, Star } from 'lucide-react';

interface BidCardProps {
  bid: Bid;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
  isClient?: boolean;
}

export const BidCard: React.FC<BidCardProps> = ({
  bid,
  onAccept,
  onReject,
  showActions = true,
  isClient = false,
}) => {
  const statusStyles: Record<string, string> = {
    SUBMITTED: 'bg-yellow-100 text-yellow-800 border-l-yellow-500',
    PENDING: 'bg-orange-100 text-orange-800 border-l-orange-500',
    ACCEPTED: 'bg-green-100 text-green-800 border-l-green-500',
    REJECTED: 'bg-red-100 text-red-700 border-l-red-500',
    EXPIRED: 'bg-gray-100 text-gray-600 border-l-gray-500',
  };

  return (
    <Card variant={bid.status === 'ACCEPTED' ? 'success' : bid.status === 'REJECTED' ? 'danger' : 'default'} className="hover:shadow-lg transition-all duration-300">
      <CardBody className="flex h-full flex-col p-5">
        
        {/* Status + Time */}
        <div className="flex justify-between items-center mb-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium border-l-4 ${statusStyles[bid.status] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {bid.status}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(bid.createdAt)}
          </span>
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-maroon-500 to-teal-500 flex items-center justify-center shadow-sm">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {bid.driver?.firstName} {bid.driver?.lastName}
            </p>
            {bid.driver?.rating && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                Rating: {bid.driver.rating.toFixed(1)}/5
              </p>
            )}
          </div>
        </div>

        {/* Bid Price */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-maroon-600">
            {formatCurrency(bid.price)}
          </span>
        </div>

        {/* Estimated Duration */}
        {bid.estimatedDuration && (
          <div className="mb-2 flex items-center text-sm text-gray-600">
            <Clock className="mr-2 h-4 w-4 text-teal-500" />
            Estimated: {bid.estimatedDuration} day(s)
          </div>
        )}

        {/* Message */}
        {bid.message && (
          <div className="mb-4 flex items-start text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <MessageSquare className="mr-2 mt-0.5 h-4 w-4 text-maroon-400" />
            <p className="line-clamp-3">{bid.message}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && isClient && bid.status === 'SUBMITTED' && (
          <div className="mt-auto flex gap-2 pt-3">
            <Button
              variant="success"
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onAccept}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};