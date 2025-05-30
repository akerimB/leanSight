'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Container,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, BusinessCenter as BusinessCenterIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Sector {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    descriptors?: number;
    companies?: number;
  };
}

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching sectors from API...');
      const response = await fetch('/api/sectors');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch sectors');
      }
      const data = await response.json();
      console.log('✅ Sectors API response received:', data);
      console.log('📊 Number of sectors:', data.length);
      
      if (data.length > 0) {
        console.log('🔍 Sample sector structure:', data[0]);
        console.log('📋 First sector _count:', data[0]._count);
        
        // Check Pharmaceuticals & Biotechnology specifically
        const pharma = data.find((s: any) => s.name === 'Pharmaceuticals & Biotechnology');
        if (pharma) {
          console.log('🧬 Pharmaceuticals & Biotechnology sector:', pharma);
          console.log('💊 Pharma descriptors count:', pharma._count?.descriptors);
        }
      }
      
      setSectors(data);
    } catch (error: any) {
      console.error('❌ Error fetching sectors:', error);
      toast.error(error.message || 'Failed to load sectors');
      setSectors([]); // Ensure sectors is an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSector = () => {
    router.push('/sectors/new');
  };

  const handleEditSector = (sectorId: string) => {
    router.push(`/sectors/${sectorId}`);
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading sectors...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Sectors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSector}
        >
          New Sector
        </Button>
      </Box>

      {sectors.length === 0 ? (
        <Paper elevation={3} sx={{ textAlign: 'center', py: 10, px:3, mt: 4, backgroundColor: '#f9f9f9' }}>
          <BusinessCenterIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" component="p" gutterBottom>
            No Sectors Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Get started by creating a new sector. Define its characteristics and manage maturity descriptors.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleCreateSector} 
            startIcon={<AddIcon />}
          >
            Create First Sector
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sectors.map((sector) => (
            <Grid key={sector.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {sector.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                    {sector.description || 'No description available.'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon color="action" sx={{ mr: 1 }} /> 
                    <Typography variant="body2">
                      Maturity Descriptors: {sector._count?.descriptors ?? 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BusinessCenterIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Companies: {sector._count?.companies ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{mt:1}}>
                    Last updated: {new Date(sector.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p:2 }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditSector(sector.id)}
                    variant="outlined"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 