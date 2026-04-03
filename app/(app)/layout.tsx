'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth/');
  
  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && (
        <>
          <div className="hidden md:block">
            <Header />
          </div>
          <MobileHeader />
        </>
      )}
      
      <main className="flex-1">
        {!isAuthPage ? (
          <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
              <Breadcrumb />
              {children}
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {children}
          </div>
        )}
      </main>
      
      {!isAuthPage && (
        <>
          <Footer />
          <MobileBottomNav />
        </>
      )}
    </div>
  );
}