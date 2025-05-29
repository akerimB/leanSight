'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MaturityOption from './MaturityOption';

interface MaturityLevel {
  level: number;
  title: string;
  description: string;
}

interface Dimension {
  id: string;
  name: string;
  levels: MaturityLevel[];
}

interface MaturityAssessmentProps {
  dimensions: Dimension[];
  onSave?: (assessmentData: AssessmentData) => void;
  readOnly?: boolean;
}

interface AssessmentData {
  [dimensionId: string]: {
    level: string;
    notes: string;
    evidence: Evidence[];
  };
}

interface Evidence {
  id: string;
  name: string;
  url?: string;
  type?: string;
}

export default function MaturityAssessment({ 
  dimensions,
  onSave,
  readOnly = false
}: MaturityAssessmentProps) {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(() => {
    // Initialize with default values
    const initialData: AssessmentData = {};
    dimensions.forEach(dimension => {
      initialData[dimension.id] = {
        level: '3', // Default to middle level
        notes: '',
        evidence: []
      };
    });
    return initialData;
  });

  const [expandedDimension, setExpandedDimension] = useState<string | false>(dimensions[0]?.id || false);

  const handleAccordionChange = (dimensionId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDimension(isExpanded ? dimensionId : false);
  };

  const handleLevelChange = (dimensionId: string, level: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [dimensionId]: {
        ...prev[dimensionId],
        level
      }
    }));
  };

  const handleNotesChange = (dimensionId: string, notes: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [dimensionId]: {
        ...prev[dimensionId],
        notes
      }
    }));
  };

  // Mock function to add evidence (in a real app, this would handle file uploads)
  const handleAddEvidence = (dimensionId: string) => {
    const mockEvidence: Evidence = {
      id: `evidence-${Date.now()}`,
      name: `Evidence Document ${Math.floor(Math.random() * 1000)}`,
      type: 'pdf'
    };

    setAssessmentData(prev => ({
      ...prev,
      [dimensionId]: {
        ...prev[dimensionId],
        evidence: [...prev[dimensionId].evidence, mockEvidence]
      }
    }));
  };

  const handleRemoveEvidence = (dimensionId: string, evidenceId: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [dimensionId]: {
        ...prev[dimensionId],
        evidence: prev[dimensionId].evidence.filter(e => e.id !== evidenceId)
      }
    }));
  };

  const handleSave = () => {
    onSave?.(assessmentData);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Maturity Assessment</Typography>
        
        {!readOnly && (
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Assessment
          </Button>
        )}
      </Paper>

      {dimensions.map((dimension) => (
        <Accordion 
          key={dimension.id}
          expanded={expandedDimension === dimension.id}
          onChange={handleAccordionChange(dimension.id)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`dimension-${dimension.id}-content`}
            id={`dimension-${dimension.id}-header`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>{dimension.name}</Typography>
              
              <Chip 
                label={`Level ${assessmentData[dimension.id]?.level || '?'}`} 
                color={
                  assessmentData[dimension.id]?.level === '1' ? 'error' :
                  assessmentData[dimension.id]?.level === '2' ? 'warning' :
                  assessmentData[dimension.id]?.level === '3' ? 'info' :
                  assessmentData[dimension.id]?.level === '4' ? 'success' :
                  assessmentData[dimension.id]?.level === '5' ? 'success' :
                  'default'
                }
                size="small"
                sx={{ mr: 2 }}
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <MaturityOption 
                  levels={dimension.levels}
                  value={assessmentData[dimension.id]?.level || '3'}
                  onChange={(level) => handleLevelChange(dimension.id, level)}
                  dimension={dimension.name}
                />
              </Box>
              
              <Box>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>Notes & Evidence</Typography>
                  <Tooltip title="Add notes to explain your assessment and attach supporting evidence">
                    <HelpOutlineIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                
                <TextField
                  label="Assessment Notes"
                  multiline
                  rows={4}
                  fullWidth
                  value={assessmentData[dimension.id]?.notes || ''}
                  onChange={(e) => handleNotesChange(dimension.id, e.target.value)}
                  disabled={readOnly}
                  placeholder="Add notes to explain your assessment rationale..."
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Evidence</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {assessmentData[dimension.id]?.evidence.map((evidence) => (
                      <Chip
                        key={evidence.id}
                        label={evidence.name}
                        icon={<AttachFileIcon />}
                        onDelete={readOnly ? undefined : () => handleRemoveEvidence(dimension.id, evidence.id)}
                        variant="outlined"
                      />
                    ))}
                    
                    {assessmentData[dimension.id]?.evidence.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No evidence attached
                      </Typography>
                    )}
                  </Box>
                  
                  {!readOnly && (
                    <Button
                      startIcon={<AttachFileIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddEvidence(dimension.id)}
                    >
                      Attach Evidence
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 