'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import { Box, CircularProgress } from '@mui/material';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname?.startsWith('/auth/');
  const isPublicPage = isAuthPage || pathname === '/';

  useEffect(() => {
    if (status === 'loading') return;
    
    // Redirect to login if not authenticated and not on an auth page
    if (!session && !isPublicPage) {
      router.push('/auth/signin');
    } 
    // Redirect to dashboard if authenticated but on an auth page
    else if (session && isAuthPage) {
      router.push('/dashboard');
    }
  }, [session, status, isPublicPage, isAuthPage, router]);

  // Show loading spinner during auth check
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Don't render anything if not authenticated and not on a public page
  // This prevents showing the protected content briefly before redirecting
  if (!session && !isPublicPage) {
    return null;
  }

  // Use sidebar for authenticated non-auth pages, regular layout for auth pages
  return isPublicPage ? (
    <>{children}</>
  ) : (
    <DashboardSidebar>{children}</DashboardSidebar>
  );
} 