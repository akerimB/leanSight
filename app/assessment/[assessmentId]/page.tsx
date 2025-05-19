'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import prisma from '@/lib/prisma';

interface Descriptor { id: string; level: number; description: string }
interface Dimension { id: string; name: string; descriptors: Descriptor[] }
interface Category { id: string; name: string; dimensions: Dimension[] }

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

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // fetch assessment
        const res = await fetch(`/api/assessments?id=${assessmentId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load assessment');
        const data = await res.json();
        setAssessment(data);
        setStatusValue(data.status);
        // set answers map
        const ansMap: Record<string, number> = {};
        (data.scores || []).forEach((s: any) => ansMap[s.dimensionId] = s.level);
        setAnswers(ansMap);
        // fetch template
        const query = data.departmentId ? `departmentId=${data.departmentId}` : `companyId=${data.company.id}`;
        const tmplRes = await fetch(`/api/assessment-template?${query}`, { credentials: 'include' });
        if (!tmplRes.ok) throw new Error('Failed to load template');
        const tmpl = await tmplRes.json();
        setTemplate(tmpl);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (status === 'authenticated') load();
  }, [assessmentId, status]);

  const handleStatusChange = async (newStatus: string) => {
    if (!assessment) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: assessmentId, status: newStatus }),
      });
      if (!res.ok) {
        const d = await res.json(); throw new Error(d.error || 'Failed to update status');
      }
      setStatusValue(newStatus);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setUpdating(false);
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Assessment Details</Typography>
        <Typography variant="subtitle1" sx={{ mr: 2 }}>Status: {statusValue}</Typography>
        {session.user.role === 'ADMIN' && statusValue === 'SUBMITTED' && (
          <Button variant="contained" onClick={() => handleStatusChange('REVIEWED')} disabled={updating}>
            Mark Reviewed
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

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