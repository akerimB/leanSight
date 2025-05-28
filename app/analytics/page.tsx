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
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip as MuiTooltip
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useSession } from 'next-auth/react';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ImageIcon from '@mui/icons-material/Image';
import { useGenerateImage } from 'recharts-to-png';
import FileSaver from 'file-saver';

// Chart imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Label,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { toast } from 'sonner';

// Define a common structure for chart data and a helper component
interface ChartPanelProps {
  title: string;
  data?: any;
  loading: boolean;
  children: (data: any) => React.ReactNode;
  height?: number | string;
  gridColumnSpan?: number | { xs?: number, md?: number };
  onDownloadCsv?: () => void;
  onDownloadImage?: (filename: string) => Promise<void>;
  chartImageFilename?: string;
  helpText?: string;
}

const ChartPlaceholder = ({ height = 300 }: { height?: number | string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
    <CircularProgress />
  </Box>
);

const NoDataMessage = ({ height = 300 }: { height?: number | string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
    <Typography variant="body2" color="text.secondary">No data available for this chart</Typography>
  </Box>
);


const ChartCard: React.FC<ChartPanelProps> = ({ title, data, loading, children, height = 340, gridColumnSpan, onDownloadCsv, onDownloadImage, chartImageFilename, helpText }) => {
  const gridStyles = gridColumnSpan ? { gridColumn: typeof gridColumnSpan === 'number' ? `span ${gridColumnSpan}` : { xs: `span ${gridColumnSpan.xs || 1}`, md: `span ${gridColumnSpan.md || 1}` } } : {};
  
  const numericHeight = typeof height === 'string' ? parseInt(height, 10) : height;
  const buttonsPresent = onDownloadCsv || (onDownloadImage && chartImageFilename);
  const adjustedHeight = numericHeight - (buttonsPresent || helpText ? 70 : 40);

  const [getImage, { ref: imageRef, isLoading: isImageLoading }] = useGenerateImage<HTMLDivElement>({
    quality: 0.9,
    type: 'image/png',
    options: { backgroundColor: 'white' } as any
  });

  const handleImageDownload = async () => {
    if (!chartImageFilename) {
      toast.error("Image filename not specified.");
      return;
    }
    const image = await getImage();
    if (image) {
      FileSaver.saveAs(image, chartImageFilename.endsWith('.png') ? chartImageFilename : `${chartImageFilename}.png`);
      toast.success(`Chart image "${chartImageFilename}.png" downloaded.`);
    } else {
      toast.error("Failed to generate chart image.");
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', ...gridStyles }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            {title}
          </Typography>
          {helpText && (
            <MuiTooltip title={helpText} placement="top">
              <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
            </MuiTooltip>
          )}
        </Box>
        <Box sx={{display: 'flex', gap: 1}}>
          {onDownloadCsv && data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0) && !loading && (
            <Button onClick={onDownloadCsv} size="small" startIcon={<DownloadIcon />} aria-label={`Download ${title} as CSV`}>
              CSV
            </Button>
          )}
          {onDownloadImage && chartImageFilename && data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0) && !loading && (
            <Button onClick={handleImageDownload} size="small" startIcon={<ImageIcon />} disabled={isImageLoading} aria-label={`Download ${title} as Image`}>
              {isImageLoading ? 'Saving...' : 'Image'}
            </Button>
          )}
        </Box>
      </Box>
      <Box ref={imageRef} sx={{ height: adjustedHeight, mt: 1 }}>
        {loading ? <ChartPlaceholder height={adjustedHeight} /> : (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0) ? children(data) : <NoDataMessage height={adjustedHeight} />)}
      </Box>
    </Paper>
  );
};

// Tooltip formatter function
const tooltipValueFormatter = (value: any, name: string) => {
  if (name === 'avgScore' && typeof value === 'number') {
    return value.toFixed(2);
  }
  if (name === 'count' && typeof value === 'number') {
    return value.toString();
  }
  return value;
};

// Helper function to download data as CSV
const downloadCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  const replacer = (key: string, value: any) => value === null ? '' : value; // Handle null values
  const header = Object.keys(data[0]);
  let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  csv.unshift(header.join(','));
  const csvString = csv.join('\r\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('last30days');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; name: string }[]>([]);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [themeChartColors, setThemeChartColors] = useState<string[]>([]);

  const getHeatColor = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return '#eeeeee';
    const hue = (Math.max(0, Math.min(5, value)) / 5) * 120;
    return `hsl(${hue}, 75%, 75%)`;
  };
  
  const fetchData = () => {
    setLoading(true);
    setError(null);
    let apiUrl = `/api/analytics/summary?timeRange=${timeRange}`;
    
    // Determine effective companyId for the API call based on session and selection
    let companyIdToFetch = selectedCompany;
    if (session && session.user.role !== 'ADMIN' && session.user.companyId) {
      companyIdToFetch = session.user.companyId; // Non-admin always uses their own company
    }

    if (companyIdToFetch) {
      apiUrl += `&companyId=${companyIdToFetch}`;
    }
    // Only add department if a company is effectively selected (for admins, this means selectedCompany is not null)
    if (companyIdToFetch && selectedDepartment) {
      apiUrl += `&departmentId=${selectedDepartment}`;
    }

    fetch(apiUrl)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); 
          throw new Error(errorData.error || `Failed to fetch analytics data (status ${res.status})`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        if (!json) {
            setError("No analytics data was returned from the server.");
        }
      })
      .catch(err => {
        console.error("Analytics fetch error:", err);
        setError(err.message || "An unexpected error occurred while fetching data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (session) { // Ensure session is loaded before fetching data dependent on it
        fetchData();
    }
    const rootStyles = getComputedStyle(document.documentElement);
    const colors = [
      rootStyles.getPropertyValue('--chart-1').trim(),
      rootStyles.getPropertyValue('--chart-2').trim(),
      rootStyles.getPropertyValue('--chart-3').trim(),
      rootStyles.getPropertyValue('--chart-4').trim(),
      rootStyles.getPropertyValue('--chart-5').trim(),
    ];
    setThemeChartColors(colors.filter(color => color));
  }, [timeRange, selectedCompany, selectedDepartment, session]);

  useEffect(() => {
    if (session) { // Check if session is available
      fetch('/api/companies')
        .then(res => res.json())
        .then(companies => {
          setCompanyOptions(companies || []);
          if (session.user.role !== 'ADMIN' && session.user.companyId) {
            setSelectedCompany(session.user.companyId); // Pre-select and lock for non-admin
          }
        })
        .catch(err => console.error("Failed to fetch companies:", err));
    }
  }, [session]);

  useEffect(() => {
    let companyToFetchDeptsFor = selectedCompany;
    if (session && session.user.role !== 'ADMIN' && session.user.companyId) {
        companyToFetchDeptsFor = session.user.companyId; // Non-admin always fetches depts for their own company
    }

    if (companyToFetchDeptsFor) {
      fetch(`/api/departments?companyId=${companyToFetchDeptsFor}`)
        .then(res => res.json())
        .then(depts => setDepartmentOptions(depts || []))
        .catch(err => {
            console.error("Failed to fetch departments:", err);
            setDepartmentOptions([]); // Clear on error
        });
    } else {
      setDepartmentOptions([]);
    }
  }, [selectedCompany, session]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleHeatmapCellClick = (departmentId: string, categoryId: string, departmentName: string, categoryName: string, score: number | null) => {
    const scoreDisplay = score !== null && score !== undefined ? score.toFixed(2) : 'N/A';
    toast.info(`Heatmap cell clicked:\nDepartment: ${departmentName} (ID: ${departmentId})\nCategory: ${categoryName} (ID: ${categoryId})\nScore: ${scoreDisplay}`);
    // Future: Implement drill-down navigation or filtering logic here
  };

  const handleDownloadMaturityTrendCsv = () => {
    if (data?.trends) {
      downloadCsv(data.trends, 'maturity_trend.csv');
    }
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
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }} disabled={loading || !isAdmin}>
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

          <FormControl sx={{ minWidth: 200 }} disabled={loading || !(selectedCompany || (session?.user?.companyId && !isAdmin))}>
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

          <FormControl sx={{ minWidth: 200 }} disabled={loading}>
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
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb:3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Analytics sections">
          <Tab label="Overview" />
          <Tab label="Performance Breakdown" />
          <Tab label="Advanced Trends" />
        </Tabs>
      </Box>

      { (!error || loading) && (
        <Box>
          {/* Tab 0: Overview */}
          {/* @ts-ignore */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="h6" gutterBottom textAlign="center" sx={{ mb: 0 }}>
                      Overall Maturity Score
                    </Typography>
                    <MuiTooltip title="Average maturity score across all submitted assessments in the selected period.">
                      <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', cursor: 'help' }} />
                    </MuiTooltip>
                  </Box>
                  {loading ? <CircularProgress size={80} /> : data?.overallAvg?.current !== undefined && data.overallAvg.current !== null ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2, mb: 1 }}>
                        <CircularProgress variant="determinate" value={(data.overallAvg.current / 5) * 100} size={120} thickness={4} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="h3" component="div" color="text.primary">
                            {data.overallAvg.current.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      {data.overallAvg.previous !== undefined && data.overallAvg.previous !== null && data.overallAvg.previous !== 0 && (
                        () => {
                          const change = data.overallAvg.current - data.overallAvg.previous;
                          const isPositive = change > 0;
                          const isNegative = change < 0;
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              {isPositive && <ArrowUpwardIcon sx={{ color: 'success.main' }} fontSize="small" />}
                              {isNegative && <ArrowDownwardIcon sx={{ color: 'error.main' }} fontSize="small" />}
                              <Typography variant="body2" sx={{ color: isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary' }}>
                                {change.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                vs previous {timeRange.replace('last','').replace('days',' days').replace('Year',' year')}
                              </Typography>
                            </Box>
                          );
                        }
                      )()}
                    </Box>
                  ) : <NoDataMessage height={120} />}
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard 
                  title="Maturity Trend" 
                  data={data?.trends} 
                  loading={loading}
                  onDownloadCsv={handleDownloadMaturityTrendCsv}
                  onDownloadImage={async () => {}}
                  chartImageFilename="maturity_trend_chart"
                  helpText="Shows the trend of the average maturity score over the selected period."
                >
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray={'3 3'} />
                        <XAxis dataKey={'period'} />
                        <YAxis domain={[0, 5]}>
                          <Label value="Avg. Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Line type="monotone" dataKey="avgScore" stroke={themeChartColors[0] || '#8884d8'} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: 340 }}>
                  <Typography variant="h6" gutterBottom>Completion & Adoption</Typography>
                  {loading ? <ChartPlaceholder height={280}/> : data?.completion ? (
                    <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 1}}>
                      <Typography>Started Assessments: {data.completion.started ?? 'N/A'}</Typography>
                      <Typography>Submitted Assessments: {data.completion.submitted ?? 'N/A'}</Typography>
                      <Typography>Reviewed Assessments: {data.completion.reviewed ?? 'N/A'}</Typography>
                      <Typography>
                        Avg. Time to Complete: {data.completion.avgTimeToComplete ? (data.completion.avgTimeToComplete / 1000 / 60).toFixed(2) + ' mins' : 'N/A'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography>Active Users (Assessors): {data.completion.numberOfActiveUsers ?? 'N/A'}</Typography>
                      <Typography>Avg. Assessments per User: {data.completion.avgAssessmentsPerUser?.toFixed(2) ?? 'N/A'}</Typography>
                    </Box>
                  ) : <NoDataMessage height={280}/>}
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: 340 }}>
                  <Typography variant="h6" gutterBottom>Benchmarking</Typography>
                  {loading ? <ChartPlaceholder height={280}/> : data?.benchmark ? (
                    <Box sx={{mt:2}}>
                      <Typography>Global Average Score: {data.benchmark.globalAvg?.toFixed(2) ?? 'N/A'}</Typography>
                      <Typography>Your Company Average Score: {data.benchmark.companyAvg?.toFixed(2) ?? 'N/A'}</Typography>
                    </Box>
                  ) : <NoDataMessage height={280}/> }
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Score Level Distribution" data={data?.scoreDistribution} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis allowDecimals={false}>
                          <Label value="Number of Scores" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Bar dataKey="count" fill={themeChartColors[4] || '#ffc658'} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}> {/* Strengths and Weaknesses Card */}
                <Paper sx={{ p: 2, height: 'auto', minHeight: 340, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>Key Performance Areas</Typography>
                  {loading ? <ChartPlaceholder height={280}/> : data && (data.topCategories || data.weakCategories || data.topDimensions || data.weakDimensions) ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mt:1 }}>
                      {/* Categories Row */}
                      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Box sx={{ width: '48%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main' }}>Top Strengths (Categories)</Typography>
                          {data.topCategories && data.topCategories.length > 0 ? (
                            <List dense sx={{maxHeight: 100, overflow: 'auto'}}>
                              {data.topCategories.map((cat: { categoryName: string; avgScore: number }, index: number) => (
                                <ListItem key={`top-cat-${index}`} disablePadding>
                                  <ListItemText primary={cat.categoryName} secondary={`Avg. Score: ${cat.avgScore.toFixed(2)}`} />
                                </ListItem>
                              ))}
                            </List>
                          ) : <Typography variant="body2" color="text.secondary">Not enough data.</Typography>}
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ width: '48%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: 'error.main' }}>Areas for Improvement (Categories)</Typography>
                          {data.weakCategories && data.weakCategories.length > 0 ? (
                            <List dense sx={{maxHeight: 100, overflow: 'auto'}}>
                              {data.weakCategories.map((cat: { categoryName: string; avgScore: number }, index: number) => (
                                <ListItem key={`weak-cat-${index}`} disablePadding>
                                  <ListItemText primary={cat.categoryName} secondary={`Avg. Score: ${cat.avgScore.toFixed(2)}`} />
                                </ListItem>
                              ))}
                            </List>
                          ) : <Typography variant="body2" color="text.secondary">Not enough data.</Typography>}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Dimensions Row */}
                      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Box sx={{ width: '48%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main' }}>Top Strengths (Dimensions)</Typography>
                          {data.topDimensions && data.topDimensions.length > 0 ? (
                            <List dense sx={{maxHeight: 100, overflow: 'auto'}}>
                              {data.topDimensions.map((dim: { dimensionName: string; avgScore: number }, index: number) => (
                                <ListItem key={`top-dim-${index}`} disablePadding>
                                  <ListItemText primary={dim.dimensionName} secondary={`Avg. Score: ${dim.avgScore.toFixed(2)}`} />
                                </ListItem>
                              ))}
                            </List>
                          ) : <Typography variant="body2" color="text.secondary">Not enough data.</Typography>}
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ width: '48%' }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ color: 'error.main' }}>Areas for Improvement (Dimensions)</Typography>
                          {data.weakDimensions && data.weakDimensions.length > 0 ? (
                            <List dense sx={{maxHeight: 100, overflow: 'auto'}}>
                              {data.weakDimensions.map((dim: { dimensionName: string; avgScore: number }, index: number) => (
                                <ListItem key={`weak-dim-${index}`} disablePadding>
                                  <ListItemText primary={dim.dimensionName} secondary={`Avg. Score: ${dim.avgScore.toFixed(2)}`} />
                                </ListItem>
                              ))}
                            </List>
                          ) : <Typography variant="body2" color="text.secondary">Not enough data.</Typography>}
                        </Box>
                      </Box>
                    </Box>
                  ) : <NoDataMessage height={280}/>}
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}> {/* Assessment Status Distribution Card */}
                <ChartCard title="Assessment Status Distribution" data={data?.assessmentStatusDistribution} loading={loading} height={340}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={themeChartColors[index % themeChartColors.length] || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Performance Breakdown */}
          {/* @ts-ignore */}
          {currentTab === 1 && (
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Category Performance" data={data?.dimensionBreakdown} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Radar name="Average Score" dataKey="avgScore" stroke={themeChartColors[1] || '#82ca9d'} fill={themeChartColors[1] || '#82ca9d'} fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Category Distribution" data={data?.categoryDistribution} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]}>
                          <Label value="Avg. Score" position="insideBottom" offset={0} style={{ textAnchor: 'middle' }} />
                        </XAxis>
                        <YAxis type="category" dataKey="name" width={150} style={{ fontSize: '0.8rem' }} interval={0} />
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Bar dataKey="avgScore" fill={themeChartColors[2] || '#8884d8'} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Department Comparison" data={data?.departmentComparison} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray={'3 3'} />
                        <XAxis dataKey={'departmentName'} />
                        <YAxis domain={[0, 5]}>
                          <Label value="Avg. Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Bar dataKey={'avgScore'} fill={themeChartColors[3] || '#82ca9d'} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 12 }}>
                <Paper sx={{ p: 2, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
                  <Typography variant="h6" gutterBottom>Department × Category Heatmap</Typography>
                  {loading ? <ChartPlaceholder height={300}/> : data?.heatmap && data.heatmap.length > 0 && data.heatmap[0]?.categories ? (
                    <TableContainer>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{fontWeight: 'bold'}}>Dept. \ Category</TableCell>
                            {data.heatmap[0].categories.map((cat: { categoryId: string; categoryName: string; avgScore: number }) => (
                              <TableCell key={cat.categoryId} sx={{fontWeight: 'bold'}}>{cat.categoryName}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.heatmap.map((row: { departmentId: string; departmentName: string; categories: any[] }) => (
                            <TableRow key={row.departmentId}>
                              <TableCell component="th" scope="row">{row.departmentName}</TableCell>
                              {row.categories.map((cell: { categoryId: string; categoryName: string; avgScore: number }) => (
                                <TableCell
                                  key={cell.categoryId}
                                  align="center"
                                  sx={{ 
                                    backgroundColor: getHeatColor(cell.avgScore),
                                    border: '1px solid rgba(224, 224, 224, 1)',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: getHeatColor(cell.avgScore + 0.5),
                                      outline: '1px solid #333'
                                    }
                                  }}
                                  onClick={() => handleHeatmapCellClick(row.departmentId, cell.categoryId, row.departmentName, cell.categoryName, cell.avgScore)}
                                >{cell.avgScore !== null && cell.avgScore !== undefined ? cell.avgScore.toFixed(2) : '-'}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : <NoDataMessage height={300}/>}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Advanced Trends */}
          {/* @ts-ignore */}
          {currentTab === 2 && (
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard title="Evidence Counts per Dimension" data={data?.evidenceCounts} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dimensionName" />
                        <YAxis allowDecimals={false}>
                          <Label value="Count" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Bar dataKey="count" fill={themeChartColors[4] || '#8884d8'} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid size={{ xs: 12, md: 12 }}>
                <ChartCard title="Cohort Analysis (Average Score Over Time)" data={data?.cohort} loading={loading} height={400} gridColumnSpan={{ xs: 1, md: 2 }}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cohort" />
                        <YAxis domain={[0, 5]}>
                          <Label value="Avg. Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={tooltipValueFormatter} />
                        <Line type="monotone" dataKey="avgScore" stroke={themeChartColors[0] || '#82ca9d'} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}
