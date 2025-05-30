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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Avatar
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  TrendingDown as GapIcon,
  PriorityHigh as HighPriorityIcon,
  Warning as MediumPriorityIcon,
  Info as LowPriorityIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Assignment as PendingIcon,
  Speed as ImpactIcon,
  Build as EffortIcon,
  Timeline as TimelineIcon,
  Star as OpportunityIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Lightbulb as InsightIcon,
  TrendingUp as ImprovementIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const Grid = MuiGrid as any;

interface Gap {
  id: string;
  dimensionId: string;
  dimensionName: string;
  categoryId?: string;
  categoryName?: string;
  currentScore: number;
  targetScore: number;
  benchmarkScore: number;
  gapSize: number;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'in_progress' | 'completed';
  description: string;
  recommendations: string[];
  timeToImprove: number; // in months
  costEstimate?: number;
}

interface ImprovementOpportunity {
  id: string;
  title: string;
  description: string;
  type: 'quick_win' | 'strategic' | 'transformational';
  affectedDimensions: string[];
  potentialImpact: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  resources: string[];
  timeline: string;
  expectedROI?: number;
}

interface GapAnalysisData {
  gaps: Gap[];
  improvementOpportunities: ImprovementOpportunity[];
  priorityMatrix: Array<{
    dimensionName: string;
    impact: number;
    effort: number;
    category: 'quick_wins' | 'major_projects' | 'fill_ins' | 'thankless_tasks';
  }>;
  gapSummary: {
    totalGaps: number;
    highPriorityGaps: number;
    averageGapSize: number;
    totalPotentialImprovement: number;
    estimatedTimeToClose: number;
  };
  progressTracking: Array<{
    period: string;
    gapsIdentified: number;
    gapsInProgress: number;
    gapsCompleted: number;
  }>;
}

interface GapAnalysisProps {
  companyId?: string;
  departmentId?: string;
  sectorId?: string;
  timeRange?: string;
  onRefresh?: () => void;
}

const COLORS = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  quick_win: '#4caf50',
  strategic: '#2196f3',
  transformational: '#9c27b0'
};

const GapAnalysis: React.FC<GapAnalysisProps> = ({
  companyId,
  departmentId,
  sectorId,
  timeRange = 'last30days',
  onRefresh
}) => {
  const [data, setData] = useState<GapAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewType, setViewType] = useState<'gaps' | 'opportunities' | 'matrix'>('gaps');

  const fetchGapAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ 
        timeRange,
        filterPriority: filterPriority !== 'all' ? filterPriority : '',
        filterStatus: filterStatus !== 'all' ? filterStatus : ''
      });
      if (companyId) params.append('companyId', companyId);
      if (departmentId) params.append('departmentId', departmentId);
      if (sectorId) params.append('sectorId', sectorId);

      const response = await fetch(`/api/analytics/gap-analysis?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gap analysis data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Gap analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis();
  }, [companyId, departmentId, sectorId, timeRange, filterPriority, filterStatus]);

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <HighPriorityIcon sx={{ color: COLORS.high }} />;
      case 'medium':
        return <MediumPriorityIcon sx={{ color: COLORS.medium }} />;
      default:
        return <LowPriorityIcon sx={{ color: COLORS.low }} />;
    }
  };

  const getStatusIcon = (status: 'identified' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in_progress':
        return <InProgressIcon color="warning" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getEffortLevel = (effort: 'low' | 'medium' | 'high') => {
    const levels = { low: 1, medium: 2, high: 3 };
    return levels[effort];
  };

  const getImpactLevel = (impact: 'low' | 'medium' | 'high') => {
    const levels = { low: 1, medium: 2, high: 3 };
    return levels[impact];
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="rectangular" width="100%" height={150} />
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
        <IconButton color="inherit" size="small" onClick={fetchGapAnalysis}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Total Gaps</Typography>
                <Typography variant="h3">{data.gapSummary.totalGaps}</Typography>
              </Box>
              <GapIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="body2" color="error.main">
              {data.gapSummary.highPriorityGaps} high priority
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Avg Gap Size</Typography>
                <Typography variant="h3">{data.gapSummary.averageGapSize.toFixed(1)}</Typography>
              </Box>
              <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              points below target
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Potential Gain</Typography>
                <Typography variant="h3" color="success.main">
                  +{data.gapSummary.totalPotentialImprovement.toFixed(1)}
                </Typography>
              </Box>
              <ImprovementIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              score improvement
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Est. Timeline</Typography>
                <Typography variant="h3">{data.gapSummary.estimatedTimeToClose}</Typography>
              </Box>
              <TimelineIcon sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              months to close gaps
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderGapsList = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Identified Gaps</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="high">High Priority</MenuItem>
                <MenuItem value="medium">Medium Priority</MenuItem>
                <MenuItem value="low">Low Priority</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="identified">Identified</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
          {data.gaps.map((gap) => (
            <Accordion key={gap.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {getPriorityIcon(gap.priority)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {gap.dimensionName}
                      {gap.categoryName && ` - ${gap.categoryName}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gap: {gap.gapSize.toFixed(1)} points | Target: {gap.targetScore.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(gap.status)}
                    <Chip
                      label={gap.priority}
                      size="small"
                      color={gap.priority === 'high' ? 'error' : gap.priority === 'medium' ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" paragraph>
                      {gap.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommendations:
                    </Typography>
                    <List dense>
                      {gap.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <InsightIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Current vs Target</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(gap.currentScore / gap.targetScore) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption">{gap.currentScore.toFixed(1)}</Typography>
                          <Typography variant="caption">{gap.targetScore.toFixed(1)}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <ImpactIcon color="primary" />
                          <Typography variant="caption" display="block">
                            Impact: {gap.impact.charAt(0).toUpperCase() + gap.impact.slice(1)}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <EffortIcon color="secondary" />
                          <Typography variant="caption" display="block">
                            Effort: {gap.effort.charAt(0).toUpperCase() + gap.effort.slice(1)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2">
                        <strong>Timeline:</strong> {gap.timeToImprove} months
                      </Typography>
                      {gap.costEstimate && (
                        <Typography variant="body2">
                          <strong>Est. Cost:</strong> ${gap.costEstimate.toLocaleString()}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderOpportunities = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <OpportunityIcon />
          Improvement Opportunities
        </Typography>
        <Grid container spacing={3}>
          {data.improvementOpportunities.map((opportunity) => (
            <Grid item xs={12} md={6} lg={4} key={opportunity.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      {opportunity.title}
                    </Typography>
                    <Chip
                      label={opportunity.type.replace('_', ' ')}
                      size="small"
                      sx={{ backgroundColor: COLORS[opportunity.type], color: 'white' }}
                    />
                  </Box>
                  <Typography variant="body2" paragraph>
                    {opportunity.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Affected Dimensions:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {opportunity.affectedDimensions.map((dim, index) => (
                        <Chip key={index} label={dim} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Impact:</strong> +{opportunity.potentialImpact.toFixed(1)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Complexity:</strong> {opportunity.implementationComplexity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Timeline:</strong> {opportunity.timeline}
                  </Typography>
                  {opportunity.expectedROI && (
                    <Typography variant="body2" color="success.main">
                      <strong>Expected ROI:</strong> {opportunity.expectedROI}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderPriorityMatrix = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Impact vs Effort Matrix</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.priorityMatrix}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="dimensionName" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis label={{ value: 'Impact vs Effort', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip 
              formatter={(value, name) => [
                value,
                name === 'impact' ? 'Impact Level' : 'Effort Level'
              ]}
            />
            <Bar dataKey="impact" fill="#4caf50" name="Impact" />
            <Bar dataKey="effort" fill="#f44336" name="Effort" />
          </BarChart>
        </ResponsiveContainer>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50' }} />
            <Typography variant="caption">Impact</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336' }} />
            <Typography variant="caption">Effort</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GapIcon />
          Gap Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewType}
              label="View"
              onChange={(e) => setViewType(e.target.value as 'gaps' | 'opportunities' | 'matrix')}
            >
              <MenuItem value="gaps">Gaps</MenuItem>
              <MenuItem value="opportunities">Opportunities</MenuItem>
              <MenuItem value="matrix">Priority Matrix</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={onRefresh || fetchGapAnalysis} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {renderSummaryCards()}

      {viewType === 'gaps' && renderGapsList()}
      {viewType === 'opportunities' && renderOpportunities()}
      {viewType === 'matrix' && renderPriorityMatrix()}
    </Box>
  );
};

export default GapAnalysis; 