import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '@prisma/client';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/api/auth',
  '/test-auth',
];

// Paths that require admin access
const ADMIN_PATHS = [
  '/admin',
  '/api/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Also allow API routes that don't need auth (like public API endpoints)
  const isPublicApiRoute = pathname.startsWith('/api/') && 
    !pathname.startsWith('/api/assessments') && 
    !pathname.startsWith('/api/admin');
    
  // Skip auth check for public paths, static files, and public API routes
  if (
    isPublicPath || 
    isPublicApiRoute ||
    pathname.startsWith('/_next/') || 
    pathname.includes('favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  // Get the token and verify authentication
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If no token, redirect to sign-in page
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for admin paths
  const isAdminPath = ADMIN_PATHS.some(path => 
    pathname.startsWith(path)
  );

  if (isAdminPath && token.role !== Role.ADMIN) {
    // Redirect non-admin users trying to access admin routes
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // User is authenticated, proceed with the request
  return NextResponse.next();
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image).*)',
  ],
} 