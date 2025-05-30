'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Box,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Storage as StorageIcon,
  SmartToy as SmartToyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import AssessmentAssistant from '@/components/AssessmentAssistant';
import { AssessmentContext } from '@/hooks/useLLMChat';
import { toast } from 'sonner';

interface LLMStatus {
  usageStats: any;
  availableProviders: string[];
  ollamaHealth: boolean;
  ollamaModels: string[];
  modelSpecs: any;
  contextInfo: any;
  recommendations: any;
}

interface ContextDetection {
  detectedContext: {
    sectors: string[];
    dimensions: string[];
    queryType: string;
    confidence: number;
  };
  relevantDescriptors: Array<{
    sectorName: string;
    dimensionName: string;
    categoryName?: string;
    descriptorCount: number;
    levels: number[];
  }>;
  analysis: {
    sectorsDetected: number;
    dimensionsDetected: number;
    willEnhanceContext: boolean;
    contextTokensEstimate: number;
  };
}

interface Sector {
  id: string;
  name: string;
  description?: string;
}

interface Dimension {
  id: string;
  name: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function LLMDemoPage() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [status, setStatus] = useState<LLMStatus | null>(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [contextDetection, setContextDetection] = useState<ContextDetection | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<Sector[]>([]);
  const [availableDimensions, setAvailableDimensions] = useState<Dimension[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState<string>('GENERAL_GUIDANCE');

  const context: AssessmentContext = {
    questionText: "Demo question",
    categoryName: "Demo Category",
    dimensionName: "Demo Dimension"
  };

  // Sample queries that demonstrate context detection
  const sampleQueries = [
    {
      text: "How can healthcare organizations improve their leadership commitment?",
      type: "Healthcare Sector",
      category: "Healthcare"
    },
    {
      text: "What are the best practices for process standardization in manufacturing?",
      type: "Manufacturing + Process",
      category: "Manufacturing"
    },
    {
      text: "How do we implement data governance in financial services?",
      type: "Finance + Data Governance",
      category: "Finance"
    },
    {
      text: "What's the difference between Level 3 and Level 4 maturity in quality management?",
      type: "Quality Maturity Levels",
      category: "Maturity"
    },
    {
      text: "Our hospital needs to improve patient safety culture and standardize processes",
      type: "Healthcare + Multiple Dimensions",
      category: "Complex"
    }
  ];

  const suggestedQuestions = [
    "How do we improve our lean culture in healthcare?",
    "What are the key indicators of process maturity?",
    "How can we implement 5S methodology effectively?",
    "What evidence do we need for Level 4 leadership commitment?",
    "How do manufacturing and healthcare lean practices differ?"
  ];

  useEffect(() => {
    fetchStatus();
    fetchSectorsAndDimensions();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/llm/chat');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching LLM status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorsAndDimensions = async () => {
    setDataLoading(true);
    try {
      // Fetch sectors and dimensions for manual selection
      const [sectorsRes, dimensionsRes] = await Promise.all([
        fetch('/api/sectors'),
        fetch('/api/dimensions')
      ]);
      
      if (sectorsRes.ok) {
        const sectorsData = await sectorsRes.json();
        setAvailableSectors(sectorsData);
      }
      
      if (dimensionsRes.ok) {
        const dimensionsData = await dimensionsRes.json();
        setAvailableDimensions(dimensionsData);
      }
    } catch (error) {
      console.error('Error fetching sectors and dimensions:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const detectContext = async (queryText: string, manualSectors?: string[], manualDimensions?: string[]) => {
    setContextLoading(true);
    try {
      const requestBody: any = { query: queryText };
      
      // Always include manual selections if they exist
      if (manualSectors || manualDimensions || selectedSectors.length > 0 || selectedDimensions.length > 0) {
        requestBody.assessmentContext = {
          manualSectors: manualSectors || selectedSectors,
          manualDimensions: manualDimensions || selectedDimensions
        };
      }

      const response = await fetch('/api/llm/context-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      setContextDetection(data);
      
      // Auto-populate manual selections with detected elements
      if (data.detectedContext) {
        setSelectedSectors(data.detectedContext.sectors || []);
        setSelectedDimensions(data.detectedContext.dimensions || []);
        setEditMode(false); // Exit edit mode to show only detected elements initially
      }
    } catch (error) {
      console.error('Error detecting context:', error);
    } finally {
      setContextLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!query.trim()) return;
    
    setChatLoading(true);
    try {
      const requestBody: any = {
        message: query,
        promptType: selectedPromptType
      };

      // Always include manual selections if they exist, with additional context
      if (selectedSectors.length > 0 || selectedDimensions.length > 0) {
        requestBody.context = {
          manualSectors: selectedSectors,
          manualDimensions: selectedDimensions,
          // Include additional context information
          promptType: selectedPromptType,
          userOverride: true // Flag to indicate user has manually selected context
        };
      }

      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      setResponse(data.message);
      
      // DON'T auto-detect context after sending - let user control context
      // DON'T clear manual selections - let them persist for multiple messages
      
      toast.success(`Message sent with ${selectedPromptType.replace('_', ' ').toLowerCase()} prompt type!`);
    } catch (error) {
      console.error('Error sending message:', error);
      setResponse('Error: Failed to get response');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSampleQuery = (sampleText: string) => {
    setQuery(sampleText);
    detectContext(sampleText);
  };

  const handleContextUpdate = () => {
    // Update context logic here
  };

  const handleManualDetection = () => {
    if (query.trim()) {
      detectContext(query, selectedSectors, selectedDimensions);
    }
  };

  const getSectorName = (sectorId: string) => {
    const sector = availableSectors.find(s => s.id === sectorId);
    return sector?.name || sectorId;
  };

  const getDimensionName = (dimensionId: string) => {
    const dimension = availableDimensions.find(d => d.id === dimensionId);
    return dimension?.name || dimensionId;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        🤖 LLM Integration Demo
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
        Test automatic context detection and enhanced responses with sector-dimension specific guidance
      </Typography>

      {/* Status Overview */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon />
          LLM Status Overview
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Active Providers</Typography>
              <SmartToyIcon color="action" />
            </Box>
            <Typography variant="h4">{status?.availableProviders.length || 0}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {status?.availableProviders.map(provider => (
                <Chip key={provider} label={provider} size="small" />
              ))}
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Ollama Status</Typography>
              <StorageIcon color="action" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {status?.ollamaHealth ? (
                <CheckCircleIcon sx={{ color: 'green' }} />
              ) : (
                <ErrorIcon sx={{ color: 'red' }} />
              )}
              <Typography variant="body1">
                {status?.ollamaHealth ? 'Online' : 'Offline'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {status?.ollamaModels.length || 0} models available
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Context Detection</Typography>
              <PsychologyIcon color="action" />
            </Box>
            <Typography variant="h4" sx={{ color: 'green' }}>Auto</Typography>
            <Typography variant="body2" color="text.secondary">
              Maturity descriptors from database
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* Sample Queries */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon />
          Try Context-Aware Queries
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {sampleQueries.map((sample, index) => (
            <Paper 
              key={index}
              variant="outlined" 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => handleSampleQuery(sample.text)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={sample.category} size="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  {sample.type}
                </Typography>
              </Box>
              <Typography variant="body2">{sample.text}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* Context Detection Results */}
      {contextDetection && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon />
            Context Analysis & Manual Selection
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>Analysis</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Query Type:</Typography>
                  <Chip label={contextDetection.detectedContext.queryType} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Confidence:</Typography>
                  <Typography variant="body2">
                    {(contextDetection.detectedContext.confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Context Enhanced:</Typography>
                  {contextDetection.analysis.willEnhanceContext ? (
                    <CheckCircleIcon sx={{ color: 'green', fontSize: 20 }} />
                  ) : (
                    <ErrorIcon sx={{ color: 'gray', fontSize: 20 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Context Tokens:</Typography>
                  <Typography variant="body2">{contextDetection.analysis.contextTokensEstimate}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Sectors Detected:</Typography>
                  <Typography variant="body2">{contextDetection.analysis.sectorsDetected}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Dimensions Detected:</Typography>
                  <Typography variant="body2">{contextDetection.analysis.dimensionsDetected}</Typography>
                </Box>
              </Box>
            </Box>
            
            <Box>
              {/* Manual Selection Interface - Always visible */}
              <Box sx={{ p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Manual Selection
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!editMode ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditMode(true)}
                        startIcon={<AddIcon />}
                      >
                        Edit Selection
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditMode(false)}
                        startIcon={<ClearIcon />}
                      >
                        Done Editing
                      </Button>
                    )}
                  </Box>
                </Box>
                
                {!editMode ? (
                  // Stage 1: Show only selected elements
                  <Box>
                    {/* Selected Sectors */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Selected Sectors ({selectedSectors.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '32px' }}>
                        {selectedSectors.length > 0 ? (
                          selectedSectors.map((sectorId) => (
                            <Chip
                              key={sectorId}
                              label={getSectorName(sectorId)}
                              size="small"
                              color="primary"
                              variant="filled"
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ py: 1 }}>
                            No sectors selected
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Selected Dimensions */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Selected Dimensions ({selectedDimensions.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '32px' }}>
                        {selectedDimensions.length > 0 ? (
                          selectedDimensions.map((dimensionId) => (
                            <Chip
                              key={dimensionId}
                              label={getDimensionName(dimensionId)}
                              size="small"
                              color="secondary"
                              variant="filled"
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ py: 1 }}>
                            No dimensions selected
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  // Stage 2: Show all available options for editing
                  <Box>
                    {/* Available Sectors */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Available Sectors (click to select/deselect)
                        </Typography>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            const allSectorIds = availableSectors.map(s => s.id);
                            setSelectedSectors(allSectorIds);
                            toast.success('All sectors selected');
                          }}
                          sx={{ fontSize: '0.75rem', minWidth: 'auto', p: 0.5 }}
                        >
                          Select All
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {availableSectors.map((sector) => (
                          <Chip
                            key={sector.id}
                            label={sector.name}
                            size="small"
                            color="primary"
                            variant={selectedSectors.includes(sector.id) ? "filled" : "outlined"}
                            onClick={() => {
                              setSelectedSectors(prev => 
                                prev.includes(sector.id)
                                  ? prev.filter(id => id !== sector.id)
                                  : [...prev, sector.id]
                              );
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Available Dimensions */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Available Dimensions (click to select/deselect)
                        </Typography>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            const allDimensionIds = availableDimensions.map(d => d.id);
                            setSelectedDimensions(allDimensionIds);
                            toast.success('All dimensions selected');
                          }}
                          sx={{ fontSize: '0.75rem', minWidth: 'auto', p: 0.5 }}
                        >
                          Select All
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {availableDimensions.map((dimension) => (
                          <Chip
                            key={dimension.id}
                            label={dimension.name}
                            size="small"
                            color="secondary"
                            variant={selectedDimensions.includes(dimension.id) ? "filled" : "outlined"}
                            onClick={() => {
                              setSelectedDimensions(prev => 
                                prev.includes(dimension.id)
                                  ? prev.filter(id => id !== dimension.id)
                                  : [...prev, dimension.id]
                              );
                            }}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleManualDetection}
                    disabled={contextLoading || !query.trim()}
                    startIcon={<AddIcon />}
                  >
                    Test Selection
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (query.trim()) {
                        detectContext(query, selectedSectors, selectedDimensions);
                        toast.info('Context refreshed with current selections');
                      }
                    }}
                    disabled={contextLoading || !query.trim()}
                    startIcon={<RefreshIcon />}
                  >
                    Refresh Context
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedSectors([]);
                      setSelectedDimensions([]);
                      setEditMode(false);
                      toast.success('Manual selections cleared');
                    }}
                    startIcon={<ClearIcon />}
                  >
                    Clear All
                  </Button>
                  
                  {/* Selection Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                    <Chip 
                      label={`${selectedSectors.length} sectors`} 
                      size="small" 
                      color={selectedSectors.length > 0 ? "primary" : "default"}
                      variant="outlined"
                    />
                    <Chip 
                      label={`${selectedDimensions.length} dimensions`} 
                      size="small" 
                      color={selectedDimensions.length > 0 ? "secondary" : "default"}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Simple Chatbot Interface */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          💬 Context-Enhanced Chatbot
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Ask questions about lean practices with automatic context detection and manual selection integration.
        </Typography>
        
        {/* Prompt Type Selector */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            Select Response Type
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<InfoIcon fontSize="small" />}
              label="General Help"
              size="small"
              variant={selectedPromptType === 'GENERAL_GUIDANCE' ? 'filled' : 'outlined'}
              color="primary"
              onClick={() => {
                setSelectedPromptType('GENERAL_GUIDANCE');
                toast.info('Selected: General Help - Basic guidance and explanations');
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={<BusinessIcon fontSize="small" />}
              label="Scoring Help"
              size="small"
              variant={selectedPromptType === 'SCORING_GUIDANCE' ? 'filled' : 'outlined'}
              color="secondary"
              onClick={() => {
                setSelectedPromptType('SCORING_GUIDANCE');
                toast.info('Selected: Scoring Help - Assessment scoring guidance');
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={<AutoAwesomeIcon fontSize="small" />}
              label="Best Practices"
              size="small"
              variant={selectedPromptType === 'BEST_PRACTICES' ? 'filled' : 'outlined'}
              color="warning"
              onClick={() => {
                setSelectedPromptType('BEST_PRACTICES');
                toast.info('Selected: Best Practices - Industry recommendations');
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={<CategoryIcon fontSize="small" />}
              label="Evidence Ideas"
              size="small"
              variant={selectedPromptType === 'EVIDENCE_SUGGESTIONS' ? 'filled' : 'outlined'}
              color="info"
              onClick={() => {
                setSelectedPromptType('EVIDENCE_SUGGESTIONS');
                toast.info('Selected: Evidence Ideas - Documentation suggestions');
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              icon={<PsychologyIcon fontSize="small" />}
              label="Quick Answer"
              size="small"
              variant={selectedPromptType === 'QUICK_HELP' ? 'filled' : 'outlined'}
              color="success"
              onClick={() => {
                setSelectedPromptType('QUICK_HELP');
                toast.info('Selected: Quick Answer - Concise responses');
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>

        {/* Chat Interface */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Ask about lean manufacturing, specific sectors, or maturity levels..."
            multiline
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={sendMessage} 
              disabled={chatLoading || !query.trim()}
              startIcon={chatLoading ? <CircularProgress size={20} /> : <SmartToyIcon />}
            >
              Send Message
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => detectContext(query)} 
              disabled={contextLoading || !query.trim()}
              startIcon={contextLoading ? <CircularProgress size={20} /> : <PsychologyIcon />}
            >
              Detect Context
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setQuery('');
                setResponse('');
                setContextDetection(null);
                setSelectedSectors([]);
                setSelectedDimensions([]);
                setEditMode(false);
                setSelectedPromptType('GENERAL_GUIDANCE');
                toast.success('Chat and context cleared - starting fresh');
              }}
              startIcon={<ClearIcon />}
            >
              Clear Chat
            </Button>
          </Box>

          {/* Context Status */}
          {(selectedSectors.length > 0 || selectedDimensions.length > 0 || contextDetection || selectedPromptType !== 'GENERAL_GUIDANCE') && (
            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="info" fontSize="small" />
                Active Context
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Prompt Type */}
                <Chip 
                  label={`Prompt: ${selectedPromptType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`}
                  size="small" 
                  color="primary"
                  variant="filled"
                  icon={<AutoAwesomeIcon fontSize="small" />}
                />
                {/* Manual Override Indicator */}
                {(selectedSectors.length > 0 || selectedDimensions.length > 0) && (
                  <Chip 
                    label="Manual Override Active"
                    size="small" 
                    color="warning"
                    variant="filled"
                    icon={<BusinessIcon fontSize="small" />}
                  />
                )}
                {contextDetection && (
                  <Chip 
                    label={`${contextDetection.detectedContext.queryType} (${(contextDetection.detectedContext.confidence * 100).toFixed(0)}%)`}
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                )}
                {selectedSectors.length > 0 && (
                  <Chip 
                    label={`${selectedSectors.length} sectors selected`}
                    size="small" 
                    color="primary"
                  />
                )}
                {selectedDimensions.length > 0 && (
                  <Chip 
                    label={`${selectedDimensions.length} dimensions selected`}
                    size="small" 
                    color="secondary"
                  />
                )}
                {contextDetection?.analysis?.willEnhanceContext && (
                  <Chip 
                    label={`${contextDetection.analysis.contextTokensEstimate} context tokens`}
                    size="small" 
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Response Display */}
          {response && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon color="primary" />
                Enhanced Response:
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {response}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Information Alert */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>Automatic Context Enhancement & Manual Selection</AlertTitle>
        The system automatically detects sectors and dimensions from your queries and enhances responses with 
        relevant maturity level descriptors from the database. 
        <br/><br/>
        <strong>Selection Workflow:</strong>
        <br/>
        1. <strong>Detect Context</strong> → Auto-populate detected sectors/dimensions  
        <br/>
        2. <strong>Edit Selection</strong> → Click to modify by selecting/deselecting chips
        <br/>
        3. <strong>Send Message</strong> → Selections are cleared automatically (per-message)
        <br/><br/>
        Manual selections are <strong>per-message</strong> and reset after each query for fresh context.
      </Alert>
    </Container>
  );
}