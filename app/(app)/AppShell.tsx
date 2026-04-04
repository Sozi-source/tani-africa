'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from '@/components/layout/Sidebar';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { PageLoader } from '@/components/ui/PageLoader';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

import { useAuth } from '@/context/AuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { initializing } = useAuth();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= Responsive ================= */

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ================= Initial Load ================= */

  useEffect(() => {
    if (!initializing) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [initializing]);

  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) return <>{children}</>;

  const sidebarWidth = isMobile ? 0 : isSidebarCollapsed ? 72 : 280;

  return (
    <>
      <PageLoader isLoading={isLoading} />

      <div className={`min-h-screen bg-gray-50 ${isLoading ? 'hidden' : 'block'}`}>
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
    </>
  );
}