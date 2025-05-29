'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Pagination,
  TextField,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';
import EvidenceUpload from '@/app/components/EvidenceUpload';
import HoverRevealText from '@/components/HoverRevealText';

interface Company {
  id: string;
  name: string;
  departments: { id: string; name: string }[];
}
interface Descriptor {
  id: string;
  level: number;
  description: string;
}
interface Dimension {
  id: string;
  name: string;
  description: string;
  descriptors: Descriptor[];
}
interface Category {
  id: string;
  name: string;
  dimensions: Dimension[];
}

interface WeightingSchemeBasic {
  id: string;
  name: string;
  isDefault?: boolean;
}

const steps = ['Select Company, Department & Scheme', 'Assessment Questions', 'Review & Submit'];

export default function AssessmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { router.push('/auth/signin'); },
  });

  // Parse URL query parameters for direct links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const idParam = urlParams.get('id');
      
      console.log('URL parameters:', { tab: tabParam, id: idParam });
      
      // Set tab if specified in URL
      if (tabParam === 'past') {
        setTab('past');
        console.log('Setting tab to "past"');
      }
      
      // Load specific assessment if ID is provided
      if (idParam) {
        console.log(`Attempting to resume assessment with ID: ${idParam}`);
        handleResume(idParam);
      }
    }
  }, []);

  // State for draft assessment and past assessments
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [pastAssessments, setPastAssessments] = useState<any[]>([]);
  const [pastLoading, setPastLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = pastAssessments.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.company.name.toLowerCase().includes(term) ||
      (a.department?.name ?? 'company-wide').toLowerCase().includes(term) ||
      a.status.toLowerCase().includes(term)
    );
  });
  const pagedAssessments = filtered.slice((page - 1) * pageSize, page * pageSize);

  const [activeStep, setActiveStep] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [template, setTemplate] = useState<Category[]>([]);
  const [availableWeightingSchemes, setAvailableWeightingSchemes] = useState<WeightingSchemeBasic[]>([]);
  const [selectedWeightingSchemeId, setSelectedWeightingSchemeId] = useState<string>('');
  const [loadingWeightingSchemes, setLoadingWeightingSchemes] = useState<boolean>(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false);
  const [tab, setTab] = useState<'new' | 'past'>('new');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAssessmentId, setEditAssessmentId] = useState<string | null>(null);
  const [editAssessmentStatus, setEditAssessmentStatus] = useState<string | null>(null);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAssessmentId, setDeleteAssessmentId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State for evidence upload
  const [selectedEvidenceDimension, setSelectedEvidenceDimension] = useState<string | null>(null);

  // Add a state for the warning dialog about incomplete answers
  const [incompleteWarningOpen, setIncompleteWarningOpen] = useState(false);

  // Load past assessments list
  useEffect(() => {
    if (status === 'authenticated') {
      setPastLoading(true);
      fetch('/api/assessments', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load past assessments'))
        .then(data => setPastAssessments(data))
        .catch(err => console.error(err))
        .finally(() => setPastLoading(false));
    }
  }, [status]);

  // Load companies and their departments
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // Load companies directly without extra validation
      setCompaniesLoading(true);
      fetch('/api/admin/companies', { credentials: 'include' })
        .then((res) => {
          if (!res.ok) {
            // If unauthorized, session might be invalid
            if (res.status === 401) {
              console.error('Session appears to be invalid, redirecting to login');
              signOut({ callbackUrl: '/auth/signin?error=Session+expired.+Please+sign+in+again.' });
              return Promise.reject('Unauthorized');
            }
            return Promise.reject('Failed to load companies');
          }
          return res.json();
        })
        .then((data) => setCompanies(data))
        .catch((err) => {
          if (err !== 'Unauthorized') {
            setError(String(err));
          }
        })
        .finally(() => setCompaniesLoading(false));

      // Fetch weighting schemes
      setLoadingWeightingSchemes(true);
      fetch('/api/weighting-schemes', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load weighting schemes'))
        .then((data: WeightingSchemeBasic[]) => {
          setAvailableWeightingSchemes(data || []);
          // Pre-select the default scheme if one exists and none is selected yet
          const defaultScheme = data?.find(s => s.isDefault);
          if (defaultScheme && !selectedWeightingSchemeId) {
            setSelectedWeightingSchemeId(defaultScheme.id);
          }
        })
        .catch(err => {
          console.error('Error fetching weighting schemes:', err);
          toast.error('Failed to load weighting schemes for selection.');
        })
        .finally(() => setLoadingWeightingSchemes(false));
    }
  }, [status, session]);

  // Fetch template when moving to questions step
  useEffect(() => {
    if (activeStep === 1) {
      setTemplateLoading(true);
      setError(''); // Clear any previous errors
      const queryParam = selectedDepartment === 'all'
        ? `companyId=${selectedCompany}`
        : `departmentId=${selectedDepartment}`;
      fetch(`/api/assessment-template?${queryParam}`, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) {
            return res.json().then(errorData => {
              console.error('Template fetch error:', errorData);
              throw new Error(errorData.error || 'Failed to load assessment template');
            });
          }
          return res.json();
        })
        .then((data) => {
          setTemplate(data);
          // Check if template is empty or has dimensions without descriptors
          if (!data || data.length === 0) {
            setError('No assessment template available for this company or department. Please contact your administrator.');
            return;
          }
          
          // Check if there are categories with dimensions
          const hasDimensions = data.some((category: Category) => 
            category.dimensions && category.dimensions.length > 0
          );
          
          if (!hasDimensions) {
            setError('No dimensions available for assessment. Please contact your administrator.');
            return;
          }
          
          // Check if dimensions have descriptors
          const hasDescriptors = data.some((category: Category) => 
            category.dimensions && 
            category.dimensions.some((dim: Dimension) => 
              dim.descriptors && dim.descriptors.length > 0
            )
          );
          
          if (!hasDescriptors) {
            setError('No maturity level descriptions available for assessment. Please contact your administrator.');
            return;
          }
        })
        .catch((err) => {
          console.error('Error loading template:', err);
          setError(err.message || 'Failed to load assessment template. Please try again or contact support.');
        })
        .finally(() => setTemplateLoading(false));
    }
  }, [activeStep, selectedDepartment, selectedCompany]);

  const handleAnswerChange = (dimensionId: string, level: number) => {
    const newAnswers = { ...answers, [dimensionId]: level };
    setAnswers(newAnswers);
    // Debounced auto-save
    if (assessmentId) {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
      autosaveRef.current = setTimeout(() => {
        fetch('/api/assessments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: assessmentId, answers: Object.entries(newAnswers).map(([dimensionId, lvl]) => ({ dimensionId, level: lvl })) }),
        }).catch(err => console.error('Autosave failed', err));
      }, 1000);
    }
  };

  const handleNext = async () => {
    setError('');
    // Validation
    if (activeStep === 0 && (!selectedCompany || !selectedDepartment)) {
      setError('Please select both a company and a department'); return;
    }
    
    // Create draft on step 0 when moving to questions
    if (activeStep === 0 && !assessmentId) {
      try {
        setLoading(true);
        // For company-wide assessments, we explicitly set departmentId to null
        const departmentId = selectedDepartment === 'all' ? null : selectedDepartment;
        
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            companyId: selectedCompany, 
            departmentId, 
            draft: true,
            weightingSchemeId: selectedWeightingSchemeId || null,
          }),
        });

        if (!res.ok) { 
          const errorData = await res.json().catch(() => ({}));
          let errorMessage = errorData.error || 'Failed to start assessment';
          
          // Provide more user-friendly errors for specific cases
          if (errorMessage.includes('Invalid reference') || errorMessage.includes('do not exist')) {
            errorMessage = 'There appears to be a configuration issue with the selected company or department. Please try another selection or contact your administrator.';
          }
          
          throw new Error(errorMessage); 
        }
        
        const data = await res.json();
        if (!data.id) {
          throw new Error('Invalid response from server');
        }
        setAssessmentId(data.id);
        setActiveStep((prev) => prev + 1);
      } catch (err: any) {
        console.error('Error creating assessment:', err);
        setError(err.message || 'Failed to create assessment');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Submit on step 1 (now the questions step)
    if (activeStep === 1) {
      // Check if we have any answers to submit
      if (Object.keys(answers).length === 0) {
        setError('Please provide at least one answer before submitting.');
        return;
      }
      
      // Check if assessment is incomplete
      const totalDimensions = template.reduce((sum, cat) => sum + cat.dimensions.length, 0);
      const answeredDimensions = Object.keys(answers).length;
      
      // If answers are incomplete, show warning but allow proceeding
      if (answeredDimensions < totalDimensions) {
        setIncompleteWarningOpen(true);
        return;
      }
      
      await submitAssessment();
    }
    
    // If we're on the last step or any other step not handled above
    setActiveStep((prev) => prev + 1);
  };

  // Extracted the submission logic to a separate function
  const submitAssessment = async () => {
    setLoading(true);
    try {
      const departmentId = selectedDepartment === 'all' ? null : selectedDepartment;
      const answersArray = Object.entries(answers).map(([dimensionId, level]) => ({ 
        dimensionId, 
        level 
      }));

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          companyId: selectedCompany,
          departmentId,
          answers: answersArray,
          weightingSchemeId: selectedWeightingSchemeId || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errorMessage = errorData.error || 'Submission failed';
        
        if (errorMessage.includes('Invalid reference') || 
            errorMessage.includes('do not exist') || 
            errorMessage.includes('dimensions are no longer available')) {
          errorMessage = 'There appears to be a configuration issue with the selected dimensions. This may happen if the assessment template was changed after you started. Please go back and try again with a new assessment.';
        }
        
        throw new Error(errorMessage);
      }
      
      setSuccess(true);
      setActiveStep((prev) => prev + 1);
    } catch (err: any) {
      console.error('Error submitting assessment:', err);
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle continuing with incomplete answers
  const handleContinueIncomplete = () => {
    setIncompleteWarningOpen(false);
    submitAssessment();
  };

  // Function to cancel and continue editing
  const handleCancelIncomplete = () => {
    setIncompleteWarningOpen(false);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Resume past assessment
  const handleResume = async (id: string) => {
    try {
      console.log(`handleResume called with id: ${id}`);
      const res = await fetch(`/api/assessments?id=${id}`, { credentials: 'include' });
      
      if (!res.ok) {
        console.error(`Failed to load assessment: ${res.status} ${res.statusText}`);
        throw new Error('Failed to load assessment');
      }
      
      const data = await res.json();
      console.log('Assessment data loaded:', { 
        companyId: data.company?.id,
        departmentId: data.departmentId,
        status: data.status,
        scoreCount: data.scores?.length
      });
      
      setSelectedCompany(data.company.id);
      setSelectedDepartment(data.departmentId ?? 'all');
      const loaded: Record<string, number> = {};
      (data.scores || []).forEach((s: any) => { loaded[s.dimensionId] = s.level; });
      setAnswers(loaded);
      setAssessmentId(id);
      setActiveStep(1);
      setTab('new'); // Switch to the assessment editing view
      console.log('Assessment resumed successfully, tab set to "new", moving to step 1');
    } catch (err: any) {
      console.error('Error resuming assessment:', err);
      setError('Failed to resume assessment');
    }
  };

  // Enhanced resume/edit handler with confirmation for submitted
  const handleEdit = (id: string, status: string) => {
    if (status === 'SUBMITTED') {
      setEditAssessmentId(id);
      setEditAssessmentStatus(status);
      setEditDialogOpen(true);
    } else {
      // For DRAFT status, directly resume without confirmation
      handleResume(id);
    }
  };

  const confirmEdit = () => {
    if (editAssessmentId) {
      handleResume(editAssessmentId);
    }
    setEditDialogOpen(false);
    setEditAssessmentId(null);
    setEditAssessmentStatus(null);
  };

  const cancelEdit = () => {
    setEditDialogOpen(false);
    setEditAssessmentId(null);
    setEditAssessmentStatus(null);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteAssessmentId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteAssessmentId(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteAssessment = async () => {
    if (!deleteAssessmentId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/assessments?id=${deleteAssessmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete assessment');
      }
      toast.success('Assessment deleted successfully');
      // Refresh past assessments list
      setPastAssessments(prev => prev.filter(assess => assess.id !== deleteAssessmentId));
      closeDeleteDialog();
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      toast.error(error.message || 'Failed to delete assessment');
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || (!session && status === 'authenticated')) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!session) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Lean Maturity Assessment</Typography>
      
      {/* Tab selection for new or past assessments */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} aria-label="assessment tabs">
          <Tab label="New Assessment" value="new" />
          <Tab label="Past Assessments" value="past" />
        </Tabs>
      </Paper>

      {tab === 'new' ? (
        // New Assessment Flow
        <>
          <Paper sx={{ p: 3, mb: 1 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>
          </Paper>
          <Typography variant="subtitle2" align="center" sx={{ mb: 2 }}>
            {`Step ${activeStep + 1} of ${steps.length}`}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Step 0: Company & Department selection */}
          {activeStep === 0 && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Select Target</Typography>
              <FormControl fullWidth sx={{ mb: 2 }} disabled={companiesLoading}>
                <InputLabel id="company-select-label">Company</InputLabel>
                <Select
                  labelId="company-select-label"
                  value={selectedCompany}
                  label="Company"
                  onChange={(e) => {
                    setSelectedCompany(e.target.value as string);
                    setSelectedDepartment(''); // Reset department on company change
                  }}
                >
                  {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>

              {selectedCompany && (
                <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCompany || companiesLoading}>
                  <InputLabel id="department-select-label">Department (or Company-Wide)</InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={selectedDepartment}
                    label="Department (or Company-Wide)"
                    onChange={(e) => setSelectedDepartment(e.target.value as string)}
                  >
                    <MenuItem value="all"><em>Company-Wide Assessment</em></MenuItem>
                    {companies.find(c => c.id === selectedCompany)?.departments?.map((d) => (
                      <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {/* Weighting Scheme Selector */}
              <FormControl fullWidth sx={{ mb: 2 }} disabled={loadingWeightingSchemes}>
                <InputLabel id="weighting-scheme-select-label">Weighting Scheme (Optional)</InputLabel>
                <Select
                  labelId="weighting-scheme-select-label"
                  value={selectedWeightingSchemeId}
                  label="Weighting Scheme (Optional)"
                  onChange={(e: SelectChangeEvent<string>) => setSelectedWeightingSchemeId(e.target.value)}
                >
                  <MenuItem value=""><em>None (Results will use even weights)</em></MenuItem>
                  {availableWeightingSchemes.map((scheme) => (
                    <MenuItem key={scheme.id} value={scheme.id}>
                      {scheme.name}{scheme.isDefault ? ' (Default)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </Paper>
          )}

          {activeStep === 1 && (
            templateLoading ? (
              Array(3).fill(null).map((_, i) => <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2 }} />)
            ) : error ? (
              <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={handleBack}>Back</Button>
              </Paper>
            ) : template.length === 0 || !template.some((category: Category) => category.dimensions && category.dimensions.length > 0) ? (
              <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No dimensions available for assessment in this company/department. 
                  This could be because the sector does not have maturity descriptors configured for its dimensions.
                </Alert>
                <Button variant="contained" onClick={handleBack}>Back</Button>
              </Paper>
            ) : (
              <Box>
                {/* Overall Progress Indicator */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">Overall Completion</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Object.keys(answers).length} of {template.reduce((sum, cat) => sum + cat.dimensions.length, 0)} questions answered
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={
                      (Object.keys(answers).length / template.reduce((sum, cat) => sum + cat.dimensions.length, 0)) * 100
                    } 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Paper>

                {template.map((category) => {
                  // Calculate per-category progress
                  const total = category.dimensions.length;
                  const answered = category.dimensions.filter(dim => answers[dim.id]).length;
                  return (
                    <Accordion
                      key={category.id}
                      expanded={expandedCategory === category.id}
                      onChange={(_, isExpanded) => setExpandedCategory(isExpanded ? category.id : false)}
                      sx={{ mb: 2 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">{category.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ flexGrow: 1 }} />
                          <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary" align="right">
                              {answered} / {total} answered
                            </Typography>
                            <Box sx={{ width: 120 }}>
                              <LinearProgress variant="determinate" value={total ? (answered / total) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                            </Box>
                          </Box>
                        </Box>
                        {category.dimensions.map((dim) => {
                          return (
                            <Accordion key={dim.id} sx={{ mb: 1 }}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1">{dim.name}</Typography>
                                    {dim.description && (
                                      <Typography variant="body2" color="text.secondary">{dim.description}</Typography>
                                    )}
                                  </Box>
                                  {answers[dim.id] ? (
                                    <Typography variant="caption" color="success.main">Level {answers[dim.id]}</Typography>
                                  ) : null}
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <Box component="thead">
                                    <Box component="tr">
                                      <Box component="th" sx={{ textAlign: 'left', p: 1, fontWeight: 600 }}>Level</Box>
                                      <Box component="th" sx={{ textAlign: 'left', p: 1, fontWeight: 600 }}>Description</Box>
                                    </Box>
                                  </Box>
                                  <Box component="tbody">
                                    {dim.descriptors.map((desc) => (
                                      <Box
                                        component="tr"
                                        key={desc.id}
                                        sx={{
                                          backgroundColor: answers[dim.id] === desc.level ? 'primary.light' : 'inherit',
                                          transition: 'background 0.2s',
                                        }}
                                        onClick={() => {
                                          if (answers[dim.id] === desc.level) {
                                            handleAnswerChange(dim.id, 0);
                                          } else {
                                            handleAnswerChange(dim.id, desc.level);
                                          }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        <Box component="td" sx={{ p: 1, width: 60 }}>
                                          <Radio
                                            checked={answers[dim.id] === desc.level}
                                            value={desc.level}
                                            onChange={() => {
                                              if (answers[dim.id] === desc.level) {
                                                handleAnswerChange(dim.id, 0);
                                              } else {
                                                handleAnswerChange(dim.id, desc.level);
                                              }
                                            }}
                                            color="primary"
                                          />
                                        </Box>
                                        <Box component="td" sx={{ p: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <Box sx={{ mr: 1 }}>
                                              <Chip 
                                                label={`Level ${desc.level}`} 
                                                size="small" 
                                                color={
                                                  desc.level === 1 ? 'error' :
                                                  desc.level === 2 ? 'warning' :
                                                  desc.level === 3 ? 'info' :
                                                  desc.level === 4 ? 'success' :
                                                  desc.level === 5 ? 'success' :
                                                  'default'
                                                }
                                                sx={{ mb: 1 }}
                                              />
                                            </Box>
                                          </Box>
                                          <HoverRevealText text={desc.description} maxLines={2} />
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
                
                {/* Only show evidence upload section if we have an assessmentId (assessment has been created in the backend) */}
                {assessmentId && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Evidence & Supporting Documents
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You can provide evidence and supporting documents for your assessment. This helps reviewers understand the basis for your scores.
                    </Typography>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Upload Evidence Documents</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Please select a dimension from the list below to add evidence for:
                        </Typography>
                        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '4px', mb: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel id="dimension-evidence-select-label">Select Dimension for Evidence</InputLabel>
                            <Select
                              labelId="dimension-evidence-select-label"
                              id="dimension-evidence-select"
                              value={selectedEvidenceDimension || ''}
                              onChange={(e) => setSelectedEvidenceDimension(e.target.value)}
                              label="Select Dimension for Evidence"
                            >
                              {template.flatMap(category => 
                                category.dimensions.map(dimension => (
                                  <MenuItem key={dimension.id} value={dimension.id}>
                                    {category.name} - {dimension.name}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        </Box>
                        
                        {selectedEvidenceDimension && (
                          <EvidenceUpload 
                            assessmentId={assessmentId}
                            dimensionId={selectedEvidenceDimension}
                          />
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                )}
              </Box>
            )
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center' }}>
              {success ? (
                <>
                  <Typography variant="h5" color="success.main" gutterBottom>Assessment submitted!</Typography>
                  <Button variant="contained" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                </>
              ) : (
                <Typography>Please review your answers and submit.</Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && (!selectedCompany || !selectedDepartment)) ||
                (activeStep === 1 && Object.keys(answers).length === 0) ||
                (activeStep === 1 && loading)
              }
            >
              {activeStep === 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </>
      ) : (
        // Past Assessments List
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Past Assessments</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search assessments..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 250 }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setTab('new')}
              >
                New Assessment
              </Button>
            </Box>
          </Box>

          {pastLoading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : pastAssessments.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No assessments found</Typography>
            </Box>
          ) : (
            <>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 2 }}>
                <Box component="thead" sx={{ backgroundColor: 'grey.100' }}>
                  <Box component="tr">
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Company</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Department</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Date</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'center' }}>Status</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'right' }}>Score</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'center' }}>Actions</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {pagedAssessments.map((assessment) => (
                    <Box 
                      component="tr" 
                      key={assessment.id}
                      sx={{ 
                        '&:hover': { backgroundColor: 'grey.50' },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box component="td" sx={{ p: 2 }}>{assessment.company.name}</Box>
                      <Box component="td" sx={{ p: 2 }}>{assessment.department?.name ?? 'Company-wide'}</Box>
                      <Box component="td" sx={{ p: 2 }}>{new Date(assessment.updatedAt).toLocaleDateString()}</Box>
                      <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                        <Chip 
                          label={assessment.status} 
                          color={
                            assessment.status === 'DRAFT' ? 'warning' :
                            assessment.status === 'SUBMITTED' ? 'info' :
                            assessment.status === 'REVIEWED' ? 'success' : 
                            'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Box component="td" sx={{ p: 2, textAlign: 'right' }}>
                        {assessment.weightedAverageScore ? 
                          assessment.weightedAverageScore.toFixed(1) : 
                          assessment.rawAverageScore ? 
                            assessment.rawAverageScore.toFixed(1) : 
                            'N/A'
                        }
                      </Box>
                      <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleEdit(assessment.id, assessment.status)}
                          >
                            {assessment.status === 'DRAFT' ? 'Continue' : 'View/Edit'}
                          </Button>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog(assessment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {filtered.length > pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination 
                    count={Math.ceil(filtered.length / pageSize)}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      )}

      <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => {}}>
        <Alert severity="success">Assessment submitted successfully</Alert>
      </Snackbar>

      {/* Edit Confirmation Dialog */}
      <Dialog open={editDialogOpen} onClose={cancelEdit}>
        <DialogTitle>Edit Submitted Assessment?</DialogTitle>
        <DialogContent>
          <Typography>Editing a submitted assessment will allow you to modify your answers. Continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>Cancel</Button>
          <Button onClick={confirmEdit} variant="contained" color="primary">Continue</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this assessment? This action cannot be undone directly, 
            but the data will be soft-deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteAssessment} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Incomplete Warning Dialog */}
      <Dialog open={incompleteWarningOpen} onClose={handleCancelIncomplete}>
        <DialogTitle>Incomplete Assessment</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            You have answered {Object.keys(answers).length} out of {template.reduce((sum, cat) => sum + cat.dimensions.length, 0)} questions.
          </Typography>
          <Typography paragraph>
            Your assessment will be scored based only on the dimensions you've rated. The system will:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Box component="li">
              <Typography>Automatically adjust category weights for missing dimension scores</Typography>
            </Box>
            <Box component="li">
              <Typography>Calculate weighted averages using only the dimensions you've assessed</Typography>
            </Box>
            <Box component="li">
              <Typography>Flag the assessment as partially complete in reports</Typography>
            </Box>
          </Box>
          <Typography paragraph sx={{ mt: 2 }}>
            For best results, try to answer all questions for a more comprehensive evaluation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelIncomplete}>Continue Editing</Button>
          <Button onClick={handleContinueIncomplete} variant="contained" color="primary">Submit Anyway</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
