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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('last30days');

  // Helper for heatmap cell coloring
  const getHeatColor = (value: number): string => {
    const hue = ((5 - value) / 4) * 120;
    return `hsl(${hue}, 75%, 75%)`;
  };

  // Dynamic data state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics summary when timeRange changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/summary?timeRange=${timeRange}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [timeRange]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="last7days">Last 7 Days</MenuItem>
            <MenuItem value="last30days">Last 30 Days</MenuItem>
            <MenuItem value="last90days">Last 90 Days</MenuItem>
            <MenuItem value="lastYear">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : data ? (
        <>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Overall Maturity Score */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Overall Maturity Score
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h2">{data.overallAvg.toFixed(2)}</Typography>
            </Box>
          </Paper>

          {/* Maturity Trend */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Maturity Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray={'3 3'} />
                <XAxis dataKey={'period'} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Dimension Breakdown */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dimension Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.dimensionBreakdown}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimensionName" />
                <PolarRadiusAxis />
                <Radar name="Avg Score" dataKey="avgScore" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Category Distribution */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryDistribution}>
                <CartesianGrid strokeDasharray={'3 3'} />
                <XAxis dataKey={'categoryName'} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={'avgScore'} fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Department Comparison */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Department Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentComparison}>
                <CartesianGrid strokeDasharray={'3 3'} />
                <XAxis dataKey={'departmentName'} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={'avgScore'} fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Completion & Adoption */}
          <Paper sx={{ p: 3, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
            <Typography variant="h6" gutterBottom>
              Completion & Adoption
            </Typography>
            <Typography>Started: {data.completion.started}</Typography>
            <Typography>Submitted: {data.completion.submitted}</Typography>
            <Typography>Reviewed: {data.completion.reviewed}</Typography>
            <Typography>
              Avg Time to Complete: {(data.completion.avgTimeToComplete / 1000 / 60).toFixed(2)} mins
            </Typography>
          </Paper>
        </Box>

        {/* Advanced Metrics */}
        <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Benchmarking */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Benchmarking
            </Typography>
            <Typography>Global Avg: {data.benchmark.globalAvg.toFixed(2)}</Typography>
            <Typography>Your Company Avg: {data.benchmark.companyAvg.toFixed(2)}</Typography>
          </Paper>
          {/* Evidence Counts */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evidence Counts
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.evidenceCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dimensionName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          {/* Cohort Analysis */}
          <Paper sx={{ p: 3, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
            <Typography variant="h6" gutterBottom>
              Cohort Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.cohort}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
          {/* Heatmap */}
          <Paper sx={{ p: 3, gridColumn: { xs: 'span 1', md: 'span 2' } }}>
            <Typography variant="h6" gutterBottom>
              Department × Category Heatmap
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department \ Category</TableCell>
                    {data.heatmap[0]?.categories.map((cat: { categoryId: string; categoryName: string; avgScore: number }) => (
                      <TableCell key={cat.categoryId}>{cat.categoryName}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.heatmap.map((row: { departmentId: string; departmentName: string; categories: any[] }) => (
                    <TableRow key={row.departmentId}>
                      <TableCell>{row.departmentName}</TableCell>
                      {row.categories.map((cell: { categoryId: string; categoryName: string; avgScore: number }) => (
                        <TableCell
                          key={cell.categoryId}
                          sx={{ backgroundColor: getHeatColor(cell.avgScore) }}
                        >{cell.avgScore.toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        </>
      ) : (
        <Typography>No data available</Typography>
      )}
    </Box>
  );
}
