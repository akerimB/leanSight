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
  Tab
} from '@mui/material';

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
} from 'recharts';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Define a common structure for chart data and a helper component
interface ChartPanelProps {
  title: string;
  data?: any;
  loading: boolean;
  children: (data: any) => React.ReactNode;
  height?: number | string;
  gridColumnSpan?: number | { xs?: number, md?: number };
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


const ChartCard: React.FC<ChartPanelProps> = ({ title, data, loading, children, height = 340, gridColumnSpan }) => {
  const gridStyles = gridColumnSpan ? { gridColumn: typeof gridColumnSpan === 'number' ? `span ${gridColumnSpan}` : { xs: `span ${gridColumnSpan.xs || 1}`, md: `span ${gridColumnSpan.md || 1}` } } : {};
  
  const numericHeight = typeof height === 'string' ? parseInt(height, 10) : height;
  const adjustedHeight = numericHeight - 40;

  return (
    <Paper sx={{ p: 2, height: '100%', ...gridStyles }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: adjustedHeight /* Adjust for title padding */ }}>
        {loading ? <ChartPlaceholder height={adjustedHeight} /> : (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0) ? children(data) : <NoDataMessage height={adjustedHeight} />)}
      </Box>
    </Paper>
  );
};


export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('last30days');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Helper for heatmap cell coloring
  const getHeatColor = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) return '#eeeeee'; // Default for no data
    const hue = ((5 - Math.max(0, Math.min(5, value))) / 5) * 120; // Ensure value is between 0-5 for color calculation
    return `hsl(${hue}, 75%, 75%)`;
  };
  
  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/summary?timeRange=${timeRange}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); // Try to parse error
          throw new Error(errorData.error || `Failed to fetch analytics data (status ${res.status})`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        if (!json) { // Handle case where API returns empty successful response
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
    fetchData();
  }, [timeRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Primary and secondary colors for charts
  const primaryChartColor = "#8884d8";
  const secondaryChartColor = "#82ca9d";

  if (error && !loading) { // Show error prominently if fetch fails
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
            // @ts-ignore
            <Grid item xs={12} md={6} key={index}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb:3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Analytics sections">
          <Tab label="Overview" />
          <Tab label="Performance Breakdown" />
          <Tab label="Advanced Trends" />
        </Tabs>
      </Box>

      {/* Main content: only render if not in critical error state and data or loading is true */}
      { (!error || loading) && (
        <Box>
          {/* Tab 0: Overview */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom textAlign="center">
                    Overall Maturity Score
                  </Typography>
                  {loading ? <CircularProgress size={80} /> : data?.overallAvg !== undefined && data.overallAvg !== null ? (
                    <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
                      <CircularProgress variant="determinate" value={ (data.overallAvg / 5) * 100 } size={120} thickness={4} />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h3" component="div" color="text.primary">
                          {data.overallAvg.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  ) : <NoDataMessage height={120} />}
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <ChartCard title="Maturity Trend" data={data?.trends} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray={'3 3'} />
                        <XAxis dataKey={'period'} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgScore" stroke={primaryChartColor} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 340 }}>
                  <Typography variant="h6" gutterBottom>Completion & Adoption</Typography>
                  {loading ? <ChartPlaceholder height={280}/> : data?.completion ? (
                    <Box sx={{mt: 2}}>
                      <Typography>Started Assessments: {data.completion.started ?? 'N/A'}</Typography>
                      <Typography>Submitted Assessments: {data.completion.submitted ?? 'N/A'}</Typography>
                      <Typography>Reviewed Assessments: {data.completion.reviewed ?? 'N/A'}</Typography>
                      <Typography>
                        Avg. Time to Complete: {data.completion.avgTimeToComplete ? (data.completion.avgTimeToComplete / 1000 / 60).toFixed(2) + ' mins' : 'N/A'}
                      </Typography>
                    </Box>
                  ) : <NoDataMessage height={280}/>}
                </Paper>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
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
            </Grid>
          )}

          {/* Tab 1: Performance Breakdown */}
          {currentTab === 1 && (
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <ChartCard title="Dimension Breakdown" data={data?.dimensionBreakdown} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimensionName" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]}/>
                        <Radar name="Avg Score" dataKey="avgScore" stroke={secondaryChartColor} fill={secondaryChartColor} fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <ChartCard title="Category Distribution" data={data?.categoryDistribution} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray={'3 3'} />
                        <XAxis dataKey={'categoryName'} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey={'avgScore'} fill={primaryChartColor} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <ChartCard title="Department Comparison" data={data?.departmentComparison} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray={'3 3'} />
                        <XAxis dataKey={'departmentName'} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey={'avgScore'} fill={secondaryChartColor} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={12}> {/* Heatmap full width */}
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
                                    border: '1px solid rgba(224, 224, 224, 1)' // Add borders for clarity
                                  }}
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
          {currentTab === 2 && (
            <Grid container spacing={3}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <ChartCard title="Evidence Counts per Dimension" data={data?.evidenceCounts} loading={loading}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dimensionName" />
                        <YAxis allowDecimals={false}/>
                        <Tooltip />
                        <Bar dataKey="count" fill={primaryChartColor} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={12}> {/* Cohort full width */}
                <ChartCard title="Cohort Analysis (Average Score Over Time)" data={data?.cohort} loading={loading} height={400} gridColumnSpan={{ xs: 1, md: 2 }}>
                  {(chartData) => (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cohort" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgScore" stroke={secondaryChartColor} />
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
