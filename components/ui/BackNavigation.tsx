'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackNavigationProps {
  label?: string;
  href?: string;
}

export function BackNavigation({
  label = 'Back',
  href,
}: BackNavigationProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        mb-4 sm:hidden
        inline-flex items-center gap-1.5
        text-sm font-medium
        text-gray-500
        transition-colors
        hover:text-red-600
      "
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}