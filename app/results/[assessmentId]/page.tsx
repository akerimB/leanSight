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
  Chip
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Score {
  dimensionId: string;
  level: number;
  dimensionName: string;
}

interface WeightingSchemeBasic {
    id: string;
    name: string;
}

interface AssessmentDetails {
  id: string;
  companyName: string;
  departmentName: string | null;
  status: string;
  updatedAt: string;
  scores: Score[];
  weightingScheme: WeightingSchemeBasic | null;
  weightedAverageScore: number | null;
  calculationUsed: 'weighted' | 'raw_average' | 'no_scores' | null;
}

export default function AssessmentResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    if (params && params.assessmentId) {
      setAssessmentId(params.assessmentId as string);
    } else if (params === null) {
        setError("Assessment ID not found in URL.");
        setLoading(false);
    }
  }, [params]);

  const fetchAssessmentDetails = useCallback(async () => {
    if (!assessmentId) {
        if (!error) setError("Assessment ID is required to fetch details.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/assessments?id=${assessmentId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch assessment details');
      }
      const data = await response.json();
      const transformedData: AssessmentDetails = {
        id: data.id,
        companyName: data.company?.name || 'N/A',
        departmentName: data.department?.name || 'Company-Wide',
        status: data.status,
        updatedAt: new Date(data.updatedAt).toLocaleString(),
        scores: data.scores?.map((s: any) => ({
          dimensionId: s.dimensionId,
          level: s.level,
          dimensionName: s.dimension?.name || 'Unknown Dimension'
        })) || [],
        weightingScheme: data.weightingScheme ? { id: data.weightingScheme.id, name: data.weightingScheme.name } : null,
        weightedAverageScore: data.weightedAverageScore,
        calculationUsed: data.calculationUsed,
      };
      setAssessment(transformedData);
    } catch (err: any) {
      console.error('Failed to fetch assessment details:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load assessment details.');
    } finally {
      setLoading(false);
    }
  }, [assessmentId, error]);

  useEffect(() => {
    if(assessmentId){
        fetchAssessmentDetails();
    }
  }, [assessmentId, fetchAssessmentDetails]);

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
        <Alert severity="error" action={assessmentId ? <Button onClick={fetchAssessmentDetails}>Retry</Button> : undefined}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Assessment data could not be loaded or found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>
        &larr; Back to Results List
      </Button>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" gutterBottom sx={{mb:0}}>
            Assessment Details: {assessment.id}
            </Typography>
            <Box>
              <Button variant="outlined" onClick={() => router.push('/analytics')} sx={{ mr: 1 }}>
                  View Overall Analytics
              </Button>
              <Button variant="contained" onClick={() => window.location.href = `/api/assessments/${assessmentId}/download`}>
                  Download as PDF
              </Button>
            </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                <Typography variant="subtitle1"><strong>Company:</strong> {assessment.companyName}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                <Typography variant="subtitle1"><strong>Department/Scope:</strong> {assessment.departmentName}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                <Typography variant="subtitle1"><strong>Status:</strong> 
                    <Chip 
                        label={assessment.status} 
                        color={assessment.status === 'DRAFT' ? 'warning' : assessment.status === 'SUBMITTED' ? 'info' : assessment.status === 'REVIEWED' ? 'success' : 'default'}
                        size="small"
                        sx={{ ml: 1 }}
                    />
                </Typography>
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
                <Typography variant="subtitle1"><strong>Last Updated:</strong> {assessment.updatedAt}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
                <Typography variant="subtitle1"><strong>Weighting Scheme:</strong> {assessment.weightingScheme?.name || 'None Applied'}</Typography>
            </Box>
            {assessment.weightedAverageScore !== null && (
              <Box sx={{ flex: '1 1 100%', mt: 1, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h6" component="div">
                  Overall Maturity Score: {assessment.weightedAverageScore.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Calculated: {assessment.calculationUsed === 'weighted' ? 'Weighted Average' : assessment.calculationUsed === 'raw_average' ? 'Raw Average' : 'N/A'})
                  {assessment.calculationUsed === 'raw_average' && !assessment.weightingScheme && ' - No weighting scheme applied'}
                  {assessment.calculationUsed === 'raw_average' && assessment.weightingScheme && ' - Scheme applied, but resulted in raw average (e.g., no matching dimensions/weights)'}
                </Typography>
              </Box>
            )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Scores
        </Typography>
        {assessment.scores.length > 0 ? (
            <List dense>
            {assessment.scores.map((score, index) => (
                <ListItem key={index} divider>
                <ListItemText 
                    primary={`Dimension: ${score.dimensionName}`}
                    secondary={`Level: ${score.level}`}
                />
                </ListItem>
            ))}
            </List>
        ) : (
            <Typography>No scores submitted for this assessment.</Typography>
        )}
      </Paper>
    </Box>
  );
} 