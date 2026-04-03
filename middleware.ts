// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('user_role')?.value;

  // Redirect /dashboard to role-specific page
  if (pathname === '/dashboard') {
    if (!role) return NextResponse.redirect(new URL('/auth/login', request.url));
    if (role === 'ADMIN')  return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    if (role === 'DRIVER') return NextResponse.redirect(new URL('/dashboard/driver', request.url));
    if (role === 'CLIENT') return NextResponse.redirect(new URL('/dashboard/client', request.url));
  }

  // Protect all dashboard routes from unauthenticated users
  if (pathname.startsWith('/dashboard') && !role) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};