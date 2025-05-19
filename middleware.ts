import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/companies/:path*',
    '/assessment/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/companies/:path*',
    '/api/dashboard/:path*',
  ]
}; 