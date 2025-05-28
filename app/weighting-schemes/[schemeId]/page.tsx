'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  Chip
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DimensionWeightDetails {
  id: string;
  weight: number;
  dimension: { id: string; name: string };
}

interface CategoryWeightDetails {
  id: string;
  weight: number;
  category: { id: string; name: string };
  dimensionWeights: DimensionWeightDetails[];
}

interface WeightingSchemeDetails {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  categoryWeights: CategoryWeightDetails[];
  // company?: {id: string; name: string} | null; // If company-specific schemes are implemented
}

export default function WeightingSchemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const schemeId = params?.schemeId as string;

  const [scheme, setScheme] = useState<WeightingSchemeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemeDetails = useCallback(async () => {
    if (!schemeId) {
      setError('Scheme ID not found in URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weighting-schemes/${schemeId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch weighting scheme details');
      }
      const data = await response.json();
      setScheme(data);
    } catch (err: any) {
      console.error('Failed to fetch scheme details:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load scheme details.');
    } finally {
      setLoading(false);
    }
  }, [schemeId]);

  useEffect(() => {
    if (schemeId) {
      fetchSchemeDetails();
    }
  }, [schemeId, fetchSchemeDetails]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={schemeId ? <Button onClick={fetchSchemeDetails}>Retry</Button> : undefined}>
          {error}
        </Alert>
        <Button onClick={() => router.push('/weighting-schemes')} sx={{ mt: 2 }}>
          &larr; Back to Schemes List
        </Button>
      </Box>
    );
  }

  if (!scheme) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Weighting scheme data could not be loaded or found.</Alert>
        <Button onClick={() => router.push('/weighting-schemes')} sx={{ mt: 2 }}>
          &larr; Back to Schemes List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => router.push('/weighting-schemes')} sx={{ mb: 2 }}>
        &larr; Back to Schemes List
      </Button>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 9 }}>
                <Typography variant="h4" gutterBottom>
                {scheme.name}
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} sx={{textAlign: {sm: 'right'}}}>
                {scheme.isDefault && <Chip label="Default Scheme" color="primary" />}
            </Grid>
        </Grid>
        
        {scheme.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {scheme.description}
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          Category & Dimension Weights
        </Typography>

        {scheme.categoryWeights.length === 0 && (
          <Typography sx={{my: 2}}>No categories and dimensions are currently weighted for this scheme.</Typography>
        )}

        <List disablePadding>
          {scheme.categoryWeights.map((cw) => (
            <React.Fragment key={cw.id}>
              <ListItem sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'} }}>
                <ListItemText 
                  primary={cw.category.name}
                  secondary={`Category Weight: ${(cw.weight * 100).toFixed(1)}%`}
                  primaryTypographyProps={{variant: 'h6'}}
                  sx={{mb: {xs: 1, sm: 0}}}
                />
              </ListItem>
              {cw.dimensionWeights.length > 0 && (
                <List disablePadding sx={{ pl: 4, backgroundColor: 'rgba(0,0,0,0.02)', borderLeft: '2px solid', borderColor: 'divider' }}>
                  {cw.dimensionWeights.map((dw) => (
                    <ListItem key={dw.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <ListItemText 
                        primary={dw.dimension.name} 
                        secondary={`Weight within category: ${(dw.weight * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
} 