// components/layout/AppLayout.tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import {DashboardFooter} from '@/components/layout/DashboardFooter';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth pages (login/register) - no sidebar or header
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {children}
      </div>
    );
  }

  // Dashboard pages - with sidebar and header
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed on desktop, slide-in on mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:ml-0">
        {/* Desktop Header - hidden on mobile, visible on lg screens */}
        <div className="hidden lg:block">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
        
        {/* Mobile Header - visible only on mobile */}
        <div className="lg:hidden">
          <MobileHeader />
        </div>
        
        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <Breadcrumb />
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <DashboardFooter />
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}