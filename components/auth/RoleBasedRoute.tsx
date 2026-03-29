'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('ADMIN' | 'CLIENT' | 'DRIVER')[];
  redirectTo?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user && !allowedRoles.includes(user.role)) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
};