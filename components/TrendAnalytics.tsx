'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid as MuiGrid,
  Paper,
  Chip,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import RadarIcon from '@mui/icons-material/Radar';

interface TrendData {
  period: string;
  avgScore: number;
  assessmentCount: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
}

interface DimensionTrendData {
  dimensionId: string;
  dimensionName: string;
  data: Array<{ period: string; score: number }>;
  latestScore: number;
}

interface CategoryTrendData {
  categoryId: string;
  categoryName: string;
  data: Array<{ period: string; score: number }>;
  latestScore: number;
}

interface TrendAnalyticsData {
  periodType: string;
  periodsBack: number;
  overallTrend: TrendData[];
  dimensionTrends: DimensionTrendData[];
  categoryTrends: CategoryTrendData[];
  summary: {
    totalPeriods: number;
    avgScoreRange: { min: number; max: number };
    totalAssessments: number;
  };
}

interface TrendAnalyticsProps {
  companyId?: string;
  departmentId?: string;
  sectorId?: string;
}

const Grid = MuiGrid as any; // Temporary type assertion to fix the TypeScript error

const TrendAnalytics: React.FC<TrendAnalyticsProps> = ({ companyId, departmentId, sectorId }) => {
  const [data, setData] = useState<TrendAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [periodsBack, setPeriodsBack] = useState(12);
  const [chartType, setChartType] = useState<'line' | 'area' | 'combined' | 'radar'>('line');
  const [showMetrics, setShowMetrics] = useState(true);

  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        periodType,
        periodsBack: periodsBack.toString(),
      });

      if (sectorId) params.append('sectorId', sectorId);
      if (companyId) params.append('companyId', companyId);
      if (departmentId) params.append('departmentId', departmentId);

      const response = await fetch(`/api/analytics/trends?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trend data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Trend analytics error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendData();
  }, [periodType, periodsBack, companyId, departmentId, sectorId]);

  const renderTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" fontSize="small" />;
      case 'down':
        return <TrendingDownIcon color="error" fontSize="small" />;
      default:
        return <TrendingFlatIcon color="action" fontSize="small" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  const renderOverallTrendChart = () => {
    if (!data?.overallTrend) return null;

    const chartData = data.overallTrend.map(item => ({
      period: item.period,
      avgScore: item.avgScore,
      assessmentCount: item.assessmentCount,
      change: item.change
    }));

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 5]} />
              <RechartsTooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'avgScore' ? 'Average Score' : 'Assessments'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#1976d2" 
                fill="#1976d2" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'combined':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="score" domain={[0, 5]} />
              <YAxis yAxisId="count" orientation="right" />
              <RechartsTooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'avgScore' ? 'Average Score' : 'Assessment Count'
                ]}
              />
              <Bar yAxisId="count" dataKey="assessmentCount" fill="#e3f2fd" opacity={0.7} />
              <Line yAxisId="score" type="monotone" dataKey="avgScore" stroke="#1976d2" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'radar':
        // For radar chart, use latest period data for categories
        const radarData = data.categoryTrends.map(cat => ({
          category: cat.categoryName,
          score: cat.latestScore
        }));
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis domain={[0, 5]} />
              <Radar name="Score" dataKey="score" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 5]} />
              <RechartsTooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name === 'avgScore' ? 'Average Score' : 'Assessments'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#1976d2" 
                strokeWidth={3}
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderDimensionTrends = () => {
    if (!data?.dimensionTrends) return null;

    // Prepare data for multi-line chart
    const periods = data.overallTrend.map(item => item.period);
    const chartData = periods.map(period => {
      const dataPoint: any = { period };
      data.dimensionTrends.forEach(dim => {
        const scoreData = dim.data.find(d => d.period === period);
        dataPoint[dim.dimensionName] = scoreData?.score || 0;
      });
      return dataPoint;
    });

    const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis domain={[0, 5]} />
          <RechartsTooltip 
            formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Score']}
          />
          {data.dimensionTrends.map((dim, index) => (
            <Line
              key={dim.dimensionId}
              type="monotone"
              dataKey={dim.dimensionName}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchTrendData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">
        No trend data available. Complete more assessments to see trends.
      </Alert>
    );
  }

  const latestPeriod = data.overallTrend[data.overallTrend.length - 1];
  const previousPeriod = data.overallTrend[data.overallTrend.length - 2];

  return (
    <Box sx={{ p: 3 }}>
      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period Type</InputLabel>
          <Select
            value={periodType}
            label="Period Type"
            onChange={(e) => setPeriodType(e.target.value as any)}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="quarterly">Quarterly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Periods Back</InputLabel>
          <Select
            value={periodsBack}
            label="Periods Back"
            onChange={(e) => setPeriodsBack(Number(e.target.value))}
          >
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={24}>24</MenuItem>
            <MenuItem value={36}>36</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, newType) => newType && setChartType(newType)}
          size="small"
        >
          <ToggleButton value="line">
            <Tooltip title="Line Chart">
              <TimelineIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="area">
            <Tooltip title="Area Chart">
              <BarChartIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="combined">
            <Tooltip title="Combined Chart">
              <CompareArrowsIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="radar">
            <Tooltip title="Radar Chart">
              <RadarIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Summary Metrics */}
      {showMetrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">
                    {latestPeriod?.avgScore.toFixed(1) || 'N/A'}
                  </Typography>
                  {renderTrendIcon(latestPeriod?.trend || 'flat')}
                </Box>
                {previousPeriod && (
                  <Chip
                    label={`${latestPeriod.change > 0 ? '+' : ''}${latestPeriod.change.toFixed(2)}`}
                    color={getChangeColor(latestPeriod.change)}
                    size="small"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Score Range
                </Typography>
                <Typography variant="h4">
                  {data.summary.avgScoreRange.min.toFixed(1)} - {data.summary.avgScoreRange.max.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Min - Max over {data.summary.totalPeriods} periods
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Assessments
                </Typography>
                <Typography variant="h4">
                  {data.summary.totalAssessments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all periods
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Latest Period
                </Typography>
                <Typography variant="h4">
                  {latestPeriod?.assessmentCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assessments in {latestPeriod?.period}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Maturity Trend
            </Typography>
            {renderOverallTrendChart()}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Dimensions (Latest Scores)
            </Typography>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {data.dimensionTrends.map((dim, index) => (
                <Box key={dim.dimensionId} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {index + 1}. {dim.dimensionName}
                    </Typography>
                    <Chip 
                      label={dim.latestScore.toFixed(1)} 
                      size="small" 
                      color={dim.latestScore >= 3 ? 'success' : dim.latestScore >= 2 ? 'warning' : 'error'}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dimension Performance Over Time
            </Typography>
            {renderDimensionTrends()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrendAnalytics; 