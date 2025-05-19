'use client';
import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Business, Assessment } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  sectorId: string;
  sector: {
    id: string;
    name: string;
  };
  departments: Array<{
    id: string;
    name: string;
    _count: {
      assessments: number;
    };
  }>;
  _count: {
    users: number;
    assessments: number;
    departments: number;
  };
}

interface Sector {
  id: string;
  name: string;
  _count: {
    companies: number;
  };
}

export default function CompaniesPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // This will redirect to the sign-in page
      window.location.href = '/auth/signin';
    },
  });
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sectorId: '',
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/sectors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sectors');
      }

      const data = await response.json();
      setSectors(data);
    } catch (err) {
      console.error('Error fetching sectors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sectors');
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchCompanies(), fetchSectors()]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session, status]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', sectorId: '' });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }

      await fetchCompanies();
      handleCloseDialog();
      setSnackbarMessage('Company created successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Error creating company:', err);
      setSnackbarMessage(err instanceof Error ? err.message : 'Failed to create company');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete company');
      }

      await fetchCompanies();
      setSnackbarMessage('Company deleted successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Error deleting company:', err);
      setSnackbarMessage(err instanceof Error ? err.message : 'Failed to delete company');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const isAdmin = session?.user?.role === Role.ADMIN;

  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Please sign in to access this page
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Companies and Departments</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Add Company
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Departments</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Assessments</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 3 }}>
                    No companies added yet. {isAdmin && 'Click the "Add Company" button to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">{company.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<Business />} 
                      label={company.sector.name} 
                      color="primary"
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {company.departments.map((dept) => (
                      <Chip 
                        key={dept.id}
                        label={`${dept.name} (${dept._count.assessments})`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                        color={dept._count.assessments > 0 ? "primary" : "default"}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${company._count.users} users`} 
                      size="small"
                      color={company._count.users > 0 ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<Assessment />}
                      label={`${company._count.assessments} assessments`} 
                      size="small"
                      color={company._count.assessments > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        href={`/companies/${company.id}`}
                        startIcon={<Edit />}
                      >
                        Details
                      </Button>
                      {isAdmin && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(company.id)}
                          disabled={company._count.departments > 0 || company._count.users > 0 || company._count.assessments > 0}
                          title={
                            company._count.departments > 0 || company._count.users > 0 || company._count.assessments > 0
                              ? "Cannot delete company with existing departments, users, or assessments"
                              : "Delete company"
                          }
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Company Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Company</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Company Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleTextChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="sector-label">Sector</InputLabel>
            <Select
              labelId="sector-label"
              name="sectorId"
              value={formData.sectorId}
              label="Sector"
              onChange={handleSelectChange}
            >
              {sectors.map((sector) => (
                <MenuItem key={sector.id} value={sector.id}>
                  {sector.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.sectorId}
          >
            Add Company
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
