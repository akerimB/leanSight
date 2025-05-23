'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateWeightingSchemePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch('/api/weighting-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isDefault }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          setFieldErrors(data.errors);
          throw new Error(data.message || 'Validation failed');
        } else if (response.status === 409) {
          setError(data.message || 'A scheme with this name already exists.');
          throw new Error(data.message || 'A scheme with this name already exists.');
        } else {
          throw new Error(data.message || 'Failed to create weighting scheme');
        }
      }
      toast.success(`Weighting scheme "${data.name}" created successfully!`);
      router.push('/weighting-schemes'); // Redirect to the list page
    } catch (err: any) {
      if (!fieldErrors.name && !error) { // Avoid double-toasting if specific error already set
        toast.error(err.message || 'An unexpected error occurred.');
      }
      if (!error && !fieldErrors.name && err.message !== 'Validation failed' && err.message !== 'A scheme with this name already exists.') {
        setError(err.message || 'An unexpected error occurred during submission.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Create New Weighting Scheme
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Scheme Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!fieldErrors.name}
            helperText={fieldErrors.name?.[0]}
          />
          <TextField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            error={!!fieldErrors.description}
            helperText={fieldErrors.description?.[0]}
          />
          <FormControlLabel
            control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
            label="Set as Default Scheme"
            sx={{ mt: 1, mb: 2 }}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt:2 }}>
            <Button onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Scheme'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
} 