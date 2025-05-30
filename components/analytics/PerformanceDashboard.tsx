'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid as MuiGrid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface PerformanceMetrics {
  overallScore: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: 'up' | 'down' | 'flat';
    target: number;
  };
  assessmentCount: {
    total: number;
    completed: number;
    inProgress: number;
    draft: number;
    completionRate: number;
  };
  dimensionPerformance: Array<{
    id: string;
    name: string;
    score: number;
    change: number;
    rank: number;
    isTopPerformer: boolean;
    isRiskArea: boolean;
  }>;
  sectorBenchmark: {
    userScore: number;
    sectorAverage: number;
    percentile: number;
    rank: number;
    totalCompanies: number;
  };
  timeToCompletion: {
    average: number;
    fastest: number;
    slowest: number;
    unit: 'days' | 'hours';
  };
  engagement: {
    activeUsers: number;
    totalUsers: number;
    engagementRate: number;
    lastActivity: string;
  };
}

interface PerformanceDashboardProps {
  companyId?: string;
  departmentId?: string;
  sectorId?: string;
  timeRange?: string;
  onRefresh?: () => void;
}

const Grid = MuiGrid as any; // Temporary type assertion to fix the TypeScript error

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  companyId,
  departmentId,
  sectorId,
  timeRange = 'last30days',
  onRefresh
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ timeRange });
      if (companyId) params.append('companyId', companyId);
      if (departmentId) params.append('departmentId', departmentId);
      if (sectorId) params.append('sectorId', sectorId);

      const response = await fetch(`/api/analytics/performance-metrics?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Performance metrics error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [companyId, departmentId, sectorId, timeRange]);

  const renderTrendIcon = (trend: 'up' | 'down' | 'flat', size: 'small' | 'medium' = 'small') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" fontSize={size} />;
      case 'down':
        return <TrendingDownIcon color="error" fontSize={size} />;
      default:
        return <TrendingFlatIcon color="action" fontSize={size} />;
    }
  };

  const getScoreColor = (score: number): 'error' | 'warning' | 'success' | 'primary' => {
    if (score >= 4.0) return 'success';
    if (score >= 3.0) return 'primary';
    if (score >= 2.0) return 'warning';
    return 'error';
  };

  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 90) return '#4caf50'; // Green
    if (percentile >= 75) return '#8bc34a'; // Light green
    if (percentile >= 50) return '#ff9800'; // Orange
    if (percentile >= 25) return '#f44336'; // Red
    return '#d32f2f'; // Dark red
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={48} />
                  <Skeleton variant="rectangular" width="100%" height={8} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchMetrics}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!metrics) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon />
          Performance Dashboard
        </Typography>
        <IconButton onClick={onRefresh || fetchMetrics} size="small">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Overall Score Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">Overall Score</Typography>
                  <Typography variant="h3" color={getScoreColor(metrics.overallScore.current)}>
                    {metrics.overallScore.current.toFixed(1)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  {renderTrendIcon(metrics.overallScore.trend, 'medium')}
                  <Typography variant="body2" color={metrics.overallScore.change >= 0 ? 'success.main' : 'error.main'}>
                    {metrics.overallScore.change >= 0 ? '+' : ''}{metrics.overallScore.change.toFixed(2)}
                    ({metrics.overallScore.changePercent >= 0 ? '+' : ''}{metrics.overallScore.changePercent.toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(metrics.overallScore.current / 5) * 100}
                sx={{ mb: 1, height: 8, borderRadius: 4 }}
                color={getScoreColor(metrics.overallScore.current)}
              />
              <Typography variant="caption" color="text.secondary">
                Target: {metrics.overallScore.target.toFixed(1)} / 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assessment Progress Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">Assessment Progress</Typography>
                  <Typography variant="h3">
                    {metrics.assessmentCount.completed}/{metrics.assessmentCount.total}
                  </Typography>
                </Box>
                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.assessmentCount.completionRate}
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${metrics.assessmentCount.completed} Completed`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`${metrics.assessmentCount.inProgress} In Progress`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  label={`${metrics.assessmentCount.draft} Draft`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sector Benchmark Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">Sector Ranking</Typography>
                  <Typography variant="h3">
                    #{metrics.sectorBenchmark.rank}
                  </Typography>
                </Box>
                <TrophyIcon sx={{ fontSize: 40, color: getPercentileColor(metrics.sectorBenchmark.percentile) }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {metrics.sectorBenchmark.percentile.toFixed(0)}th percentile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your Score: {metrics.sectorBenchmark.userScore.toFixed(1)} vs Sector Avg: {metrics.sectorBenchmark.sectorAverage.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Out of {metrics.sectorBenchmark.totalCompanies} companies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Time to Completion Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">Avg. Completion Time</Typography>
                  <Typography variant="h3">
                    {metrics.timeToCompletion.average.toFixed(0)}
                    <Typography component="span" variant="h6" color="text.secondary">
                      {metrics.timeToCompletion.unit}
                    </Typography>
                  </Typography>
                </Box>
                <ScheduleIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" color="success.main">
                Fastest: {metrics.timeToCompletion.fastest.toFixed(0)} {metrics.timeToCompletion.unit}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Slowest: {metrics.timeToCompletion.slowest.toFixed(0)} {metrics.timeToCompletion.unit}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* User Engagement Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">User Engagement</Typography>
                  <Typography variant="h3">
                    {metrics.engagement.engagementRate.toFixed(0)}%
                  </Typography>
                </Box>
                <GroupIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {metrics.engagement.activeUsers} / {metrics.engagement.totalUsers} active users
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last activity: {new Date(metrics.engagement.lastActivity).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Dimension Performance Overview */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Dimension Performance
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {metrics.dimensionPerformance.slice(0, 5).map((dimension, index) => (
                  <Box key={dimension.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                        {dimension.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {dimension.score.toFixed(1)}
                        </Typography>
                        {dimension.isTopPerformer && <CheckCircleIcon color="success" fontSize="small" />}
                        {dimension.isRiskArea && <WarningIcon color="error" fontSize="small" />}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(dimension.score / 5) * 100}
                      sx={{ height: 4, borderRadius: 2 }}
                      color={getScoreColor(dimension.score)}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceDashboard; 