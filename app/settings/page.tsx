'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import ColorLensIcon from '@mui/icons-material/ColorLens';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    language: 'en',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleChange = (setting: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Email Notifications" 
              secondary="Receive email updates about assessment progress"
            />
            <Switch
              edge="end"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <ColorLensIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Dark Mode" 
              secondary="Toggle dark/light theme"
            />
            <Switch
              edge="end"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Language" 
              secondary="Choose your preferred language"
            />
            <TextField
              select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              SelectProps={{ native: true }}
              sx={{ width: 120 }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </TextField>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Security Settings
          </Typography>
          <TextField
            fullWidth
            label="Email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={settings.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={settings.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={settings.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            margin="normal"
          />
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            disabled={!settings.currentPassword || !settings.newPassword || settings.newPassword !== settings.confirmPassword}
          >
            Update Password
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
