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
  Chip,
  TextField,
  FormControlLabel,
  Checkbox
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
}

interface SchemeFormData {
  name: string;
  description: string;
  isDefault: boolean;
  categoryWeights: Array<{
    categoryId: string;
    categoryName: string;
    weight: number;
    dimensionWeights: Array<{
      dimensionId: string;
      dimensionName: string;
      weight: number;
    }>;
  }>;
}

export default function EditWeightingSchemePage() {
  const router = useRouter();
  const params = useParams();
  const schemeId = params?.schemeId as string;

  const [scheme, setScheme] = useState<WeightingSchemeDetails | null>(null);
  const [formData, setFormData] = useState<SchemeFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const data: WeightingSchemeDetails = await response.json();
      setScheme(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        isDefault: data.isDefault,
        categoryWeights: data.categoryWeights.map(cw => ({
          categoryId: cw.category.id,
          categoryName: cw.category.name,
          weight: cw.weight,
          dimensionWeights: cw.dimensionWeights.map(dw => ({
            dimensionId: dw.dimension.id,
            dimensionName: dw.dimension.name,
            weight: dw.weight,
          })),
        })),
      });
    } catch (err: any) {
      console.error('Failed to fetch scheme details:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load scheme details for editing.');
    } finally {
      setLoading(false);
    }
  }, [schemeId]);

  useEffect(() => {
    if (schemeId) {
      fetchSchemeDetails();
    }
  }, [schemeId, fetchSchemeDetails]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    if (type === 'checkbox' && event.target instanceof HTMLInputElement) {
        const targetInput = event.target as HTMLInputElement;
        setFormData(prev => prev ? { ...prev, [name]: targetInput.checked } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleCategoryWeightChange = (categoryIndex: number, newWeight: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedCategoryWeights = [...prev.categoryWeights];
      const weightVal = parseFloat(newWeight);
      updatedCategoryWeights[categoryIndex] = {
        ...updatedCategoryWeights[categoryIndex],
        weight: isNaN(weightVal) ? 0 : weightVal,
      };
      return { ...prev, categoryWeights: updatedCategoryWeights };
    });
  };

  // Handler for changing dimension weight
  const handleDimensionWeightChange = (categoryIndex: number, dimensionIndex: number, newWeight: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const updatedCategoryWeights = [...prev.categoryWeights];
      const targetCategory = { ...updatedCategoryWeights[categoryIndex] };
      const updatedDimensionWeights = [...targetCategory.dimensionWeights];
      const weightVal = parseFloat(newWeight);
      updatedDimensionWeights[dimensionIndex] = {
        ...updatedDimensionWeights[dimensionIndex],
        weight: isNaN(weightVal) ? 0 : weightVal, // Default to 0 if not a number
      };
      targetCategory.dimensionWeights = updatedDimensionWeights;
      updatedCategoryWeights[categoryIndex] = targetCategory;
      return { ...prev, categoryWeights: updatedCategoryWeights };
    });
  };

  const handleSubmit = async () => {
    if (!formData || !scheme) return;
    setSaving(true);
    setError(null);

    try {
      // Basic details update + weights
      const payload = {
        name: formData.name,
        description: formData.description,
        isDefault: formData.isDefault,
        categoryWeights: formData.categoryWeights.map(cw => ({
          categoryId: cw.categoryId,
          weight: cw.weight,
          dimensionWeights: cw.dimensionWeights.map(dw => ({
            dimensionId: dw.dimensionId,
            weight: dw.weight,
          })),
        })),
      };

      const response = await fetch(`/api/weighting-schemes/${schemeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update weighting scheme');
      }
      toast.success('Weighting scheme updated successfully!');
      router.push(`/weighting-schemes/${schemeId}`);
    } catch (err: any) {
      console.error('Failed to save scheme:', err);
      setError(err.message || 'An unexpected error occurred while saving.');
      toast.error(err.message || 'Failed to save scheme.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !scheme) {
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
  
  if (!scheme || !formData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Weighting scheme data is not available for editing.</Alert>
        <Button onClick={() => router.push('/weighting-schemes')} sx={{ mt: 2 }}>
          &larr; Back to Schemes List
        </Button>
      </Box>
    );
  }

  const saveErrorAlert = error && scheme ? (
    <Alert severity="error" sx={{mb:2}}>
        {error}
    </Alert>
  ) : null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
        <Typography variant="h4" gutterBottom sx={{mb:0}}>
          Edit: {scheme.name} 
        </Typography>
        <Box>
            <Button onClick={() => router.push(`/weighting-schemes/${schemeId}`)} sx={{ mr: 1 }} disabled={saving}>
                Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || saving}>
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
        </Box>
      </Box>
      
      {saveErrorAlert}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <TextField
                    name="name"
                    label="Scheme Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{mb:2}}
                    disabled={saving}
                />
            </Grid>
            <Grid item xs={12} md={4} sx={{display: 'flex', alignItems: 'center'}}>
                 <FormControlLabel
                    control={<Checkbox name="isDefault" checked={formData.isDefault} onChange={handleInputChange} disabled={saving} />}
                    label="Set as Default Scheme"
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    name="description"
                    label="Description (Optional)"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={saving}
                />
            </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          Category & Dimension Weights (Editing UI - TBD)
        </Typography>

        {scheme.categoryWeights.length === 0 && (
          <Typography sx={{my: 2}}>No categories and dimensions are currently weighted for this scheme. Editing weights will be enabled once categories/dimensions exist.</Typography>
        )}

        <List disablePadding>
          {formData.categoryWeights.map((cw, categoryIndex) => {
            const totalDimensionWeight = cw.dimensionWeights.reduce((sum, dw) => sum + (parseFloat(dw.weight as any) || 0), 0);
            return (
              <React.Fragment key={cw.categoryId}>
                <ListItem sx={{ py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'} }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <ListItemText 
                      primary={cw.categoryName}
                      primaryTypographyProps={{variant: 'h6'}}
                      sx={{mb: {xs: 1, sm: 0}}}
                    />
                    <TextField
                      label="Category Weight"
                      type="number"
                      value={cw.weight}
                      onChange={(e) => handleCategoryWeightChange(categoryIndex, e.target.value)}
                      sx={{ width: {xs: '100%', sm:120}, ml: {sm: 2} }}
                      InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                      disabled={saving}
                      size="small"
                    />
                  </Box>
                </ListItem>
                {cw.dimensionWeights.length > 0 && (
                  <List disablePadding sx={{ pl: {xs: 2, sm:4}, pt:1, pb:1, backgroundColor: 'rgba(0,0,0,0.02)', borderLeft: '2px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{pl:2, pt:1, pb:0.5, fontWeight:'medium'}}>Dimensions within {cw.categoryName}:</Typography>
                    <Box sx={{pl:2, pb:1, fontSize:'0.95em', color:'text.secondary', fontWeight:500}}>Dimension Weight</Box>
                    {cw.dimensionWeights.map((dw, dimensionIndex) => (
                      <ListItem key={dw.dimensionId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, flexDirection: {xs: 'column', sm: 'row'} }}>
                        <ListItemText 
                          primary={dw.dimensionName} 
                          sx={{flexGrow: 1, mb: {xs: 0.5, sm:0}} }
                        />
                        <TextField
                          type="number"
                          value={dw.weight}
                          onChange={(e) => handleDimensionWeightChange(categoryIndex, dimensionIndex, e.target.value)}
                          sx={{ width: {xs: '100%', sm:120}, ml: {sm: 2} }}
                          InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                          disabled={saving}
                          size="small"
                        />
                      </ListItem>
                    ))}
                    <Box sx={{pl:2, pt:1, fontWeight:600, color:'primary.main'}}>Total Dimension Weight: {(totalDimensionWeight * 100).toFixed(1)}%</Box>
                  </List>
                )}
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
        {/* Grand Total */}
        <Box sx={{mt:3, textAlign:'right', fontWeight:700, fontSize:'1.1em', color:'primary.main'}}>
          Grand Total (Sum of Category Weights): {(formData.categoryWeights.reduce((sum, cw) => sum + (parseFloat(cw.weight as any) || 0), 0) * 100).toFixed(1)}%
        </Box>
      </Paper>
    </Box>
  );
} 