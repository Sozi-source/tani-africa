'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from '@/components/layout/Sidebar';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { PageLoader } from '@/components/ui/PageLoader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

import { useAuth } from '@/context/AuthContext';
import { usePageLoader } from '@/lib/hooks/usePageLoader';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { initializing, loading } = useAuth(); // ✅ Use 'loading' not 'isLoading'
  const pathname = usePathname();

  /* ================= Sidebar & Responsive ================= */

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLayoutReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ================= Loader Control ================= */

  // Show loader during auth init, API calls, or until layout is ready
  const showLoader = initializing || loading || !isLayoutReady;

  /* ================= Auth Pages Bypass ================= */

  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) {
    return <>{children}</>;
  }

  /* ================= Loader Gate ================= */
  // Loader covers everything - no layout elements visible
  if (showLoader) {
    return <PageLoader isLoading={true} />;
  }

  /* ================= Layout ================= */
  // Only render layout after loader is done
  const sidebarWidth = isMobile ? 0 : isSidebarCollapsed ? 72 : 280;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <div
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <UnifiedHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          sidebarWidth={sidebarWidth}
        />

        <main className="pt-16 flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Breadcrumb />
            {children}
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}