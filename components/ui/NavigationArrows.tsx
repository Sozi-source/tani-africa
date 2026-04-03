// components/ui/NavigationArrows.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavigationArrowsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

export function NavigationArrows({
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  previousLabel = 'Previous',
  nextLabel = 'Next',
}: NavigationArrowsProps) {
  if (!hasPrevious && !hasNext) return null;

  return (
    <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
      {hasPrevious ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {previousLabel}
        </Button>
      ) : (
        <div />
      )}
      {hasNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          className="flex items-center gap-1"
        >
          {nextLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}