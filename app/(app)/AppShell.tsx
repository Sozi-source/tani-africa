// app/(app)/AppShell.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from '@/components/layout/Sidebar';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { PageLoader } from '@/components/ui/PageLoader';
import { LogoutLoader } from '@/components/ui/LogoutLoader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

import { useAuth } from '@/context/AuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { initializing, loading, isLoggingOut } = useAuth();
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

  /* ================= Auth Pages Bypass ================= */

  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) {
    return <>{children}</>;
  }

  /* ================= Logout Loader (Highest Priority) ================= */

  if (isLoggingOut) {
    return <LogoutLoader />;
  }

  /* ================= Regular Loader ================= */

  const showLoader = initializing || loading || !isLayoutReady;
  if (showLoader) {
    return <PageLoader isLoading={true} />;
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
        {/* ===== Sticky top area: Header + Breadcrumb ===== */}
        <div
          className="fixed top-0 right-0 z-20 bg-white border-b shadow-sm"
          style={{ left: sidebarWidth, transition: 'left 300ms' }}
        >
          <UnifiedHeader
            onMenuClick={() => setIsSidebarOpen(true)}
            sidebarWidth={sidebarWidth}
          />

          {/* Breadcrumb pinned directly below the header */}
          <div className="px-4 py-2 sm:px-6 lg:px-8 border-t border-gray-100">
            <Breadcrumb />
          </div>
        </div>

        {/* ===== Main content — offset for header + breadcrumb bar ===== */}
        <main className="flex-1" style={{ paddingTop: '96px' }}>
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}