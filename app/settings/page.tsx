'use client';

import { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { toast } from 'sonner';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setInitialLoading(true);
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to load settings');
        }
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      } catch (error: any) {
        toast.error(error.message || 'Could not load your settings.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingUpdate = async (settingName: keyof typeof settings, value: any) => {
    const oldSettings = { ...settings };
    setSettings(prev => ({ ...prev, [settingName]: value }));
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [settingName]: value }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update ${settingName}`);
      }
      const updatedSetting = await response.json();
      setSettings(prev => ({ ...prev, ...updatedSetting })); 
      toast.success(`${String(settingName).replace(/([A-Z])/g, ' $1').trim()} updated successfully.`);
    } catch (error: any) {
      toast.error(error.message || `Could not update ${settingName}.`);
      setSettings(oldSettings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (settingName: 'emailNotifications' | 'darkMode') => {
    handleSettingUpdate(settingName, !settings[settingName]);
  };

  const handleChange = (settingName: 'language' | 'email' | 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    if (['email', 'currentPassword', 'newPassword', 'confirmPassword'].includes(settingName)) {
      setSettings(prev => ({ ...prev, [settingName]: value }));
    } else {
      handleSettingUpdate(settingName as 'language', value);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!settings.currentPassword || !settings.newPassword) {
        toast.error("All password fields are required.");
        return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      toast.success(data.message || 'Password updated successfully!');
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating your password.');
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
        <Typography sx={{ml: 2}}>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 700, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{mb: 3}}>
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
              disabled={isSaving}
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
              disabled={isSaving}
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
              disabled={isSaving}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </TextField>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handlePasswordChange} sx={{ mb: 3 }}>
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
            disabled={isSaving}
          />
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={settings.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            margin="normal"
            required
            disabled={isSaving}
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={settings.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            margin="normal"
            required
            disabled={isSaving}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={settings.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            margin="normal"
            required
            disabled={isSaving}
          />
          <Button 
            type="submit"
            variant="contained" 
            sx={{ mt: 2 }}
            disabled={isSaving || !settings.currentPassword || !settings.newPassword || settings.newPassword !== settings.confirmPassword}
          >
            Update Password
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
