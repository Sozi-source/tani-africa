import { Suspense } from 'react';
import UnifiedHeader from './UnifiedHeader';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UnifiedHeader />

      <Suspense fallback={null}>
        {children}
      </Suspense>

      <Footer />
      <MobileBottomNav />
    </AuthProvider>
  );
}