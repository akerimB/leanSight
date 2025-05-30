'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Paper, Container, CircularProgress } from '@mui/material';
import Logo from '@/components/Logo';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, show the welcome page
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Logo size="large" showText={true} />
        </Box>
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
          Welcome to LeanSight
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          A comprehensive maturity assessment platform
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Typography paragraph>
            LeanSight helps organizations assess their maturity levels across various dimensions,
            track progress, and identify areas for improvement.
          </Typography>
          <Typography paragraph>
            Please sign in to access your dashboard and assessments.
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          size="large"
          onClick={() => router.push('/auth/signin')}
          sx={{ minWidth: 200 }}
        >
          Sign In
        </Button>
      </Paper>
    </Container>
  );
} 