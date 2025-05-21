'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';

interface DimensionConfig {
  id: string;
  name: string;
  enabled: boolean;
}
interface CategoryConfig {
  id: string;
  name: string;
  dimensions: DimensionConfig[];
}
interface Company {
  id: string;
  name: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession({ required: true });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/companies', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load companies'))
        .then(data => setCompanies(data))
        .catch(err => console.error(err));
    }
  }, [status]);

  useEffect(() => {
    if (companyId) {
      setLoading(true);
      fetch(`/api/admin/templates?companyId=${companyId}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to load template'))
        .then(data => setCategories(data))
        .catch(err => setError(String(err)))
        .finally(() => setLoading(false));
    }
  }, [companyId]);

  const handleToggle = (catIdx: number, dimIdx: number) => {
    const updated = [...categories];
    updated[catIdx].dimensions[dimIdx].enabled = !updated[catIdx].dimensions[dimIdx].enabled;
    setCategories(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configs = categories.flatMap(cat =>
        cat.dimensions.map(dim => ({ dimensionId: dim.id, enabled: dim.enabled }))
      );
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ companyId, configs }),
      });
      if (!res.ok) {
        const d = await res.json(); throw new Error(d.error || 'Save failed');
      }
      setSnackbar({ open: true, message: 'Template saved', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') return null;
  if (!session || session.user.role !== 'ADMIN') {
    return <Alert severity="error">Access denied</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Template Management</Typography>
      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Company</InputLabel>
          <Select value={companyId} label="Company" onChange={e => setCompanyId(e.target.value)}>
            {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSave} disabled={!companyId || saving}>
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        categories.map(cat => (
          <Box key={cat.id} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>{cat.name}</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dimension</TableCell>
                    <TableCell align="center">Enabled</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cat.dimensions.map(dim => (
                    <TableRow key={dim.id} hover>
                      <TableCell>{dim.name}</TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={dim.enabled}
                          onChange={() => handleToggle(
                            categories.findIndex(c => c.id === cat.id),
                            cat.dimensions.findIndex(d => d.id === dim.id)
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 