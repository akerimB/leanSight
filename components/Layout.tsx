'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import { Box, CircularProgress } from '@mui/material';

function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname?.startsWith('/auth/');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && !isAuthPage) {
      router.push('/auth/signin');
    } else if (session && isAuthPage) {
      router.push('/dashboard');
    }
  }, [session, status, isAuthPage, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session && !isAuthPage) return null;

  return <>{children}</>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <SessionProvider>
      <AuthCheck>
        {isAuthPage ? children : <DashboardSidebar>{children}</DashboardSidebar>}
      </AuthCheck>
    </SessionProvider>
  );
} 