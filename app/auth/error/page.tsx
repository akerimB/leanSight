'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params?.get('error') ?? undefined;

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Authentication Error
      </Typography>
      <Typography variant="body1" gutterBottom>
        {error || 'An unknown error occurred.'}
      </Typography>
      <Button variant="contained" href="/auth/signin">
        Go to Sign In
      </Button>
    </Box>
  );
} 