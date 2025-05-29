'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Grid as MuiGrid, 
  Card, 
  CardActionArea, 
  CardContent, 
  Typography, 
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  Skeleton,
  Alert,
  LinearProgress,
  Tooltip,
  ButtonBase,
  alpha,
  Button,
  Container,
  CircularProgress
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import TimerIcon from '@mui/icons-material/Timer';
import ScoreIcon from '@mui/icons-material/Score';
import FolderIcon from '@mui/icons-material/Folder';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

// Quick action cards configuration
const dashboardCards = [
  {
    label: 'Assessment',
    description: 'Start or continue assessments',
    icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
    href: '/assessment'
  },
  {
    label: 'Companies/Departments',
    description: 'Manage your organization structure',
    icon: <BusinessIcon sx={{ fontSize: 48 }} />,
    href: '/companies'
  },
  {
    label: 'Analytics',
    description: 'View insights and reports',
    icon: <BarChartIcon sx={{ fontSize: 48 }} />,
    href: '/analytics'
  },
  {
    label: 'Settings',
    description: 'Configure your preferences',
    icon: <SettingsIcon sx={{ fontSize: 48 }} />,
    href: '/settings'
  },
  {
    label: 'Admin',
    description: 'Manage users and permissions',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />,
    href: '/admin'
  }
];

const Grid = MuiGrid as any; // Temporary type assertion to fix the TypeScript error

interface ActivityItem {
  type: string;
  title: string;
  subtitle: string;
  status: string;
  date: string;
  expert?: string;
  duration?: string | null;
  progress?: {
    scores?: number;
    evidence?: number;
    departments?: number;
    assessments?: number;
  };
  metadata: {
    companyId?: string;
    departmentId?: string;
    assessmentId?: string;
  };
  id: string;
}

interface DashboardData {
  quickStats: {
    totalAssessments: number;
    activeCompanies: number;
    totalUsers: number;
    departments: number;
  };
  recentActivity: ActivityItem[];
}

interface MetricData {
  label: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
  icon: React.ReactNode;
  color?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession({ required: true });
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [quickStats, setQuickStats] = useState<{
    totalAssessments: number;
    activeCompanies: number;
    totalUsers: number;
    departments: number;
    averageScore: number;
    completionRate: number;
  }>({
    totalAssessments: 0,
    activeCompanies: 0,
    totalUsers: 0,
    departments: 0,
    averageScore: 0,
    completionRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [topDimensions, setTopDimensions] = useState<{name: string, score: number}[]>([]);
  const [bottomDimensions, setBottomDimensions] = useState<{name: string, score: number}[]>([]);
  const [dimensionsLoading, setDimensionsLoading] = useState(false);
  const [draftAssessments, setDraftAssessments] = useState<number>(0);
  const [firstDraftId, setFirstDraftId] = useState<string | null>(null);

  // Fetch recent assessments
  useEffect(() => {
    if (status === 'authenticated') {
      setLoadingAssessments(true);
      fetch('/api/assessments?limit=5', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load assessments'))
        .then(data => {
          setRecentAssessments(data);
          // Count draft assessments and get their IDs
          const drafts = data.filter((a: any) => a.status === 'DRAFT');
          setDraftAssessments(drafts.length);
          // Store the first draft ID if available for the continue button
          if (drafts.length > 0) {
            setFirstDraftId(drafts[0].id);
          }
        })
        .catch(err => console.error('Error loading recent assessments:', err))
        .finally(() => setLoadingAssessments(false));
      
      // Fetch dashboard stats
      setStatsLoading(true);
      fetch('/api/dashboard/stats', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load dashboard stats'))
        .then(data => {
          setQuickStats({
            totalAssessments: data.totalAssessments || 0,
            activeCompanies: data.activeCompanies || 0,
            totalUsers: data.totalUsers || 0,
            departments: data.departments || 0,
            averageScore: data.averageScore || 0,
            completionRate: data.completionRate || 0
          });
        })
        .catch(err => {
          console.error('Error loading dashboard stats:', err);
          // Set dummy data for now - this would be removed in production
          setQuickStats({
            totalAssessments: 18,
            activeCompanies: 3,
            totalUsers: 12,
            departments: 8,
            averageScore: 3.2,
            completionRate: 78
          });
        })
        .finally(() => setStatsLoading(false));
      
      // Fetch top and bottom dimensions
      setDimensionsLoading(true);
      fetch('/api/dashboard/dimensions', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load dimension data'))
        .then(data => {
          setTopDimensions(data.top || []);
          setBottomDimensions(data.bottom || []);
        })
        .catch(err => {
          console.error('Error loading dimension data:', err);
          // Set dummy data for now - would be removed in production
          setTopDimensions([
            {name: 'Visual Management', score: 4.2},
            {name: 'Continuous Improvement', score: 3.9},
            {name: 'Problem Solving', score: 3.8}
          ]);
          setBottomDimensions([
            {name: 'Policy Deployment', score: 1.8},
            {name: 'Value Stream Analysis', score: 2.1},
            {name: 'Leader Standard Work', score: 2.3}
          ]);
        })
        .finally(() => setDimensionsLoading(false));
    }
  }, [status]);

  // Navigate to the assessment view/edit page
  const handleViewAssessment = (id: string, status: string) => {
    console.log(`Navigating to assessment ${id} with status ${status}`);
    // Ensure the ID is properly encoded in the URL
    router.push(`/assessment?tab=past&id=${encodeURIComponent(id)}`);
  };

  // Direct function to resume draft assessment
  const handleResumeDraft = () => {
    if (firstDraftId) {
      console.log(`Resuming draft assessment ${firstDraftId}`);
      router.push(`/assessment?tab=past&id=${encodeURIComponent(firstDraftId)}`);
    } else {
      console.log('No draft assessment to resume');
      router.push('/assessment?tab=past');
    }
  };

  // Prepare metrics for KPI cards
  const getMetrics = (): MetricData[] => {
    return [
      {
        label: 'Average Score',
        value: quickStats.averageScore.toFixed(1),
        previousValue: '3.0',
        change: 0.2,
        trend: 'up',
        icon: <ScoreIcon />,
        color: '#4caf50'
      },
      {
        label: 'Total Assessments',
        value: quickStats.totalAssessments,
        previousValue: quickStats.totalAssessments - 3,
        change: 3,
        trend: 'up',
        icon: <AssessmentIcon />,
        color: '#2196f3'
      },
      {
        label: 'Completion Rate',
        value: `${quickStats.completionRate}%`,
        previousValue: '72%',
        change: 6,
        trend: 'up',
        icon: <CheckCircleIcon />,
        color: '#ff9800'
      },
      {
        label: 'Companies',
        value: quickStats.activeCompanies,
        previousValue: quickStats.activeCompanies,
        trend: 'flat',
        icon: <BusinessIcon />,
        color: '#9c27b0'
      }
    ];
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          href="/assessment"
        >
          New Assessment
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Welcome Card with Action Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {session?.user?.name || 'User'}!
            </Typography>
            <Typography variant="body1" paragraph>
              Here's your organizational lean maturity snapshot.
            </Typography>
            
            {draftAssessments > 0 && (
              <Alert severity="info" sx={{ mt: 2, bgcolor: alpha('#fff', 0.9), color: 'text.primary' }}>
                You have {draftAssessments} draft assessment{draftAssessments > 1 ? 's' : ''} in progress. 
                <Button 
                  size="small"
                  onClick={handleResumeDraft}
                  sx={{ ml: 1 }}
                >
                  Continue
                </Button>
              </Alert>
            )}
          </Paper>
        </Grid>
        
        {/* KPI Cards */}
        {getMetrics().map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1, fontWeight: 'medium' }}>
                      {statsLoading ? <Skeleton width={60} /> : metric.value}
                    </Typography>
                    {metric.trend && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {metric.trend === 'up' ? (
                          <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                        ) : metric.trend === 'down' ? (
                          <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingFlatIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        )}
                        <Typography variant="body2" color={
                          metric.trend === 'up' ? 'success.main' : 
                          metric.trend === 'down' ? 'error.main' : 
                          'text.secondary'
                        }>
                          {metric.change ? `${metric.change > 0 ? '+' : ''}${metric.change}` : ''} from previous
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    bgcolor: alpha(metric.color || 'primary.main', 0.1),
                    color: metric.color || 'primary.main'
                  }}>
                    {metric.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        {/* Strengths and Opportunities */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Dimensions
              </Typography>
              {dimensionsLoading ? (
                <Box sx={{ py: 2 }}>
                  <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={30} />
                </Box>
              ) : topDimensions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No dimension data available yet. Complete more assessments to see insights.
                </Typography>
              ) : (
                <List disablePadding>
                  {topDimensions.map((dim, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: '50%', 
                          bgcolor: 'success.light', 
                          color: 'success.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={dim.name}
                        secondary={`Score: ${dim.score.toFixed(1)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button 
                variant="text" 
                component={Link} 
                href="/analytics" 
                sx={{ mt: 2 }}
                endIcon={<LaunchIcon fontSize="small" />}
              >
                View All Dimensions
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Improvement Opportunities
              </Typography>
              {dimensionsLoading ? (
                <Box sx={{ py: 2 }}>
                  <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={30} />
                </Box>
              ) : bottomDimensions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No dimension data available yet. Complete more assessments to see insights.
                </Typography>
              ) : (
                <List disablePadding>
                  {bottomDimensions.map((dim, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: '50%', 
                          bgcolor: 'error.light', 
                          color: 'error.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={dim.name}
                        secondary={`Score: ${dim.score.toFixed(1)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button 
                variant="text" 
                color="error"
                component={Link} 
                href="/analytics?view=opportunities" 
                sx={{ mt: 2 }}
                endIcon={<LaunchIcon fontSize="small" />}
              >
                View Improvement Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Assessments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Recent Assessments
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined"
                    component={Link}
                    href="/assessment?tab=past"
                    startIcon={<VisibilityIcon />}
                  >
                    View All
                  </Button>
                </Box>
              </Box>
              
              {loadingAssessments ? (
                <Box sx={{ py: 3 }}>
                  <Skeleton variant="rectangular" height={60} />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
                </Box>
              ) : recentAssessments.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No assessments found. Start by creating a new assessment.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component={Link}
                    href="/assessment"
                    startIcon={<LaunchIcon />}
                  >
                    Start New Assessment
                  </Button>
                </Paper>
              ) : (
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead" sx={{ backgroundColor: 'grey.100' }}>
                    <Box component="tr">
                      <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Company/Department</Box>
                      <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Date</Box>
                      <Box component="th" sx={{ p: 2, textAlign: 'center' }}>Status</Box>
                      <Box component="th" sx={{ p: 2, textAlign: 'right' }}>Score</Box>
                      <Box component="th" sx={{ p: 2, textAlign: 'center' }}>Actions</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {recentAssessments.map((assessment) => (
                      <Box 
                        component="tr" 
                        key={assessment.id}
                        sx={{ 
                          '&:hover': { backgroundColor: 'grey.50' },
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box component="td" sx={{ p: 2 }}>
                          <Typography variant="body2" fontWeight="medium">{assessment.company.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {assessment.department?.name ?? 'Company-wide'}
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          {new Date(assessment.updatedAt).toLocaleDateString()}
                        </Box>
                        <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                          <Chip 
                            label={assessment.status} 
                            color={
                              assessment.status === 'DRAFT' ? 'warning' :
                              assessment.status === 'SUBMITTED' ? 'info' :
                              assessment.status === 'REVIEWED' ? 'success' : 
                              'default'
                            }
                            size="small"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, textAlign: 'right' }}>
                          {assessment.weightedAverageScore ? 
                            assessment.weightedAverageScore.toFixed(1) : 
                            assessment.rawAverageScore ? 
                              assessment.rawAverageScore.toFixed(1) : 
                              'N/A'
                          }
                        </Box>
                        <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleViewAssessment(assessment.id, assessment.status)}
                          >
                            {assessment.status === 'DRAFT' ? 'Continue' : 'View'}
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
