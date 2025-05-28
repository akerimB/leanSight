'use client';

import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useSession, signOut } from 'next-auth/react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Authentication Test Page</Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1">Authentication Status:</Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 'bold', 
              color: status === 'authenticated' ? 'success.main' : 'error.main' 
            }}
          >
            {status === 'loading' ? 'Loading...' : status === 'authenticated' ? 'Authenticated' : 'Not Authenticated'}
          </Typography>
        </Box>

        {session && (
          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1">User Information:</Typography>
            <Typography>Name: {session.user?.name || 'Not available'}</Typography>
            <Typography>Email: {session.user?.email || 'Not available'}</Typography>
            <Typography>Role: {session.user?.role || 'Not available'}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {session ? (
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/auth/signin'}
            >
              Sign In
            </Button>
          )}
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 