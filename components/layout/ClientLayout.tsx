'use client';

import { Suspense } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { PageLoader } from '../ui/PageLoader';

export function ClientLayout({ children }: { children: React.ReactNode }) {
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