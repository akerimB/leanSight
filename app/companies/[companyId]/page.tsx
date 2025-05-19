'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { Add, Edit, Delete as DeleteIcon } from '@mui/icons-material';
import { useParams } from 'next/navigation';

interface Department {
  id: string;
  name: string;
  _count: { assessments: number };
}

interface Company {
  id: string;
  name: string;
  sector: { id: string; name: string };
  departments: Department[];
  _count: { users: number; assessments: number; departments: number };
}

interface Sector { id: string; name: string }

interface DepartmentForm { id?: string; name: string }

export default function CompanyDetailPage() {
  const { companyId } = useParams() as { companyId: string };
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { window.location.href = '/auth/signin'; }
  });

  const [company, setCompany] = useState<Company | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Company edit state
  const [companyName, setCompanyName] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [openCompanyDialog, setOpenCompanyDialog] = useState(false);
  // Department dialog state
  const [deptForm, setDeptForm] = useState<DepartmentForm>({ name: '' });
  const [openDeptDialog, setOpenDeptDialog] = useState(false);
  const [deptMode, setDeptMode] = useState<'add' | 'edit'>('add');
  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, secRes] = await Promise.all([
        fetch(`/api/admin/companies?id=${companyId}`),
        fetch('/api/sectors')
      ]);
      if (!compRes.ok) throw new Error('Failed to load company');
      if (!secRes.ok) throw new Error('Failed to load sectors');
      const compData = await compRes.json() as Company;
      const sectorsData = await secRes.json() as Sector[];
      setCompany(compData);
      setCompanyName(compData.name);
      setCompanySector(compData.sector.id);
      setSectors(sectorsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (status === 'authenticated') fetchData(); }, [status]);

  // Company handlers
  const openEditCompany = () => setOpenCompanyDialog(true);
  const closeEditCompany = () => setOpenCompanyDialog(false);
  const saveCompany = async () => {
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: companyId, name: companyName, sectorId: companySector })
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to update'); }
      setSnackbar({ open: true, message: 'Company updated', severity: 'success' });
      closeEditCompany();
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Department handlers
  const openAddDept = () => { setDeptMode('add'); setDeptForm({ name: '' }); setOpenDeptDialog(true); };
  const openEditDept = (d: Department) => { setDeptMode('edit'); setDeptForm({ id: d.id, name: d.name }); setOpenDeptDialog(true); };
  const closeDeptDialog = () => setOpenDeptDialog(false);
  const saveDept = async () => {
    try {
      const method = deptMode === 'add' ? 'POST' : 'PUT';
      const body = deptMode === 'add'
        ? { name: deptForm.name, companyId }
        : { id: deptForm.id, name: deptForm.name, companyId };
      const res = await fetch('/api/admin/departments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setSnackbar({ open: true, message: deptMode==='add'?'Added department':'Updated department', severity: 'success' });
      closeDeptDialog(); fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };
  const deleteDept = async (id: string) => {
    if (!confirm('Delete department?')) return;
    try {
      const res = await fetch(`/api/admin/departments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setSnackbar({ open: true, message: 'Deleted department', severity: 'success' });
      fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  if (status === 'loading' || loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!company) {
    return <Typography color="error" sx={{ p: 3 }}>{error || 'Company not found'}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{company.name}</Typography>
        <Button variant="contained" onClick={openEditCompany} startIcon={<Edit />}>Edit Company</Button>
      </Box>

      {/* Edit Company Dialog */}
      <Dialog open={openCompanyDialog} onClose={closeEditCompany}>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={companyName} onChange={e => setCompanyName(e.target.value)} sx={{ mb: 2 }} />
          <FormControl fullWidth>
            <InputLabel>Sector</InputLabel>
            <Select label="Sector" value={companySector} onChange={e => setCompanySector(e.target.value)}>
              {sectors.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditCompany}>Cancel</Button>
          <Button onClick={saveCompany} variant="contained" disabled={!companyName || !companySector}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Departments */}
      <Box sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Departments</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDept}>Add Department</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Assessments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {company.departments.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d._count.assessments}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => openEditDept(d)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => deleteDept(d.id)}><DeleteIcon /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Department Dialog */}
      <Dialog open={openDeptDialog} onClose={closeDeptDialog}>
        <DialogTitle>{deptMode==='add'?'Add Department':'Edit Department'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Department Name" value={deptForm.name} onChange={e=>setDeptForm(prev=>({...prev,name:e.target.value}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeptDialog}>Cancel</Button>
          <Button onClick={saveDept} variant="contained" disabled={!deptForm.name}>{deptMode==='add'?'Add':'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={()=>setSnackbar(prev=>({...prev,open:false}))}>
        <Alert severity={snackbar.severity} onClose={()=>setSnackbar(prev=>({...prev,open:false}))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 