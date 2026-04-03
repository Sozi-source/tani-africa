// components/ui/BackNavigation.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BackNavigationProps {
  label?: string;
  href?: string;
}

export function BackNavigation({ label = 'Back', href }: BackNavigationProps) {
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
      className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors sm:hidden"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}