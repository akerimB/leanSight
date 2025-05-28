import React from 'react';
import { Box, Typography, CircularProgress, Fade } from '@mui/material';
import { Save as SaveIcon, Check as CheckIcon } from '@mui/icons-material';

interface AutoSaveStatusProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Component to display auto-save status in forms
 */
export default function AutoSaveStatus({ isSaving, hasUnsavedChanges }: AutoSaveStatusProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        minHeight: 24,
        color: 'text.secondary',
        fontSize: 'small',
      }}
    >
      {isSaving ? (
        <Fade in={true}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="caption">Saving changes...</Typography>
          </Box>
        </Fade>
      ) : hasUnsavedChanges ? (
        <Fade in={true}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SaveIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="caption">Unsaved changes</Typography>
          </Box>
        </Fade>
      ) : (
        <Fade in={true}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
            <Typography variant="caption">All changes saved</Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
} 