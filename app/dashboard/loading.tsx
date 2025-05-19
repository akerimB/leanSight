import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function DashboardLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );
} 