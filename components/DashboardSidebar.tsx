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

const drawerWidth = 260;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { label: 'Assessment', icon: <AssessmentIcon />, href: '/assessment' },
  { label: 'Companies/Departments', icon: <BusinessIcon />, href: '/companies' },
  { label: 'Weighting Schemes', icon: <BalanceIcon />, href: '/weighting-schemes' },
  { label: 'Sectors', icon: <CategoryIcon />, href: '/sectors' },
  { label: 'Analytics', icon: <BarChartIcon />, href: '/analytics' },
  { label: 'Results', icon: <ShowChartIcon />, href: '/results' },
  { label: 'Settings', icon: <SettingsIcon />, href: '/settings' },
  { label: 'Admin', icon: <AdminPanelSettingsIcon />, href: '/admin' },
];

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
          LeanSight Dashboard
        </Typography>
        <Divider />
        <List>
          {menuItems.map((item) => (
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
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
    </Box>
    </Box>
  );
}
