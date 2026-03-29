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
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      SUBMITTED: 'Submitted',
      PENDING: 'Pending Review',
      ACCEPTED: 'Accepted',
      REJECTED: 'Rejected',
      EXPIRED: 'Expired',
    };
    return texts[status] || status;
  };

  return (
    <Card hover className="h-full">
      <CardBody className="flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(bid.status)}`}>
            {getStatusText(bid.status)}
          </span>
          <span className="text-xs text-gray-500">{formatRelativeTime(bid.createdAt)}</span>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{bid.driver?.firstName} {bid.driver?.lastName}</p>
            {bid.driver?.rating && (
              <p className="text-xs text-gray-500">⭐ {bid.driver.rating}/5</p>
            )}
          </div>
        </div>

        <div className="mb-3">
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(bid.price)}
          </span>
        </div>

        {bid.estimatedDuration && (
          <div className="mb-2 flex items-center text-sm text-gray-600">
            <Clock className="mr-2 h-4 w-4" />
            <span>Estimated: {bid.estimatedDuration} days</span>
          </div>
        )}

        {bid.message && (
          <div className="mb-4 flex items-start text-sm text-gray-600">
            <MessageSquare className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="line-clamp-2">{bid.message}</p>
          </div>
        )}

        {showActions && isClient && bid.status === 'SUBMITTED' && (
          <div className="mt-auto flex gap-2 pt-4">
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              onClick={onAccept}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={onReject}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};