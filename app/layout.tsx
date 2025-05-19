'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import DashboardSidebar from '../components/DashboardSidebar';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

const inter = Inter({ subsets: ['latin'] });

function AuthCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname?.startsWith('/auth/');
  const isPublicPage = isAuthPage;

  useEffect(() => {
    if (status === 'loading') return;

    if (!session && !isPublicPage) {
      router.push('/auth/signin');
    } else if (session && isAuthPage) {
      router.push('/dashboard');
    }
  }, [session, status, isPublicPage, isAuthPage, router]);

  if (status === 'loading') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <html lang="en" className={inter.className}>
      <body style={{ margin: 0 }}>
        <SessionProvider>
          <AuthCheck>
            {isAuthPage ? (
              children
            ) : (
              <DashboardSidebar>{children}</DashboardSidebar>
            )}
          </AuthCheck>
        </SessionProvider>
      </body>
    </html>
  );
}
