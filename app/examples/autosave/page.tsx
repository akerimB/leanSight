'use client';

import React from 'react';
import { Container, Typography, Box, Divider, Paper, Alert } from '@mui/material';
import { AutoSaveForm, ServerAutoSaveForm } from '@/components/examples/AutoSaveFormExample';

export default function AutoSavePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Auto-Save Functionality
      </Typography>
      
      <Alert severity="info" sx={{ mb: 4 }}>
        This page demonstrates the auto-save functionality. Try filling out the forms and then refreshing the page. Your data should persist.
      </Alert>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          How it works
        </Typography>
        <Typography variant="body1" paragraph>
          The auto-save functionality automatically saves your form data as you type. This helps prevent data loss when:
        </Typography>
        <ul>
          <li>The user accidentally navigates away</li>
          <li>The browser crashes or is closed</li>
          <li>The user loses their internet connection</li>
          <li>The user needs to continue their work later</li>
        </ul>
        <Typography variant="body1">
          Data is saved locally in the browser and can optionally be synced to the server at regular intervals.
        </Typography>
      </Paper>
      
      <Typography variant="h5" sx={{ mb: 2 }}>
        Local Storage Auto-Save
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This form saves data to local storage only. It will persist across browser refreshes on the same device.
      </Typography>
      <AutoSaveForm />
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" sx={{ mb: 2 }}>
        Server Auto-Save (Simulated)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This form simulates saving to a server while also keeping a local backup. In a real application, this would sync with your database.
      </Typography>
      <ServerAutoSaveForm />
    </Container>
  );
} 