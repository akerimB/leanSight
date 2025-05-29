'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Drawer, List, ListItemIcon, ListItemText, Toolbar, CssBaseline, Divider, Typography } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BalanceIcon from '@mui/icons-material/Balance';
import CategoryIcon from '@mui/icons-material/Category';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupIcon from '@mui/icons-material/Group';
import TimelineIcon from '@mui/icons-material/Timeline';
import ScoreIcon from '@mui/icons-material/Score';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from 'next-auth/react';

const drawerWidth = 260;

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          display: { xs: 'none', sm: 'block' },
        }}
        open
      >
        <Toolbar />
        <Typography variant="h6" sx={{ p: 2 }}>
          LeanSight
        </Typography>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {[
            { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
            { label: 'Assessment', href: '/assessment', icon: <AssessmentIcon /> },
            { label: 'Companies/Departments', href: '/companies', icon: <BusinessIcon /> },
            { label: 'Weighting Schemes', href: '/weighting-schemes', icon: <TimelineIcon /> },
            { label: 'Results', href: '/results', icon: <ScoreIcon /> },
            { label: 'Analytics', href: '/analytics', icon: <BarChartIcon /> },
            { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
            { label: 'Admin', href: '/admin', icon: <AdminPanelSettingsIcon /> },
          ].map((item) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={pathname === item.href}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
