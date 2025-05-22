'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Slider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  dimensions: Dimension[];
}

interface Dimension {
  id: string;
  name: string;
}

interface CategoryWeight {
  id: string;
  weight: number;
  categoryId: string;
  category: Category;
  dimensionWeights: DimensionWeight[];
}

interface DimensionWeight {
  id: string;
  weight: number;
  dimensionId: string;
  dimension: Dimension;
}

interface WeightingScheme {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  categoryWeights: CategoryWeight[];
}

export default function EditWeightingSchemePage() {
  const { schemeId } = useParams() as { schemeId: string };
  const router = useRouter();
  const [scheme, setScheme] = useState<WeightingScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState<{
    [categoryId: string]: {
      weight: number;
      dimensions: { [dimensionId: string]: number };
    };
  }>({});

  useEffect(() => {
    fetchScheme();
  }, [schemeId]);

  const fetchScheme = async () => {
    try {
      const response = await fetch(`/api/weighting-schemes/${schemeId}`);
      if (!response.ok) throw new Error('Failed to fetch weighting scheme');
      const data = await response.json();
      setScheme(data);
      
      // Initialize weights state
      const initialWeights: any = {};
      data.categoryWeights.forEach((cw: CategoryWeight) => {
        initialWeights[cw.category.id] = {
          weight: cw.weight,
          dimensions: {},
        };
        cw.dimensionWeights.forEach((dw: DimensionWeight) => {
          initialWeights[cw.category.id].dimensions[dw.dimension.id] = dw.weight;
        });
      });
      setWeights(initialWeights);
    } catch (error) {
      setError('Failed to load weighting scheme');
      toast.error('Failed to load weighting scheme');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryWeightChange = (categoryId: string, newValue: number) => {
    setWeights(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        weight: newValue,
      },
    }));
  };

  const handleDimensionWeightChange = (categoryId: string, dimensionId: string, newValue: number) => {
    setWeights(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        dimensions: {
          ...prev[categoryId].dimensions,
          [dimensionId]: newValue,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate that category weights sum to 1
      const categorySum = Object.values(weights).reduce((sum, cat) => sum + cat.weight, 0);
      if (Math.abs(categorySum - 1) > 0.01) {
        toast.error('Category weights must sum to 1');
        return;
      }

      // Validate that dimension weights within each category sum to 1
      for (const categoryId in weights) {
        const dimensionSum = Object.values(weights[categoryId].dimensions).reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(dimensionSum - 1) > 0.01) {
          toast.error(`Dimension weights in category must sum to 1`);
          return;
        }
      }

      // Update weights
      const response = await fetch(`/api/weighting-schemes/${schemeId}/weights`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weights }),
      });

      if (!response.ok) throw new Error('Failed to update weights');
      
      toast.success('Weights updated successfully');
      router.push('/weighting-schemes');
    } catch (error) {
      toast.error('Failed to update weights');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !scheme) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Failed to load weighting scheme'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/weighting-schemes')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Weights: {scheme.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {scheme.categoryWeights.map((categoryWeight) => (
        <Paper key={categoryWeight.category.id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {categoryWeight.category.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Category Weight (0-1)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Slider
                value={weights[categoryWeight.category.id]?.weight || 0}
                onChange={(_, value) => handleCategoryWeightChange(categoryWeight.category.id, value as number)}
                min={0}
                max={1}
                step={0.01}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                value={weights[categoryWeight.category.id]?.weight.toFixed(2) || '0.00'}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 1) {
                    handleCategoryWeightChange(categoryWeight.category.id, value);
                  }
                }}
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                sx={{ width: 100 }}
              />
            </Box>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Dimension Weights
          </Typography>
          {categoryWeight.dimensionWeights.map((dimensionWeight) => (
            <Box key={dimensionWeight.dimension.id} sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                {dimensionWeight.dimension.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Slider
                  value={weights[categoryWeight.category.id]?.dimensions[dimensionWeight.dimension.id] || 0}
                  onChange={(_, value) => handleDimensionWeightChange(
                    categoryWeight.category.id,
                    dimensionWeight.dimension.id,
                    value as number
                  )}
                  min={0}
                  max={1}
                  step={0.01}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  value={weights[categoryWeight.category.id]?.dimensions[dimensionWeight.dimension.id]?.toFixed(2) || '0.00'}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 1) {
                      handleDimensionWeightChange(
                        categoryWeight.category.id,
                        dimensionWeight.dimension.id,
                        value
                      );
                    }
                  }}
                  type="number"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
          ))}
        </Paper>
      ))}
    </Box>
  );
} 