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
import { AutoSaveForm } from '@/components/examples/AutoSaveFormExample';

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
  const { data: session, status } = useSession({ required: true });

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
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {session?.user?.name || 'User'}!
            </Typography>
            <Typography variant="body1">
              This is your personalized dashboard for LeanSight. Here you can manage your assessments,
              view reports, and track progress across your organization.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Active Assessments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No active assessments found. Create a new assessment to get started.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  • Create new assessment
                </Typography>
                <Typography variant="body2">
                  • View reports
                </Typography>
                <Typography variant="body2">
                  • Update profile settings
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <AutoSaveForm />
        </Grid>
      </Grid>
    </Container>
  );
}
