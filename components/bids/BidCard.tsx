'use client';

import { Bid } from '@/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatters';
import { User, Clock, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

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
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    PENDING: 'bg-orange-100 text-orange-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-gray-100 text-gray-600',
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition">
      <CardBody className="flex h-full flex-col p-4">
        
        {/* Status + Time */}
        <div className="flex justify-between items-center mb-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              statusStyles[bid.status] ?? 'bg-gray-100 text-gray-600'
            }`}
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
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {bid.driver?.firstName} {bid.driver?.lastName}
            </p>
            {bid.driver?.rating && (
              <p className="text-xs text-gray-500">
                Rating: {bid.driver.rating.toFixed(1)}/5
              </p>
            )}
          </div>
        </div>

        {/* Bid Price */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(bid.price)}
          </span>
        </div>

        {/* Estimated Duration */}
        {bid.estimatedDuration && (
          <div className="mb-2 flex items-center text-sm text-gray-600">
            <Clock className="mr-2 h-4 w-4 text-gray-400" />
            Estimated: {bid.estimatedDuration} day(s)
          </div>
        )}

        {/* Message */}
        {bid.message && (
          <div className="mb-4 flex items-start text-sm text-gray-600">
            <MessageSquare className="mr-2 mt-0.5 h-4 w-4 text-gray-400" />
            <p className="line-clamp-3">{bid.message}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && isClient && bid.status === 'SUBMITTED' && (
          <div className="mt-auto flex gap-2 pt-3">
            <Button
              variant="success"
              size="sm"
              className="flex-1"
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
