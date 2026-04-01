'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Toaster } from 'react-hot-toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
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
        }}
      />
    </AuthProvider>
  );
}