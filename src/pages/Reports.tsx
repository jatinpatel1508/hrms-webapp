import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { timeLogService, TimeLog } from '../services/timeLogService';
import { appUsageService, AppUsageStats } from '../services/appUsageService';
import { projectService, Project } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#4a90e2', '#50c878', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

export default function Reports() {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [appUsageStats, setAppUsageStats] = useState<AppUsageStats[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState({
    period: 'week',
    startDate: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
    projectId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = filters.startDate;
      const endDate = filters.endDate;

      // Load time logs
      const logs = await timeLogService.getAll({
        userId: user?.role === 'admin' || user?.role === 'manager' ? undefined : user?.id,
        projectId: filters.projectId || undefined,
        startDate,
        endDate,
      });
      setTimeLogs(logs);

      // Load app usage stats
      const userId = user?.role === 'admin' || user?.role === 'manager' ? undefined : user?.id;
      if (userId) {
        const stats = await appUsageService.getStats(userId, startDate, endDate);
        setAppUsageStats(stats);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'today':
        startDate = new Date();
        endDate = new Date();
        break;
      case 'week':
        startDate = startOfWeek(new Date());
        endDate = endOfWeek(new Date());
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      default:
        startDate = subDays(new Date(), 7);
    }

    setFilters({
      ...filters,
      period,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  const exportToCSV = () => {
    const csvRows = [
      ['Date', 'Project', 'Duration (hours)', 'Idle Time (hours)', 'Description'].join(','),
    ];

    timeLogs.forEach((log) => {
      const row = [
        format(new Date(log.startTime), 'yyyy-MM-dd HH:mm'),
        log.project?.name || 'No Project',
        ((log.duration - log.idleTime) / 3600).toFixed(2),
        (log.idleTime / 3600).toFixed(2),
        log.description || '',
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Create a simple PDF using window.print() with custom styling
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Time Tracking Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 { color: #4a90e2; }
            .summary {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-item {
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #4a90e2;
              color: white;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Time Tracking Report</h1>
          <p><strong>Period:</strong> ${format(new Date(filters.startDate), 'MMM dd, yyyy')} - ${format(new Date(filters.endDate), 'MMM dd, yyyy')}</p>
          
          <div class="summary">
            <div class="summary-item">
              <strong>Total Hours:</strong> ${totalHours.toFixed(2)}h
            </div>
            <div class="summary-item">
              <strong>Productive Hours:</strong> ${productiveHours.toFixed(2)}h
            </div>
            <div class="summary-item">
              <strong>Idle Hours:</strong> ${totalIdleHours.toFixed(2)}h
            </div>
            <div class="summary-item">
              <strong>Avg Hours/Day:</strong> ${avgHoursPerDay.toFixed(2)}h
            </div>
          </div>

          <h2>Time Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Duration (h)</th>
                <th>Idle Time (h)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${timeLogs.map((log) => `
                <tr>
                  <td>${format(new Date(log.startTime), 'MMM dd, yyyy HH:mm')}</td>
                  <td>${log.project?.name || 'No Project'}</td>
                  <td>${((log.duration - log.idleTime) / 3600).toFixed(2)}</td>
                  <td>${(log.idleTime / 3600).toFixed(2)}</td>
                  <td>${log.description || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Calculate statistics
  const totalHours = timeLogs.reduce((sum, log) => sum + (log.duration - log.idleTime) / 3600, 0);
  const totalIdleHours = timeLogs.reduce((sum, log) => sum + log.idleTime / 3600, 0);
  const productiveHours = totalHours - totalIdleHours;
  const avgHoursPerDay = timeLogs.length > 0 ? totalHours / new Set(timeLogs.map(log => format(new Date(log.startTime), 'yyyy-MM-dd'))).size : 0;

  // Prepare chart data
  const dailyHoursData = timeLogs.reduce((acc, log) => {
    const date = format(new Date(log.startTime), 'MMM dd');
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += (log.duration - log.idleTime) / 3600;
    return acc;
  }, {} as Record<string, number>);

  const dailyChartData = Object.entries(dailyHoursData).map(([date, hours]) => ({
    date,
    hours: Number(hours.toFixed(2)),
  }));

  const projectHoursData = timeLogs.reduce((acc, log) => {
    const projectName = log.project?.name || 'No Project';
    if (!acc[projectName]) {
      acc[projectName] = 0;
    }
    acc[projectName] += (log.duration - log.idleTime) / 3600;
    return acc;
  }, {} as Record<string, number>);

  const projectChartData = Object.entries(projectHoursData).map(([name, hours]) => ({
    name,
    value: Number(hours.toFixed(2)),
  }));

  const appUsageChartData = appUsageStats
    .slice(0, 10)
    .map((stat) => ({
      name: stat.appName,
      hours: Number((stat.totalDuration / 3600).toFixed(2)),
    }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Typography variant="h4">Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={exportToCSV} disabled={loading}>
            Export CSV
          </Button>
          <Button variant="contained" onClick={exportToPDF} disabled={loading}>
            Export PDF
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={filters.period}
                label="Period"
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {filters.period === 'custom' && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.projectId}
                label="Project"
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Hours
              </Typography>
              <Typography variant="h4">{totalHours.toFixed(2)}h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Productive Hours
              </Typography>
              <Typography variant="h4">{productiveHours.toFixed(2)}h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Idle Hours
              </Typography>
              <Typography variant="h4">{totalIdleHours.toFixed(2)}h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Hours/Day
              </Typography>
              <Typography variant="h4">{avgHoursPerDay.toFixed(2)}h</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Hours Worked
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#4a90e2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hours by Project
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {appUsageChartData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Applications Used
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appUsageChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#50c878" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
