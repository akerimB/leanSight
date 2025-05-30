'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Skeleton,
  Divider,
  Tooltip as MuiTooltip,
  Menu,
  Chip,
  Slider,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  ButtonGroup,
  Badge,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useSession } from 'next-auth/react';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/utils/storage';

import { toast } from 'sonner';
import TrendAnalytics from '@/components/TrendAnalytics';
import PerformanceDashboard from '@/components/analytics/PerformanceDashboard';
import ComparativeAnalysis from '@/components/analytics/ComparativeAnalysis';
import GapAnalysis from '@/components/analytics/GapAnalysis';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('last30days');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  // Add tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'comparative' | 'gaps'>('overview');
  
  // Advanced filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([1, 5]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  
  const [sectorOptions, setSectorOptions] = useState<{ id: string; name: string }[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; name: string }[]>([]);
  const [dimensionOptions, setDimensionOptions] = useState<{ id: string; name: string }[]>([]);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New filter level state
  const [filterLevel, setFilterLevel] = useState<'all' | 'sector' | 'company' | 'department'>('all');

  // Report menu state
  const [reportMenuAnchor, setReportMenuAnchor] = useState<null | HTMLElement>(null);
  const [excelMenuAnchor, setExcelMenuAnchor] = useState<null | HTMLElement>(null);

  // Real-time updates
  const { isConnected, lastUpdate, sendUpdate } = useRealTimeUpdates({
    onUpdate: (update) => {
      console.log('Real-time update received:', update);
      
      // Handle different types of updates
      switch (update.type) {
        case 'assessment_completed':
        case 'assessment_updated':
        case 'score_changed':
          // Refresh analytics data when assessments change
          fetchData();
          break;
        case 'user_activity':
          // Could show user activity notifications
          break;
        default:
          console.log('Unknown update type:', update.type);
      }
    },
    onConnect: () => {
      console.log('Connected to real-time updates');
    },
    onDisconnect: () => {
      console.log('Disconnected from real-time updates');
    }
  });

  // Quick filter presets
  const quickFilters = [
    { 
      id: 'lowPerformers', 
      name: 'Low Performers', 
      description: 'Assessments with scores below 3.0',
      filters: { scoreRange: [1, 2.9] as [number, number], statuses: ['COMPLETED'] }
    },
    { 
      id: 'highPerformers', 
      name: 'High Performers', 
      description: 'Assessments with scores above 4.0',
      filters: { scoreRange: [4.0, 5] as [number, number], statuses: ['COMPLETED'] }
    },
    { 
      id: 'recentCompletions', 
      name: 'Recent Completions', 
      description: 'Completed assessments in last 7 days',
      filters: { timeRange: 'last7days', statuses: ['COMPLETED'] }
    },
    { 
      id: 'inProgress', 
      name: 'In Progress', 
      description: 'Assessments currently being worked on',
      filters: { statuses: ['IN_PROGRESS'] }
    },
    { 
      id: 'needsAttention', 
      name: 'Needs Attention', 
      description: 'Draft or incomplete assessments',
      filters: { statuses: ['DRAFT', 'IN_PROGRESS'] }
    }
  ];

  // Status options
  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'REVIEWED', label: 'Reviewed' }
  ];

  // Load filter preferences from localStorage on mount
  useEffect(() => {
    const savedFilters = loadFromLocalStorage('analytics_filters', {}) as any;
    
    if (savedFilters.timeRange) setTimeRange(savedFilters.timeRange);
    if (savedFilters.selectedSector) setSelectedSector(savedFilters.selectedSector);
    if (savedFilters.selectedCompany) setSelectedCompany(savedFilters.selectedCompany);
    if (savedFilters.selectedDepartment) setSelectedDepartment(savedFilters.selectedDepartment);
    if (savedFilters.selectedStatuses) setSelectedStatuses(savedFilters.selectedStatuses);
    if (savedFilters.scoreRange) setScoreRange(savedFilters.scoreRange);
    if (savedFilters.selectedDimensions) setSelectedDimensions(savedFilters.selectedDimensions);
    if (savedFilters.customDateRange) {
      const { start, end } = savedFilters.customDateRange;
      setCustomDateRange({
        start: start ? new Date(start) : null,
        end: end ? new Date(end) : null
      });
    }
  }, []);

  // Save filter preferences to localStorage whenever they change
  useEffect(() => {
    const filtersToSave = {
      timeRange,
      selectedSector,
      selectedCompany,
      selectedDepartment,
      selectedStatuses,
      scoreRange,
      selectedDimensions,
      customDateRange: {
        start: customDateRange.start?.toISOString() || null,
        end: customDateRange.end?.toISOString() || null
      }
    };
    
    saveToLocalStorage('analytics_filters', filtersToSave);
  }, [timeRange, selectedSector, selectedCompany, selectedDepartment, selectedStatuses, scoreRange, selectedDimensions, customDateRange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSector(null);
    setSelectedCompany(null);
    setSelectedDepartment(null);
    setSelectedStatuses([]);
    setScoreRange([1, 5]);
    setSelectedDimensions([]);
    setCustomDateRange({start: null, end: null});
    setActiveQuickFilter(null);
    setTimeRange('last30days');
  };

  // Apply quick filter
  const applyQuickFilter = (filterId: string) => {
    const filter = quickFilters.find(f => f.id === filterId);
    if (!filter) return;

    setActiveQuickFilter(filterId);
    
    if (filter.filters.scoreRange) {
      setScoreRange(filter.filters.scoreRange);
    }
    if (filter.filters.statuses) {
      setSelectedStatuses(filter.filters.statuses);
    }
    if (filter.filters.timeRange) {
      setTimeRange(filter.filters.timeRange);
    }
  };

  // Check if any advanced filters are active
  const hasActiveAdvancedFilters = () => {
    return selectedStatuses.length > 0 || 
           scoreRange[0] !== 1 || scoreRange[1] !== 5 ||
           selectedDimensions.length > 0 ||
           customDateRange.start !== null || customDateRange.end !== null ||
           activeQuickFilter !== null;
  };

  const fetchData = () => {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams({ timeRange });
    
    // Add basic filters
    if (selectedSector) params.append('sectorId', selectedSector);
    if (selectedCompany) params.append('companyId', selectedCompany);
    if (selectedDepartment) params.append('departmentId', selectedDepartment);

    // Add advanced filters
    if (selectedStatuses.length > 0) {
      selectedStatuses.forEach(status => params.append('status', status));
    }
    
    if (scoreRange[0] !== 1 || scoreRange[1] !== 5) {
      params.append('minScore', scoreRange[0].toString());
      params.append('maxScore', scoreRange[1].toString());
    }
    
    if (selectedDimensions.length > 0) {
      selectedDimensions.forEach(dimensionId => params.append('dimensionId', dimensionId));
    }
    
    if (timeRange === 'custom' && customDateRange.start && customDateRange.end) {
      params.append('startDate', customDateRange.start.toISOString());
      params.append('endDate', customDateRange.end.toISOString());
    }

    fetch(`/api/analytics/summary?${params}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics data');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, selectedSector, selectedCompany, selectedDepartment, selectedStatuses, scoreRange, selectedDimensions, customDateRange]);

  // Load filter options based on user role and selections
  useEffect(() => {
    if (session?.user) {
      const isAdmin = session.user.role === 'ADMIN';
      
      // Load sectors (admin only)
      if (isAdmin) {
        fetch('/api/sectors', { credentials: 'include' })
          .then(res => res.ok ? res.json() : [])
          .then(data => setSectorOptions(data))
          .catch(err => console.error('Error loading sectors:', err));
      }

      // Load companies based on sector selection
      const companyParams = new URLSearchParams();
      if (selectedSector && isAdmin) {
        companyParams.append('sectorId', selectedSector);
      }
      
      const companyEndpoint = isAdmin ? '/api/admin/companies' : '/api/companies';
      fetch(`${companyEndpoint}?${companyParams}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setCompanyOptions(data);
          // Reset company selection if it's no longer valid
          if (selectedCompany && !data.find((c: any) => c.id === selectedCompany)) {
            setSelectedCompany(null);
            setSelectedDepartment(null);
          }
        })
        .catch(err => console.error('Error loading companies:', err));

      // Load dimensions
      fetch('/api/dimensions', { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => setDimensionOptions(data))
        .catch(err => console.error('Error loading dimensions:', err));
    }
  }, [session, selectedSector]);

  // Load departments based on company selection
  useEffect(() => {
    if (selectedCompany) {
      fetch(`/api/departments?companyId=${selectedCompany}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setDepartmentOptions(data);
          // Reset department selection if it's no longer valid
          if (selectedDepartment && !data.find((d: any) => d.id === selectedDepartment)) {
            setSelectedDepartment(null);
          }
        })
        .catch(err => console.error('Error loading departments:', err));
    } else {
      setDepartmentOptions([]);
      setSelectedDepartment(null);
    }
  }, [selectedCompany]);

  const handleDownloadExecutiveReport = async () => {
    try {
      const params = new URLSearchParams({ timeRange });
      
      // Add filters based on selections
      if (selectedSector) params.append('sectorId', selectedSector);
      if (selectedCompany) params.append('companyId', selectedCompany);
      if (selectedDepartment) params.append('departmentId', selectedDepartment);

      const response = await fetch(`/api/analytics/executive-report?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate executive report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `executive_summary_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Executive report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading executive report:', error);
      toast.error('Failed to download executive report');
    }
  };

  const handleDownloadDetailedReport = async () => {
    try {
      const params = new URLSearchParams({ timeRange });
      
      // Add filters based on selections
      if (selectedSector) params.append('sectorId', selectedSector);
      if (selectedCompany) params.append('companyId', selectedCompany);
      if (selectedDepartment) params.append('departmentId', selectedDepartment);

      const response = await fetch(`/api/analytics/detailed-report?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate detailed report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `detailed_analytics_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Detailed report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading detailed report:', error);
      toast.error('Failed to download detailed report');
    }
  };

  const handleReportMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setReportMenuAnchor(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setReportMenuAnchor(null);
  };

  const handleReportDownload = async (reportType: 'executive' | 'detailed') => {
    setReportMenuAnchor(null);
    if (reportType === 'executive') {
      await handleDownloadExecutiveReport();
    } else {
      await handleDownloadDetailedReport();
    }
  };

  const handleExcelDownload = async (exportType: 'comprehensive' | 'raw' | 'template') => {
    setReportMenuAnchor(null);
    try {
      const params = new URLSearchParams({ timeRange, type: exportType });
      
      // Add filters based on selections
      if (selectedSector) params.append('sectorId', selectedSector);
      if (selectedCompany) params.append('companyId', selectedCompany);
      if (selectedDepartment) params.append('departmentId', selectedDepartment);

      const response = await fetch(`/api/analytics/excel-export?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lean_analytics_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to generate Excel export. Please try again.');
    }
  };

  // Helper function to get current filter scope description
  const getFilterScopeDescription = () => {
    const isAdmin = session?.user?.role === 'ADMIN';
    
    if (selectedDepartment) {
      const company = companyOptions.find(c => c.id === selectedCompany);
      const department = departmentOptions.find(d => d.id === selectedDepartment);
      return `Department: ${department?.name} (${company?.name})`;
    }
    
    if (selectedCompany) {
      const company = companyOptions.find(c => c.id === selectedCompany);
      return `Company: ${company?.name}`;
    }
    
    if (selectedSector && isAdmin) {
      const sector = sectorOptions.find(s => s.id === selectedSector);
      return `Sector: ${sector?.name}`;
    }
    
    if (isAdmin) {
      return 'All Organizations';
    }
    
    return 'Your Organization';
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  if (error && !loading) { 
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 200px)' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Analytics</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Button variant="contained" onClick={fetchData}>Retry</Button>
      </Box>
    );
  }
  
  if (loading && !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4"><Skeleton width={250} /></Typography>
          <Skeleton variant="rectangular" width={200} height={56} />
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Skeleton variant="rectangular" width={300} height={48} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Paper sx={{ p: 2, height: 340 }}>
                <Typography variant="h6"><Skeleton width="60%" /></Typography>
                <Skeleton variant="rectangular" width="100%" height={280} sx={{mt: 1}}/>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">Analytics Dashboard</Typography>
            <MuiTooltip title={isConnected ? 'Real-time updates active' : 'Real-time updates disconnected'}>
              <Chip
                icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
                label={isConnected ? 'Live' : 'Offline'}
                color={isConnected ? 'success' : 'default'}
                size="small"
                variant={isConnected ? 'filled' : 'outlined'}
              />
            </MuiTooltip>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Viewing: {getFilterScopeDescription()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Sector Filter - Admin Only */}
          {isAdmin && (
            <FormControl sx={{ minWidth: 160 }} disabled={loading}>
              <InputLabel>Sector</InputLabel>
              <Select
                value={selectedSector || ''}
                label="Sector"
                onChange={(e) => {
                  setSelectedSector(e.target.value as string || null);
                  setSelectedCompany(null);
                  setSelectedDepartment(null);
                }}
                displayEmpty
              >
                <MenuItem value=""><em>All Sectors</em></MenuItem>
                {sectorOptions.map(sector => (
                  <MenuItem key={sector.id} value={sector.id}>{sector.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Company Filter */}
          <FormControl sx={{ minWidth: 180 }} disabled={loading || (!isAdmin && !session?.user?.companyId)}>
            <InputLabel>Company</InputLabel>
            <Select
              value={selectedCompany || ''}
              label="Company"
              onChange={(e) => {
                setSelectedCompany(e.target.value as string || null);
                setSelectedDepartment(null);
              }}
              displayEmpty={isAdmin}
            >
              {isAdmin && <MenuItem value=""><em>All Companies</em></MenuItem>}
              {companyOptions.map(company => (
                <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department Filter */}
          <FormControl sx={{ minWidth: 180 }} disabled={loading || !selectedCompany}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment || ''}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value as string || null)}
              displayEmpty
            >
              <MenuItem value=""><em>All Departments</em></MenuItem>
              {departmentOptions.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Time Range Filter */}
          <FormControl sx={{ minWidth: 160 }} disabled={loading}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as string)}
            >
              <MenuItem value="last7days">Last 7 Days</MenuItem>
              <MenuItem value="last30days">Last 30 Days</MenuItem>
              <MenuItem value="last90days">Last 90 Days</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {/* Refresh Button */}
          <Button
            variant="outlined"
            onClick={fetchData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            sx={{ minWidth: 120 }}
          >
            Refresh
          </Button>

          {/* Executive Report Button */}
          <Button
            variant="contained"
            onClick={handleReportMenuClick}
            disabled={loading}
            startIcon={<DownloadIcon />}
            endIcon={<ArrowDropDownIcon />}
            sx={{ minWidth: 160 }}
          >
            PDF Reports
          </Button>

          {/* Excel Export Button */}
          <Button
            variant="outlined"
            onClick={(event) => setExcelMenuAnchor(event.currentTarget)}
            disabled={loading}
            startIcon={<DownloadIcon />}
            endIcon={<ArrowDropDownIcon />}
            sx={{ minWidth: 150 }}
          >
            Excel Export
          </Button>
        </Box>
      </Box>

      {/* Advanced Filters Accordion */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="advanced-filters-content"
          id="advanced-filters-header"
        >
          <Typography variant="h6">
            Advanced Filters
            {hasActiveAdvancedFilters() && (
              <Chip 
                label="Active" 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Quick Filter Presets */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>Quick Filters</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {quickFilters.map((filter) => (
                  <Chip
                    key={filter.id}
                    label={filter.name}
                    onClick={() => applyQuickFilter(filter.id)}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
                <Chip
                  label="Clear All"
                  onClick={clearAllFilters}
                  variant="outlined"
                  size="small"
                  color="error"
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>
            </Grid>

            {/* Assessment Status Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Assessment Status</InputLabel>
                <Select
                  multiple
                  value={selectedStatuses}
                  onChange={(e) => setSelectedStatuses(e.target.value as string[])}
                  label="Assessment Status"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Score Range Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Score Range: {scoreRange[0].toFixed(1)} - {scoreRange[1].toFixed(1)}
              </Typography>
              <Slider
                value={scoreRange}
                onChange={(_, newValue) => setScoreRange(newValue as [number, number])}
                valueLabelDisplay="auto"
                step={0.1}
                marks
                min={1}
                max={5}
                valueLabelFormat={(value) => value.toFixed(1)}
              />
            </Grid>

            {/* Dimension Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Dimensions</InputLabel>
                <Select
                  multiple
                  value={selectedDimensions}
                  onChange={(e) => setSelectedDimensions(e.target.value as string[])}
                  label="Dimensions"
                  renderValue={(selected) => `${selected.length} selected`}
                >
                  {dimensionOptions.map((dimension) => (
                    <MenuItem key={dimension.id} value={dimension.id}>
                      <Checkbox checked={selectedDimensions.indexOf(dimension.id) > -1} />
                      <ListItemText primary={dimension.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Date Range */}
            {timeRange === 'custom' && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={customDateRange.start}
                      onChange={(newValue) => setCustomDateRange(prev => ({ ...prev, start: newValue }))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={customDateRange.end}
                      onChange={(newValue) => setCustomDateRange(prev => ({ ...prev, end: newValue }))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            {/* Filter Actions */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
                <Button variant="contained" onClick={fetchData}>
                  Apply Filters
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Analytics Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="analytics tabs"
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Performance" value="performance" />
          <Tab label="Trends" value="trends" />
          <Tab label="Comparative" value="comparative" />
          <Tab label="Gap Analysis" value="gaps" />
        </Tabs>
      </Box>

      {/* Render components based on active tab */}
      {(!error || loading) && (
        <>
          {activeTab === 'overview' && (
            <PerformanceDashboard
              companyId={selectedCompany || undefined}
              departmentId={selectedDepartment || undefined}
              sectorId={selectedSector || undefined}
              timeRange={timeRange}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceDashboard
              companyId={selectedCompany || undefined}
              departmentId={selectedDepartment || undefined}
              sectorId={selectedSector || undefined}
              timeRange={timeRange}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'trends' && (
            <TrendAnalytics 
              companyId={selectedCompany || undefined}
              departmentId={selectedDepartment || undefined}
              sectorId={selectedSector || undefined}
            />
          )}

          {activeTab === 'comparative' && (
            <ComparativeAnalysis
              companyId={selectedCompany || undefined}
              sectorId={selectedSector || undefined}
              timeRange={timeRange}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'gaps' && (
            <GapAnalysis
              companyId={selectedCompany || undefined}
              departmentId={selectedDepartment || undefined}
              sectorId={selectedSector || undefined}
              timeRange={timeRange}
              onRefresh={fetchData}
            />
          )}
        </>
      )}

      {/* Report Menu */}
      <Menu
        anchorEl={reportMenuAnchor}
        open={Boolean(reportMenuAnchor)}
        onClose={handleReportMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleReportDownload('executive')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Executive Summary
        </MenuItem>
        <MenuItem onClick={() => handleReportDownload('detailed')}>
          <DownloadIcon sx={{ mr: 1 }} />
          Detailed Analytics
        </MenuItem>
      </Menu>

      {/* Excel Export Menu */}
      <Menu
        anchorEl={excelMenuAnchor}
        open={Boolean(excelMenuAnchor)}
        onClose={() => setExcelMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleExcelDownload('comprehensive')}>
          <GetAppIcon sx={{ mr: 1 }} />
          Comprehensive Report
        </MenuItem>
        <MenuItem onClick={() => handleExcelDownload('raw')}>
          <GetAppIcon sx={{ mr: 1 }} />
          Raw Data Export
        </MenuItem>
        <MenuItem onClick={() => handleExcelDownload('template')}>
          <GetAppIcon sx={{ mr: 1 }} />
          Assessment Template
        </MenuItem>
      </Menu>
    </Box>
  );
}
