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

  // ✅ Auth routes are public
  if (pathname.startsWith('/auth')) {
    // Logged‑in users should not see login/register pages
    if (isAuthenticated) {
      return redirectToDashboard(role, request);
    }
    return NextResponse.next();
  }

  /* ================= PUBLIC ROOT (/) ================= */

  // ✅ ROOT IS PUBLIC
  if (pathname === '/') {
    // Optional: redirect authenticated users to dashboard
    if (isAuthenticated) {
      return redirectToDashboard(role, request);
    }
    return NextResponse.next(); // ✅ allow landing page
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

    // ✅ Role‑based access control
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