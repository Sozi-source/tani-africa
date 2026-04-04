// app/(app)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { PageLoader } from '@/components/ui/PageLoader';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializing } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle loading state
  useEffect(() => {
    // Show loader while auth is initializing
    if (!initializing) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [initializing]);

  // Calculate sidebar width
  const sidebarWidth = isMobile
    ? 0
    : isSidebarCollapsed
    ? 72
    : 280;

  // Don't show sidebar on auth pages
  const isAuthPage = pathname?.includes('/auth/');
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Page Loader - Shows while loading */}
      <PageLoader isLoading={isLoading} />

      {/* Main Layout - Hidden while loading */}
      <div className={`min-h-screen bg-gray-50 ${isLoading ? 'hidden' : 'block'}`}>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCollapseChange={setIsSidebarCollapsed}
        />

        {/* Content wrapper */}
        <div
          className="min-h-screen flex flex-col transition-all duration-300 ease-in-out"
          style={{ marginLeft: sidebarWidth }}
        >
          {/* Fixed Header */}
          <UnifiedHeader
            onMenuClick={() => setIsSidebarOpen(true)}
            sidebarWidth={sidebarWidth}
          />

          {/* Main Content */}
          <main className="pt-16 flex-1">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* Dashboard Footer */}
          <DashboardFooter />
        </div>
      </div>
    </>
  );
}