'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { signIn } from 'next-auth/react';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // If user manually navigates to this page, redirect to sign in after a short delay
    const timer = setTimeout(() => {
      router.push('/auth/signin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          You have been signed out
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Thank you for using LeanSight. You have been successfully signed out.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
          >
            Sign back in
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 