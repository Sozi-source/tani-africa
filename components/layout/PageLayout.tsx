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
    <div className={`min-h-screen bg-[color:var(--color-gray-50)] ${containerClassName}`}>
      
      {/* ✅ SOFT NAIVAS BRAND STRIP */}
      <div
        className="h-2 w-full"
        style={{
          background: 'var(--gradient-primary)',
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Back Navigation (mobile only) */}
        {showBackButton && (
          <BackNavigation label={backButtonLabel} href={backButtonHref} />
        )}

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* ✅ PAGE HEADER WRAPPER (BRAND-AWARE) */}
        <div className="mt-3 mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <PageHeader
            title={title}
            subtitle={subtitle}
            showBackButton={showBackButton}
            backButtonLabel={backButtonLabel}
            backButtonHref={backButtonHref}
            actions={actions}
          />
        </div>

        {/* Page Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}