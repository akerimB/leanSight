import React from 'react';
import { Box, Skeleton, Paper, Grid } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'form' | 'list' | 'dashboard';
  rows?: number;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

export default function LoadingSkeleton({ 
  variant = 'card', 
  rows = 3, 
  height = 200,
  animation = 'wave'
}: LoadingSkeletonProps) {
  
  const renderCardSkeleton = () => (
    <Paper sx={{ p: 2, height }}>
      <Skeleton variant="text" width="60%" height={32} animation={animation} />
      <Skeleton variant="rectangular" width="100%" height="70%" sx={{ mt: 1 }} animation={animation} />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
        <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
      </Box>
    </Paper>
  );

  const renderTableSkeleton = () => (
    <Paper sx={{ p: 2 }}>
      {/* Table header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" width="20%" height={24} animation={animation} />
        ))}
      </Box>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: 4 }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="20%" height={20} animation={animation} />
          ))}
        </Box>
      ))}
    </Paper>
  );

  const renderChartSkeleton = () => (
    <Paper sx={{ p: 2, height }}>
      <Skeleton variant="text" width="40%" height={32} animation={animation} />
      <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, mt: 2, height: '80%' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            width="15%" 
            height={`${Math.random() * 60 + 40}%`}
            animation={animation}
          />
        ))}
      </Box>
    </Paper>
  );

  const renderFormSkeleton = () => (
    <Paper sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} animation={animation} />
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} animation={animation} />
          <Skeleton variant="rectangular" width="100%" height={56} animation={animation} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Skeleton variant="rectangular" width={100} height={36} animation={animation} />
        <Skeleton variant="rectangular" width={100} height={36} animation={animation} />
      </Box>
    </Paper>
  );

  const renderListSkeleton = () => (
    <Paper sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} animation={animation} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} animation={animation} />
            <Skeleton variant="text" width="40%" height={16} animation={animation} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
        </Box>
      ))}
    </Paper>
  );

  const renderDashboardSkeleton = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="30%" height={40} animation={animation} />
        <Skeleton variant="text" width="50%" height={20} animation={animation} />
      </Box>
      
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={150} height={56} animation={animation} />
        ))}
      </Box>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid size={{ xs: 12, md: 6 }} key={i}>
            {renderChartSkeleton()}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  switch (variant) {
    case 'table':
      return renderTableSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    default:
      return renderCardSkeleton();
  }
}

// Specialized skeleton components for common use cases
export const ChartSkeleton = ({ height = 340 }: { height?: number | string }) => (
  <LoadingSkeleton variant="chart" height={height} />
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <LoadingSkeleton variant="table" rows={rows} />
);

export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <LoadingSkeleton variant="form" rows={fields} />
);

export const DashboardSkeleton = () => (
  <LoadingSkeleton variant="dashboard" />
); 