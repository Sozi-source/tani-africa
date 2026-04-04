'use client';

import type { ReactNode } from 'react';
import AppShell from '@/app/(app)/AppShell';

/**
 * Layout for all routes inside the (app) group.
 * 
 * This includes:
 *  - /dashboard/*
 *  - /jobs
 *  - /jobs/[id]
 *  - any other logged-in application pages
 *
 * The AppShell handles:
 *  - Sidebar
 *  - UnifiedHeader
 *  - Breadcrumbs
 *  - Footer
 *  - PageLoader
 *  - Auth-page exclusion logic
 */

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}