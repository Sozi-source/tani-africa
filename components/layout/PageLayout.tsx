// components/layout/PageLayout.tsx
'use client';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PageHeader } from '@/components/ui/PageHeader';
import { BackNavigation } from '@/components/ui/BackNavigation';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
}

export function PageLayout({
  title,
  subtitle,
  showBackButton = false,
  backButtonLabel = 'Back',
  backButtonHref,
  actions,
  children,
  containerClassName = '',
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${containerClassName}`}>
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Back Navigation (mobile only) */}
        {showBackButton && (
          <BackNavigation label={backButtonLabel} href={backButtonHref} />
        )}
        
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Page Header */}
        <PageHeader
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          backButtonLabel={backButtonLabel}
          backButtonHref={backButtonHref}
          actions={actions}
        />
        
        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}