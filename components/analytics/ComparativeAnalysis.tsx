'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid as MuiGrid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Badge
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Line
} from 'recharts';
import {
  Compare as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

const Grid = MuiGrid as any;

interface CompanyComparison {
  id: string;
  name: string;
  sector: string;
  overallScore: number;
  dimensionScores: Array<{
    dimensionId: string;
    dimensionName: string;
    score: number;
    rank: number;
  }>;
  rank: number;
  percentile: number;
  assessmentCount: number;
  isCurrentUser: boolean;
}

interface SectorBenchmark {
  sectorId: string;
  sectorName: string;
  averageScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  companyCount: number;
  topPerformers: Array<{
    companyId: string;
    companyName: string;
    score: number;
  }>;
}

interface DimensionBenchmark {
  dimensionId: string;
  dimensionName: string;
  userScore: number;
  sectorAverage: number;
  industryAverage: number;
  bestInClass: number;
  percentile: number;
  gap: number;
  trend: 'up' | 'down' | 'flat';
}

interface ComparativeAnalysisData {
  userCompany: CompanyComparison;
  peerComparisons: CompanyComparison[];
  sectorBenchmarks: SectorBenchmark[];
  dimensionBenchmarks: DimensionBenchmark[];
  radarData: Array<{
    dimension: string;
    userScore: number;
    sectorAverage: number;
    industryAverage: number;
    bestInClass: number;
  }>;
}

interface ComparativeAnalysisProps {
  companyId?: string;
  sectorId?: string;
  timeRange?: string;
  onRefresh?: () => void;
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  companyId,
  sectorId,
  timeRange = 'last30days',
  onRefresh
}) => {
  const [data, setData] = useState<ComparativeAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'overview' | 'detailed' | 'radar'>('overview');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [comparisonType, setComparisonType] = useState<'peer' | 'sector' | 'industry'>('peer');

  const fetchComparativeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ 
        timeRange,
        comparisonType,
        viewType
      });
      if (companyId) params.append('companyId', companyId);
      if (sectorId && sectorId !== 'all') params.append('sectorId', sectorId);
      if (selectedSector !== 'all') params.append('targetSector', selectedSector);

      const response = await fetch(`/api/analytics/comparative-analysis?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparative analysis data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Comparative analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparativeData();
  }, [companyId, sectorId, timeRange, comparisonType, selectedSector, viewType]);

  const getScoreColor = (score: number): string => {
    if (score >= 4.0) return '#4caf50';
    if (score >= 3.0) return '#2196f3';
    if (score >= 2.0) return '#ff9800';
    return '#f44336';
  };

  const getPerformanceIndicator = (percentile: number) => {
    if (percentile >= 90) return { label: 'Excellent', color: '#4caf50' };
    if (percentile >= 75) return { label: 'Good', color: '#8bc34a' };
    if (percentile >= 50) return { label: 'Average', color: '#ff9800' };
    if (percentile >= 25) return { label: 'Below Average', color: '#f44336' };
    return { label: 'Needs Improvement', color: '#d32f2f' };
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="rectangular" width="100%" height={200} />
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
        <IconButton color="inherit" size="small" onClick={fetchComparativeData}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  const renderOverviewCards = () => (
    <Grid container spacing={3}>
      {/* Current Position Card */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Your Position</Typography>
                <Typography variant="h3" color="primary">
                  #{data.userCompany.rank}
                </Typography>
              </Box>
              <TrophyIcon sx={{ fontSize: 40, color: getPerformanceIndicator(data.userCompany.percentile).color }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {getPerformanceIndicator(data.userCompany.percentile).label} - {data.userCompany.percentile.toFixed(0)}th percentile
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Score: {data.userCompany.overallScore.toFixed(1)}/5.0
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Sector Performance */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Sector Average</Typography>
                <Typography variant="h3">
                  {data.sectorBenchmarks[0]?.averageScore.toFixed(1) || 'N/A'}
                </Typography>
              </Box>
              <BusinessIcon color="info" sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color={data.userCompany.overallScore > (data.sectorBenchmarks[0]?.averageScore || 0) ? 'success.main' : 'error.main'}>
                {data.userCompany.overallScore > (data.sectorBenchmarks[0]?.averageScore || 0) ? '+' : ''}
                {(data.userCompany.overallScore - (data.sectorBenchmarks[0]?.averageScore || 0)).toFixed(2)}
              </Typography>
              {data.userCompany.overallScore > (data.sectorBenchmarks[0]?.averageScore || 0) ? 
                <TrendingUpIcon color="success" fontSize="small" /> : 
                <TrendingDownIcon color="error" fontSize="small" />
              }
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Performer Gap */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Gap to Top Performer
            </Typography>
            {data.sectorBenchmarks[0]?.topPerformers[0] && (
              <>
                <Typography variant="h3" color="warning.main">
                  {(data.sectorBenchmarks[0].topPerformers[0].score - data.userCompany.overallScore).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Leader: {data.sectorBenchmarks[0].topPerformers[0].companyName} ({data.sectorBenchmarks[0].topPerformers[0].score.toFixed(1)})
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Peer Companies */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Peer Comparison
            </Typography>
            <Typography variant="h3">
              {data.peerComparisons.filter(p => p.overallScore < data.userCompany.overallScore).length}/{data.peerComparisons.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Outperforming peers
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDetailedComparison = () => (
    <Grid container spacing={3}>
      {/* Peer Comparison Table */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Peer Company Comparison</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell align="center">Overall Score</TableCell>
                    <TableCell align="center">Rank</TableCell>
                    <TableCell align="center">Assessments</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[data.userCompany, ...data.peerComparisons]
                    .sort((a, b) => b.overallScore - a.overallScore)
                    .map((company, index) => (
                    <TableRow key={company.id} sx={{ backgroundColor: company.isCurrentUser ? 'action.selected' : 'inherit' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {company.isCurrentUser && <Badge badgeContent="You" color="primary" />}
                          <Typography variant="body2" fontWeight={company.isCurrentUser ? 'bold' : 'normal'}>
                            {company.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold" color={getScoreColor(company.overallScore)}>
                            {company.overallScore.toFixed(1)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(company.overallScore / 5) * 100}
                            sx={{ width: 50, height: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={index === 0 ? 'success' : index < 3 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">{company.assessmentCount}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getPerformanceIndicator(company.percentile).label}
                          size="small"
                          sx={{ backgroundColor: getPerformanceIndicator(company.percentile).color, color: 'white' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Dimension Benchmarks */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Dimension Benchmarks</Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {data.dimensionBenchmarks.map((dimension) => (
                <Box key={dimension.dimensionId} sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight="bold" noWrap>
                    {dimension.dimensionName}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      You: {dimension.userScore.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sector: {dimension.sectorAverage.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Best: {dimension.bestInClass.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(dimension.userScore / 5) * 100}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      color="primary"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={(dimension.sectorAverage / 5) * 100}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      color="secondary"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={(dimension.bestInClass / 5) * 100}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      color="success"
                    />
                  </Box>
                  <Typography variant="caption" color={dimension.gap < 0 ? 'success.main' : 'error.main'}>
                    Gap to sector: {dimension.gap >= 0 ? '+' : ''}{dimension.gap.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRadarAnalysis = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Multi-Level Comparison</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={data.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 8 }} />
                <Radar
                  name="Your Score"
                  dataKey="userScore"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Sector Average"
                  dataKey="sectorAverage"
                  stroke="#ff9800"
                  fill="#ff9800"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Industry Average"
                  dataKey="industryAverage"
                  stroke="#9c27b0"
                  fill="#9c27b0"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Best in Class"
                  dataKey="bestInClass"
                  stroke="#4caf50"
                  fill="#4caf50"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Key Insights</Typography>
            <Stack spacing={2}>
              {data.dimensionBenchmarks
                .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
                .slice(0, 5)
                .map((dimension) => (
                <Box key={dimension.dimensionId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                      {dimension.dimensionName}
                    </Typography>
                    <Chip
                      label={dimension.gap >= 0 ? 'Above' : 'Below'}
                      size="small"
                      color={dimension.gap >= 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {Math.abs(dimension.gap).toFixed(2)} points {dimension.gap >= 0 ? 'above' : 'below'} sector average
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareIcon />
          Comparative Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Comparison</InputLabel>
            <Select
              value={comparisonType}
              label="Comparison"
              onChange={(e) => setComparisonType(e.target.value as 'peer' | 'sector' | 'industry')}
            >
              <MenuItem value="peer">Peer Companies</MenuItem>
              <MenuItem value="sector">Sector</MenuItem>
              <MenuItem value="industry">Industry</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(_, newValue) => newValue && setViewType(newValue)}
            size="small"
          >
            <ToggleButton value="overview">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="detailed">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="radar">
              <AnalyticsIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={onRefresh || fetchComparativeData} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {viewType === 'overview' && renderOverviewCards()}
      {viewType === 'detailed' && renderDetailedComparison()}
      {viewType === 'radar' && renderRadarAnalysis()}
    </Box>
  );
};

export default ComparativeAnalysis; 