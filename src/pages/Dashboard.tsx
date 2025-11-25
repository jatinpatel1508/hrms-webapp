import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { timeLogService, TimeLog } from '../services/timeLogService';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { websocketService } from '../services/websocketService';

export default function Dashboard() {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [stats, setStats] = useState({
    todayHours: 0,
    weekHours: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    loadData();

    // Listen for real-time updates
    const handleTimeLogUpdate = (_data: TimeLog) => {
      loadData(); // Reload data when time log is updated
    };

    websocketService.on('time-log-update', handleTimeLogUpdate);

    return () => {
      websocketService.off('time-log-update', handleTimeLogUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const startDate = subDays(new Date(), 7).toISOString();
      const endDate = new Date().toISOString();
      
      const logs = await timeLogService.getAll({
        userId: user?.role === 'admin' || user?.role === 'manager' ? undefined : user?.id,
        startDate,
        endDate,
      });

      setTimeLogs(logs);

      // Calculate stats
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayLogs = logs.filter(
        (log: TimeLog) => format(new Date(log.startTime), 'yyyy-MM-dd') === today
      );
      const todaySeconds = todayLogs.reduce((sum: number, log: TimeLog) => sum + log.duration - log.idleTime, 0);
      const weekSeconds = logs.reduce((sum: number, log: TimeLog) => sum + log.duration - log.idleTime, 0);

      setStats({
        todayHours: todaySeconds / 3600,
        weekHours: weekSeconds / 3600,
        activeProjects: new Set(logs.map((log: TimeLog) => log.projectId).filter(Boolean)).size,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const chartData = timeLogs.reduce((acc, log) => {
    const date = format(new Date(log.startTime), 'MMM dd');
    if (!acc[date]) {
      acc[date] = { date, hours: 0 };
    }
    acc[date].hours += (log.duration - log.idleTime) / 3600;
    return acc;
  }, {} as Record<string, { date: string; hours: number }>);

  const chartDataArray = Object.values(chartData);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user?.firstName} {user?.lastName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Hours
              </Typography>
              <Typography variant="h4">
                {stats.todayHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                This Week's Hours
              </Typography>
              <Typography variant="h4">
                {stats.weekHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Projects
              </Typography>
              <Typography variant="h4">
                {stats.activeProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hours Worked (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataArray}>
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
      </Grid>
    </Box>
  );
}

