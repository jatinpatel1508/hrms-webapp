import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { timeLogService, TimeLog } from '../services/timeLogService';
import { projectService, Project } from '../services/projectService';
import { format } from 'date-fns';
import { websocketService } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';

export default function TimeLogs() {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState({
    projectId: '',
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    loadTimeLogs();

    // Listen for real-time updates
    const handleTimeLogUpdate = () => {
      loadTimeLogs();
    };

    websocketService.on('time-log-update', handleTimeLogUpdate);

    return () => {
      websocketService.off('time-log-update', handleTimeLogUpdate);
    };
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTimeLogs = async () => {
    try {
      setError(null);
      const data = await timeLogService.getAll({
        projectId: filters.projectId || undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setTimeLogs(data);
    } catch (error: any) {
      console.error('Error loading time logs:', error);
      setError(error.userMessage || 'Failed to load time logs');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Time Logs
      </Typography>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl sx={{ minWidth: 200 }}>
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
          <Button variant="contained" onClick={loadTimeLogs}>
            Filter
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {user?.role === 'super_admin' && <TableCell>Company</TableCell>}
                <TableCell>Project</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Idle Time</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.startTime), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  {user?.role === 'super_admin' && (
                    <TableCell>{(log as any).company?.name || 'N/A'}</TableCell>
                  )}
                  <TableCell>{log.project?.name || 'No Project'}</TableCell>
                  <TableCell>{log.task?.name || '-'}</TableCell>
                  <TableCell>{formatDuration(log.duration - log.idleTime)}</TableCell>
                  <TableCell>{formatDuration(log.idleTime)}</TableCell>
                  <TableCell>{log.description || '-'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

