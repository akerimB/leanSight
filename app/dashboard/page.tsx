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
  Button
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const userName = session?.user?.name || 'User';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(2000);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch dashboard data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
      setRetryDelay(2000); // Reset retry delay on successful fetch
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setRetryDelay(prev => Math.min(prev * 2, 30000));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    if (!session) return;
    fetchDashboardData();
  }, [session, sessionStatus, retryCount]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (error && retryCount < 3) { // Limit to 3 automatic retries
      const timeoutId = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, retryDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [error, retryDelay, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setRetryDelay(2000); // Reset delay on manual retry
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  // Quick stats configuration with real data
  const quickStats = dashboardData ? [
    { 
      label: 'Total Assessments', 
      value: dashboardData.quickStats.totalAssessments.toString(), 
      icon: <AssessmentIcon />, 
      color: '#2196f3' 
    },
    { 
      label: 'Active Companies', 
      value: dashboardData.quickStats.activeCompanies.toString(), 
      icon: <BusinessIcon />, 
      color: '#4caf50' 
    },
    { 
      label: 'Total Users', 
      value: dashboardData.quickStats.totalUsers.toString(), 
      icon: <GroupIcon />, 
      color: '#ff9800' 
    },
    { 
      label: 'Departments', 
      value: dashboardData.quickStats.departments.toString(), 
      icon: <WorkIcon />, 
      color: '#9c27b0' 
    }
  ] : [];

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.type === 'Assessment') {
      if (activity.metadata.assessmentId) {
        router.push(`/assessment/${activity.metadata.assessmentId}`);
      }
    } else if (activity.type === 'Company') {
      if (activity.metadata.companyId) {
        router.push(`/companies/${activity.metadata.companyId}`);
      }
    }
  };

  return (
    <Box sx={{ mt: 2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Welcome back, {userName}
        </Typography>
        {error && (
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            variant="outlined"
            color="primary"
            size="small"
            disabled={loading}
          >
            {retryCount >= 3 ? 'Try Again' : `Retrying... (${retryCount + 1}/3)`}
          </Button>
        )}
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              disabled={loading}
            >
              {retryCount >= 3 ? 'Try Again' : `Retry (${retryCount + 1}/3)`}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Quick Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          // Loading skeletons for stats
          Array(4).fill(null).map((_, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          quickStats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  boxShadow: 2,
                  height: '100%'
                }}
              >
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  bgcolor: `${stat.color}15`,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" component="div">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Main Content Row */}
      <Grid container spacing={3}>
        {/* Quick Actions Section */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {dashboardCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.href}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={card.href}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'row',
                      alignItems: 'center', 
                      gap: 2,
                      py: 3,
                      height: '100%'
                    }}>
                      {card.icon}
                      <Box>
                        <Typography variant="h6">
                          {card.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {card.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Activity Feed Section */}
        <Grid item xs={12} lg={4}>
          <Paper 
            sx={{ 
              height: '100%',
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Recent Activity
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
              {loading ? (
                // Loading skeletons for activities
                <List>
                  {Array(3).fill(null).map((_, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Skeleton variant="circular" width={24} height={24} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Skeleton width="60%" />}
                          secondary={<Skeleton width="40%" />}
                        />
                        <Skeleton width={80} height={32} />
                      </ListItem>
                      {index < 2 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : dashboardData?.recentActivity.length ? (
                <List>
                  {dashboardData.recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ButtonBase
                        onClick={() => handleActivityClick(activity)}
                        sx={{
                          width: '100%',
                          textAlign: 'left',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                          }
                        }}
                      >
                        <ListItem
                          sx={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            py: 2,
                            width: '100%'
                          }}
                        >
                          <Box sx={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            position: 'relative'
                          }}>
                            <ListItemIcon>
                              {activity.status === 'REVIEWED' ? (
                                <CheckCircleIcon color="success" />
                              ) : activity.status === 'SUBMITTED' ? (
                                <PendingIcon color="warning" />
                              ) : (
                                <AssessmentIcon color="info" />
                              )}
                            </ListItemIcon>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" component="div" noWrap>
                                  {activity.title}
                                </Typography>
                                <LaunchIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    '.MuiButtonBase-root:hover &': {
                                      opacity: 0.5
                                    }
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {activity.subtitle}
                              </Typography>
                            </Box>
                            <Chip 
                              label={activity.status} 
                              size="small"
                              color={
                                activity.status === 'REVIEWED' ? 'success' : 
                                activity.status === 'SUBMITTED' ? 'warning' : 
                                'info'
                              }
                              sx={{ pointerEvents: 'none', ml: 1 }}
                            />
                          </Box>
                          
                          <Box 
                            sx={{ 
                              width: '100%',
                              pl: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              flexWrap: 'wrap'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                                pointerEvents: 'none'
                              }}
                            >
                              <TimerIcon fontSize="small" />
                              {activity.date}
                            </Typography>

                            {activity.expert && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  pointerEvents: 'none'
                                }}
                              >
                                <PersonIcon fontSize="small" />
                                {activity.expert}
                              </Typography>
                            )}

                            {activity.progress && (
                              <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                alignItems: 'center',
                                pointerEvents: 'none',
                                ml: 'auto'
                              }}>
                                {activity.type === 'Assessment' && (
                                  <>
                                    <Tooltip title="Scores">
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ScoreIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                          {activity.progress.scores}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                    <Tooltip title="Evidence Items">
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <FolderIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                          {activity.progress.evidence}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                      </ButtonBase>
                      {index < dashboardData.recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No recent activity</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
