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
  const { initializing } = useAuth();
  const pathname = usePathname();

  /* ================= Sidebar & Responsive ================= */

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ================= Loader Control ================= */

  // ✅ Enforce minimum 3s loader visibility
  const showLoader = usePageLoader(initializing, 3000);

  /* ================= Auth Pages Bypass ================= */

  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) {
    return <>{children}</>;
  }

  /* ================= Loader Gate ================= */

  if (showLoader) {
    return <PageLoader />;
  }

  /* ================= Layout ================= */

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

        {/* ✅ MAIN CONTENT */}
        <main className="pt-16 flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* ✅ Breadcrumbs */}
            <Breadcrumb />

            {/* ✅ Page Content */}
            {children}
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}