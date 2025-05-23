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
  IconButton,
  Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface WeightingSchemeListItem {
  id: string;
  name: string;
  // Add other relevant fields for the list view later, e.g., isGlobal, companyName
}

export default function WeightingSchemesPage() {
  const router = useRouter();
  const [schemes, setSchemes] = useState<WeightingSchemeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeightingSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weighting-schemes');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch weighting schemes');
      }
      const data = await response.json();
      setSchemes(data);
    } catch (err: any) {
      console.error('Failed to fetch weighting schemes:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to load weighting schemes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeightingSchemes();
  }, [fetchWeightingSchemes]);

  const handleCreateNew = () => {
    router.push('/weighting-schemes/create');
  };

  const handleViewDetails = (id: string) => {
    router.push(`/weighting-schemes/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/weighting-schemes/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this weighting scheme? This action cannot be undone.')) {
      setLoading(true);
      try {
        const response = await fetch(`/api/weighting-schemes/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete scheme');
        }
        toast.success(data.message || 'Weighting scheme deleted successfully.');
        fetchWeightingSchemes();
      } catch (err: any) {
        console.error('Failed to delete scheme:', err);
        toast.error(err.message || 'An error occurred while deleting the scheme.');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
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
        <Alert severity="error" action={<Button onClick={fetchWeightingSchemes}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{mb:0}}>
          Weighting Schemes Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={handleCreateNew}
        >
          Create New Scheme
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="weighting schemes table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              {/* Add more columns like Scope (Global/Company) later */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schemes.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No weighting schemes found.
                </TableCell>
              </TableRow>
            ) : (
              schemes.map((scheme) => (
                <TableRow
                  key={scheme.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {scheme.name}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewDetails(scheme.id)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Scheme">
                      <IconButton onClick={() => handleEdit(scheme.id)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Scheme">
                      <IconButton onClick={() => handleDelete(scheme.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 