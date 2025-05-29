'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Role } from '@prisma/client';

export default function NavBar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleSignOut = async () => {
    handleUserMenuClose();
    await signOut({ callbackUrl: '/auth/signin' });
  };
  
  const isAdmin = session?.user?.role === Role.ADMIN;
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Assessments', icon: <AssessmentIcon />, path: '/assessments' },
    { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
  ];
  
  // Add demo pages to the menu
  menuItems.push(
    { text: 'Maturity Levels', icon: <AssessmentIcon />, path: '/maturity-levels' },
    { text: 'Assessment Demo', icon: <AssessmentIcon />, path: '/assessment-demo' }
  );
  
  if (isAdmin) {
    menuItems.push({ text: 'Admin', icon: <SettingsIcon />, path: '/admin' });
  }
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {session && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              LeanSight
            </Link>
          </Typography>
          
          {status === 'loading' ? (
            <Box sx={{ width: 100 }} />
          ) : session ? (
            <Box>
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {session.user?.name?.[0] || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={userMenuAnchor}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle2">
                    {session.user?.name || 'User'}
                  </Typography>
                </MenuItem>
                <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                  {session.user?.email}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => {
                  handleUserMenuClose();
                  router.push('/profile');
                }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button 
              color="inherit" 
              startIcon={<LoginIcon />}
              onClick={() => router.push('/auth/signin')}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        variant={isMobile ? 'temporary' : 'temporary'}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Menu</Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              onClick={() => {
                router.push(item.path);
                toggleDrawer();
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
} 