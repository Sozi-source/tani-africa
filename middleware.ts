// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Read role cookie defensively
  const roleCookie = request.cookies.get('user_role');
  const role = roleCookie?.value as 'ADMIN' | 'DRIVER' | 'CLIENT' | undefined;
  const isAuthenticated = Boolean(role);

  /* ================= AUTH ROUTES ================= */

  // ✅ All auth routes are PUBLIC
  if (pathname.startsWith('/auth')) {
    // Logged‑in users should never see auth pages
    if (isAuthenticated) {
      return redirectToDashboard(role, request);
    }
    return NextResponse.next();
  }

  /* ================= ROOT (/) ================= */

  // ✅ ROOT IS NOW PROTECTED
  if (pathname === '/') {
    if (!isAuthenticated) {
      return redirectToLogin(request);
    }
    return redirectToDashboard(role, request);
  }

  /* ================= DASHBOARD BASE ================= */

  if (pathname === '/dashboard') {
    if (!isAuthenticated) {
      return redirectToLogin(request);
    }
    return redirectToDashboard(role, request);
  }

  /* ================= DASHBOARD PROTECTION ================= */

  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return redirectToLogin(request, pathname);
    }

    // ✅ Role‑safe access control
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return redirectToDashboard(role, request);
    }

    if (
      pathname.startsWith('/dashboard/driver') &&
      role !== 'DRIVER' &&
      role !== 'ADMIN'
    ) {
      return redirectToDashboard(role, request);
    }

    if (
      pathname.startsWith('/dashboard/client') &&
      role !== 'CLIENT' &&
      role !== 'ADMIN'
    ) {
      return redirectToDashboard(role, request);
    }
  }

  return NextResponse.next();
}

/* ================= HELPERS ================= */

function redirectToLogin(request: NextRequest, from?: string) {
  const url = new URL('/auth/login', request.url);
  if (from) {
    url.searchParams.set('redirect', from);
  }
  return NextResponse.redirect(url);
}

function redirectToDashboard(
  role: 'ADMIN' | 'DRIVER' | 'CLIENT' | undefined,
  request: NextRequest
) {
  // ✅ Safe fallback
  if (!role) {
    return redirectToLogin(request);
  }

  return NextResponse.redirect(
    new URL(`/dashboard/${role.toLowerCase()}`, request.url)
  );
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/:path*'],
};