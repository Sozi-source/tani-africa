// app/(app)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLoader } from './components/DashboardLoader';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (isAdmin) {
        router.push('/dashboard/admin');
      } else if (isDriver) {
        router.push('/dashboard/driver');
      } else if (isClient) {
        router.push('/dashboard/client');
      }
    }
  }, [loading, isAuthenticated, isAdmin, isDriver, isClient, router]);

  if (loading) return <DashboardLoader />;
  
  return <DashboardLoader />;
}