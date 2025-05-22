'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AssessmentListItem {
  id: string;
  companyName: string;
  departmentName: string | null;
  updatedAt: string;
  status: string;
  scoreCount: number;
  rawAverageScore: number | null;
}

export default function ResultsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assessments');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch assessments');
      }
      const data = await response.json();
      const transformedData: AssessmentListItem[] = data.map((item: any) => {
        const companyName = item.company?.name || 'N/A';
        const departmentName = item.department?.name || 'Company-Wide';
        const updatedAt = new Date(item.updatedAt).toLocaleString();
        const status = item.status;
        const id = item.id;
        const scoreCount = item.scoreCount;
        const rawAverageScore = item.rawAverageScore;
        
        return {
          id,
          companyName,
          departmentName,
          updatedAt,
          status,
          scoreCount,
          rawAverageScore,
        };
      });
      setAssessments(transformedData);
    } catch (err: any) {
      console.error('Failed to fetch assessments:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleViewDetails = (assessmentId: string) => {
    // Navigate to a detailed view page (to be created)
    router.push(`/results/${assessmentId}`);
  };

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
        <Alert severity="error" action={<Button onClick={fetchAssessments}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Assessment Submissions
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Department/Scope</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right"># Scores</TableCell>
              <TableCell align="right">Avg. Score</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessments.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{row.companyName}</TableCell>
                <TableCell>{row.departmentName}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={row.status === 'DRAFT' ? 'warning' : row.status === 'SUBMITTED' ? 'info' : row.status === 'REVIEWED' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="right">{row.scoreCount}</TableCell>
                <TableCell align="right">
                  {row.rawAverageScore !== null ? row.rawAverageScore.toFixed(2) : 'N/A'}
                </TableCell>
                <TableCell align="right">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => router.push(`/results/${row.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 