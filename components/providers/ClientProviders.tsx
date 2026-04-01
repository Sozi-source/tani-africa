'use client';

import { Suspense, useEffect, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { PageLoader } from '@/components/ui/PageLoader';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <div className="h-16 bg-white" />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AuthProvider>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-inter)',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#f97316',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </AuthProvider>
    </Suspense>
  );
}