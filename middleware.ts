// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get role from cookie
  const role = request.cookies.get('user_role')?.value;
  const isAuthenticated = !!role;
  
  // Public paths that don't require auth
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Redirect root to appropriate dashboard if authenticated
  if (pathname === '/') {
    if (isAuthenticated) {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      if (role === 'DRIVER') return NextResponse.redirect(new URL('/dashboard/driver', request.url));
      if (role === 'CLIENT') return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
    return NextResponse.next();
  }
  
  // Redirect /dashboard to role-specific page
  if (pathname === '/dashboard') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    if (role === 'DRIVER') return NextResponse.redirect(new URL('/dashboard/driver', request.url));
    if (role === 'CLIENT') return NextResponse.redirect(new URL('/dashboard/client', request.url));
  }
  
  // Protect all dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Role-based access control for specific dashboard routes
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/dashboard/${role?.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith('/dashboard/driver') && role !== 'DRIVER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
    if (pathname.startsWith('/dashboard/client') && role !== 'CLIENT' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/driver', request.url));
    }
  }
  
  // Redirect authenticated users away from login page
  if (isPublicPath && isAuthenticated) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    if (role === 'DRIVER') return NextResponse.redirect(new URL('/dashboard/driver', request.url));
    if (role === 'CLIENT') return NextResponse.redirect(new URL('/dashboard/client', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/dashboard/:path*', '/auth/:path*'],
};