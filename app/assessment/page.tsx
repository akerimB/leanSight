'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';

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

const steps = ['Select Company & Department', 'Assessment Questions', 'Review & Submit'];

export default function AssessmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { router.push('/auth/signin'); },
  });

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
    if (status === 'authenticated') {
      setCompaniesLoading(true);
      fetch('/api/admin/companies', { credentials: 'include' })
        .then((res) => res.ok ? res.json() : Promise.reject('Failed to load companies'))
        .then((data) => setCompanies(data))
        .catch((err) => setError(String(err)))
        .finally(() => setCompaniesLoading(false));
    }
  }, [status]);

  // Fetch template when moving to questions step
  useEffect(() => {
    if (activeStep === 1) {
      setTemplateLoading(true);
      const queryParam = selectedDepartment === 'all'
        ? `companyId=${selectedCompany}`
        : `departmentId=${selectedDepartment}`;
      fetch(`/api/assessment-template?${queryParam}`, { credentials: 'include' })
        .then((res) => res.ok ? res.json() : Promise.reject('Failed to load template'))
        .then((data) => setTemplate(data))
        .catch((err) => setError(String(err)))
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
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ companyId: selectedCompany, departmentId: selectedDepartment === 'all' ? null : selectedDepartment, draft: true }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to start assessment'); }
        const d = await res.json();
        setAssessmentId(d.id);
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }
    // Submit on step 1 (now the questions step)
    if (activeStep === 1) {
      setLoading(true);
      try {
        const res = await fetch('/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            companyId: selectedCompany,
            departmentId: selectedDepartment === 'all' ? null : selectedDepartment,
            answers: Object.entries(answers).map(([dimensionId, level]) => ({ dimensionId, level })),
          }),
        });
        if (!res.ok) {
          const err = await res.json(); throw new Error(err.error || 'Submission failed');
        }
        setSuccess(true);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Resume past assessment
  const handleResume = async (id: string) => {
    setTab('new');
    try {
      const res = await fetch(`/api/assessments?id=${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load assessment');
      const data = await res.json();
      setSelectedCompany(data.company.id);
      setSelectedDepartment(data.departmentId ?? 'all');
      const loaded: Record<string, number> = {};
      (data.scores || []).forEach((s: any) => { loaded[s.dimensionId] = s.level; });
      setAnswers(loaded);
      setAssessmentId(id);
      setActiveStep(1);
    } catch (err: any) {
      console.error(err);
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
      handleResume(id);
    }
  };

  const confirmEdit = () => {
    if (editAssessmentId) {
      setTab('new');
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

  if (status === 'loading' || (!session && status === 'authenticated')) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!session) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Lean Maturity Assessment</Typography>
      <Box sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="New Assessment" value="new" />
          <Tab label="Past Assessments" value="past" />
        </Tabs>
      </Box>

      {/* New Assessment Wizard */}
      {tab === 'new' && (
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
            <>
              {companiesLoading ? (
                <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Company</InputLabel>
                    <Select value={selectedCompany} label="Company" onChange={(e) => setSelectedCompany(e.target.value)}>
                      {companies.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select value={selectedDepartment} label="Department" onChange={(e) => setSelectedDepartment(e.target.value)}>
                      <MenuItem value="all">Company-wide</MenuItem>
                      {companies.find((c) => c.id === selectedCompany)?.departments.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </>
          )}

          {activeStep === 1 && (
            templateLoading ? (
              Array(3).fill(null).map((_, i) => <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2 }} />)
            ) : (
              <Box>
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
                                        <Box component="td" sx={{ p: 1 }}>{desc.description}</Box>
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
                (activeStep === 1 && Object.keys(answers).length < template.reduce((sum, cat) => sum + cat.dimensions.length, 0)) ||
                (activeStep === 1 && loading)
              }
            >
              {activeStep === 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>

          <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => {}}>
            <Alert severity="success">Assessment submitted successfully</Alert>
          </Snackbar>
        </>
      )}

      {/* Past Assessments Tab */}
      {tab === 'past' && (
        <Box>
          <TextField
            placeholder="Search past assessments"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            sx={{ width: 300, mb: 2 }}
          />
          {pastLoading ? (
            Array(3).fill(null).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1 }} />
            ))
          ) : filtered.length ? (
            <>
              <List>
                {pagedAssessments.map(a => (
                  <ListItem key={a.id} secondaryAction={
                    <Button size="small" onClick={() => handleEdit(a.id, a.status)}>
                      {a.status === 'DRAFT' ? 'Resume' : 'Edit'}
                    </Button>
                  }>
                    <ListItemText
                      primary={`${a.company.name} - ${a.department?.name ?? 'Company-wide'}`}
                      secondary={
                        <>
                          <Chip
                            label={a.status === 'DRAFT' ? 'In Progress' : 'Submitted'}
                            color={a.status === 'DRAFT' ? 'warning' : 'success'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {`${new Date(a.updatedAt).toLocaleString()} • ${a._count?.scores || 0} answers`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Pagination
                count={Math.ceil(filtered.length / pageSize)}
                page={page}
                onChange={(e, v) => setPage(v)}
                sx={{ mt: 2, mb: 2 }}
              />
            </>
          ) : (
            <Typography color="text.secondary">No past assessments found.</Typography>
          )}
        </Box>
      )}

      {/* Confirmation dialog for editing submitted assessments */}
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
    </Box>
  );
}
