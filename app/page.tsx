'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect to role-specific dashboard
        if (user.role === 'CLIENT') {
          router.push('/dashboard');
        } else if (user.role === 'DRIVER') {
          router.push('/dashboard/driver');
        } else if (user.role === 'ADMIN') {
          router.push('/admin');
        }
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      // Your existing landing page content here
      <div>Landing Page Content</div>
    );
  }

  return null;
}