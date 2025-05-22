'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import prisma from '@/lib/prisma';
import { toast } from 'sonner';

interface Descriptor { id: string; level: number; description: string }
interface Dimension { id: string; name: string; descriptors: Descriptor[] }
interface Category { id: string; name: string; dimensions: Dimension[] }

interface WeightingScheme {
  id: string;
  name: string;
}

export default function AssessmentDetailPage() {
  const { assessmentId } = useParams() as { assessmentId: string };
  const router = useRouter();
  const { data: session, status } = useSession({ required: true });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [template, setTemplate] = useState<Category[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [statusValue, setStatusValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const [availableSchemes, setAvailableSchemes] = useState<WeightingScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [schemeUpdating, setSchemeUpdating] = useState(false);

  // State for calculated scores
  const [calculatedScores, setCalculatedScores] = useState<{
    overallScore: number;
    categoryScores: Record<string, { name: string; score: number; weight: number; possibleScore: number; percentage: number; dimensions: Record<string, { name: string; score: number; weight: number; level: number; possibleScore: number; percentage: number; }>}>;
  } | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      if (status !== 'authenticated') return;
      
      setLoading(true);
      setError(null);
      try {
        // Fetch assessment
        const assessmentRes = await fetch(`/api/assessments?id=${assessmentId}`);
        if (!assessmentRes.ok) throw new Error('Failed to load assessment');
        const assessmentData = await assessmentRes.json();
        setAssessment(assessmentData);
        setStatusValue(assessmentData.status);
        setSelectedSchemeId(assessmentData.weightingSchemeId || '');

        // Set answers map
        const ansMap: Record<string, number> = {};
        (assessmentData.scores || []).forEach((s: any) => ansMap[s.dimensionId] = s.level);
        setAnswers(ansMap);

        // Fetch template
        const query = assessmentData.departmentId 
            ? `departmentId=${assessmentData.departmentId}` 
            : `companyId=${assessmentData.company.id}`;
        const tmplRes = await fetch(`/api/assessment-template?${query}`);
        if (!tmplRes.ok) throw new Error('Failed to load assessment template');
        const tmpl = await tmplRes.json();
        setTemplate(tmpl);

        // Fetch available weighting schemes if user is Admin or Expert
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'EXPERT') {
          const schemesRes = await fetch('/api/weighting-schemes');
          if (!schemesRes.ok) throw new Error('Failed to load weighting schemes');
          const schemesData = await schemesRes.json();
          setAvailableSchemes(schemesData || []);
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message);
        toast.error(err.message || "Failed to load page data");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [assessmentId, status, session]);

  useEffect(() => {
    if (assessment && template.length > 0) {
      calculateAndSetScores(assessment, template);
    }
    // Recalculate when assessment (specifically its scheme or scores) or template changes
  }, [assessment, template]);

  const calculateAndSetScores = (currentAssessment: any, currentTemplate: Category[]) => {
    if (!currentAssessment || !currentTemplate || currentTemplate.length === 0) {
      setCalculatedScores(null);
      return;
    }

    let overallAssessmentScore = 0;
    const newCategoryScores: Record<string, { name: string; score: number; weight: number; possibleScore: number; percentage: number; dimensions: Record<string, { name: string; score: number; weight: number; level:number; possibleScore: number; percentage: number; }> }> = {};

    const schemeToUse = currentAssessment.weightingScheme;
    const rawScoresMap: Record<string, number> = {};
    (currentAssessment.scores || []).forEach((s: any) => {rawScoresMap[s.dimensionId] = s.level;});

    const totalCategories = currentTemplate.length;
    const evenCategoryWeight = totalCategories > 0 ? 1 / totalCategories : 0;

    currentTemplate.forEach(category => {
      let categoryWeightedScore = 0;
      let categoryTotalPossibleScore = 0;
      const categoryDetails = {
        name: category.name,
        score: 0,
        weight: evenCategoryWeight,
        possibleScore: 0,
        percentage: 0,
        dimensions: {} as Record<string, { name: string; score: number; weight: number; level:number; possibleScore: number; percentage: number; }>
      };

      const categoryWeightFromScheme = schemeToUse?.categoryWeights?.find((cw: any) => cw.categoryId === category.id);
      categoryDetails.weight = categoryWeightFromScheme ? categoryWeightFromScheme.weight : evenCategoryWeight;

      const totalDimensionsInCategory = category.dimensions.length;
      const evenDimensionWeight = totalDimensionsInCategory > 0 ? 1 / totalDimensionsInCategory : 0;

      category.dimensions.forEach(dimension => {
        const rawLevel = rawScoresMap[dimension.id] || 0; // Default to 0 if no score
        const maxLevel = 5; // Assuming max level is 5 for a dimension

        let dimensionWeightInCat = evenDimensionWeight;
        if (categoryWeightFromScheme && schemeToUse) {
          const dimWeightFromScheme = categoryWeightFromScheme.dimensionWeights?.find((dw: any) => dw.dimensionId === dimension.id);
          dimensionWeightInCat = dimWeightFromScheme ? dimWeightFromScheme.weight : evenDimensionWeight;
        }
        
        const weightedDimensionScore = rawLevel * dimensionWeightInCat;
        const possibleDimensionScore = maxLevel * dimensionWeightInCat;

        categoryDetails.dimensions[dimension.id] = {
            name: dimension.name,
            score: weightedDimensionScore,
            weight: dimensionWeightInCat,
            level: rawLevel,
            possibleScore: possibleDimensionScore,
            percentage: possibleDimensionScore > 0 ? (weightedDimensionScore / possibleDimensionScore) * 100 : 0,
        };

        categoryWeightedScore += weightedDimensionScore;
        categoryTotalPossibleScore += possibleDimensionScore;
      });

      categoryDetails.score = categoryWeightedScore;
      categoryDetails.possibleScore = categoryTotalPossibleScore;
      categoryDetails.percentage = categoryTotalPossibleScore > 0 ? (categoryWeightedScore / categoryTotalPossibleScore) * 100 : 0;
      
      newCategoryScores[category.id] = categoryDetails;
      overallAssessmentScore += categoryDetails.score * categoryDetails.weight; // Score of category * weight of category
    });

    setCalculatedScores({
      overallScore: overallAssessmentScore * 20, // To scale to 100 if overall is sum of 0-5 scores * weights
      categoryScores: newCategoryScores,
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!assessment) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assessmentId, status: newStatus }),
      });
      if (!res.ok) {
        const d = await res.json(); throw new Error(d.message || 'Failed to update status');
      }
      setStatusValue(newStatus);
      toast.success(`Assessment status updated to ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSchemeChange = async (event: SelectChangeEvent<string>) => {
    const newSchemeId = event.target.value;
    if (!assessment || newSchemeId === selectedSchemeId) return;

    setSchemeUpdating(true);
    setSelectedSchemeId(newSchemeId); // Optimistically update UI

    try {
      const response = await fetch(`/api/assessments`, { // Assuming PUT /api/assessments handles this
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: assessmentId, 
            weightingSchemeId: newSchemeId === '' ? null : newSchemeId // Send null if unselected
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Revert optimistic update if error
        setSelectedSchemeId(assessment.weightingSchemeId || ''); 
        throw new Error(errorData.message || 'Failed to update weighting scheme');
      }
      
      // Update local assessment state if necessary, or rely on a page refresh/re-fetch
      const updatedAssessment = { ...assessment, weightingSchemeId: newSchemeId === '' ? null : newSchemeId };
      // If weighting scheme is removed, we might need to clear assessment.weightingScheme for calculation
      if(newSchemeId === '') {
        updatedAssessment.weightingScheme = null;
      } else {
        // For optimistic update of calculated scores, we'd ideally refetch the scheme details
        // For now, we'll rely on the main useEffect to recalculate when assessment (which includes scheme) changes from a full fetch if needed
        // OR, fetch the scheme here and attach it to updatedAssessment before calling calculateAndSetScores
        const schemeData = availableSchemes.find(s => s.id === newSchemeId);
        if (schemeData && schemeData.id) { // A full scheme object is not available here, only id and name
            // To properly update scores optimistically with new scheme, we need the full scheme object
            // This requires fetching it: const fullScheme = await fetch(`/api/weighting-schemes/${newSchemeId}`).then(res => res.json());
            // For now, the useEffect dependency on `assessment` will trigger recalc on next full load.
            // To make it more immediate for optimistic UI:
            // 1. Fetch full scheme here.
            // 2. Attach to `updatedAssessment.weightingScheme`
            // 3. Call `calculateAndSetScores(updatedAssessment, template);`
            // This is an example of how you might do it:
            try {
                const fullSchemeRes = await fetch(`/api/weighting-schemes/${newSchemeId}`);
                if (fullSchemeRes.ok) {
                    updatedAssessment.weightingScheme = await fullSchemeRes.json();
                }
            } catch (e) { console.error("Failed to fetch full scheme for optimistic score update", e);}
        }
      }
      setAssessment(updatedAssessment);
      // calculateAndSetScores(updatedAssessment, template); // Recalculate with potentially new scheme
      toast.success('Weighting scheme updated successfully.');
      // Potentially trigger re-calculation of scores if they are displayed and affected by scheme

    } catch (error: any) {
      console.error('Failed to update weighting scheme:', error);
      toast.error(error.message || 'Failed to update weighting scheme');
      // Revert optimistic update on error
      setSelectedSchemeId(assessment.weightingSchemeId || '');
    } finally {
      setSchemeUpdating(false);
    }
  };

  if (status === 'loading' || loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!session) return null;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!assessment) return <Alert severity="warning">Assessment not found</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ flexGrow: 1, mb: { xs: 1, sm: 0} }}>Assessment Details</Typography>
        
        {(session?.user.role === 'ADMIN' || session?.user.role === 'EXPERT') && availableSchemes.length > 0 && (
          <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <InputLabel id="weighting-scheme-select-label">Weighting Scheme</InputLabel>
            <Select
              labelId="weighting-scheme-select-label"
              id="weighting-scheme-select"
              value={selectedSchemeId}
              label="Weighting Scheme"
              onChange={handleSchemeChange}
              disabled={schemeUpdating || updating}
            >
              <MenuItem value="">
                <em>None (Use Default/Even Weights)</em>
              </MenuItem>
              {availableSchemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Typography variant="subtitle1" sx={{ mr: 2, ml: {sm: 2}, order: {xs: -1, sm: 0} }}>Status: {statusValue}</Typography>
        {session?.user.role === 'ADMIN' && statusValue === 'SUBMITTED' && (
          <Button variant="contained" onClick={() => handleStatusChange('REVIEWED')} disabled={updating || schemeUpdating}>
            Mark Reviewed
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Display Calculated Scores */}
      {calculatedScores && (
        <Card sx={{ mb: 3, p:2, backgroundColor: '#f9f9f9' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Assessment Results (Overall: {calculatedScores.overallScore.toFixed(2)} / 100)
            </Typography>
            {Object.values(calculatedScores.categoryScores).map(catScore => (
              <Box key={catScore.name} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '4px' }}>
                <Typography variant="h6">
                  {catScore.name} (Weight: {(catScore.weight * 100).toFixed(0)}%)
                  - Score: {catScore.score.toFixed(2)} / {catScore.possibleScore.toFixed(2)} ({catScore.percentage.toFixed(1)}%)
                </Typography>
                {Object.values(catScore.dimensions).map(dimScore => (
                  <Box key={dimScore.name} sx={{ pl: 2, pt: 1, display: 'flex', justifyContent:'space-between' }}>
                    <Typography variant="body2">
                        {dimScore.name} (Selected Level: {dimScore.level}) 
                        (Weight in Cat: {(dimScore.weight * 100).toFixed(0)}%)
                    </Typography>
                    <Typography variant="body2">
                        Weighted Score: {dimScore.score.toFixed(2)} / {dimScore.possibleScore.toFixed(2)} ({dimScore.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {template.map((category) => (
        <Box key={category.id} sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>{category.name}</Typography>
          {category.dimensions.map((dim) => (
            <Card key={dim.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>{dim.name}</Typography>
                <RadioGroup value={answers[dim.id]?.toString() || ''}>
                  {dim.descriptors.map((desc) => (
                    <FormControlLabel
                      key={desc.id}
                      value={desc.level.toString()}
                      control={<Radio disabled />}
                      label={desc.description}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </Box>
      ))}

      <Button variant="outlined" onClick={() => router.push('/assessment')}>
        Back to Wizard
      </Button>
    </Box>
  );
} 