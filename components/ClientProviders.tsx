'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import NavBar from '@/components/NavBar';
import theme from '@/lib/theme';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster richColors position="top-right" />
        <NavBar />
        <main>{children}</main>
      </ThemeProvider>
    </SessionProvider>
  );
} 