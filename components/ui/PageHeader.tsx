// components/ui/PageHeader.tsx
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  backButtonLabel = 'Back',
  backButtonHref,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-5 sm:mb-6">
      {/* Back button - mobile only */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors sm:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backButtonLabel}</span>
        </button>
      )}

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}