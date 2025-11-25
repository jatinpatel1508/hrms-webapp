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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { screenshotService, Screenshot } from '../services/screenshotService';
import { userService, User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function Screenshots() {
  const { user } = useAuth();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    type: '',
    userId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      loadUsers();
    }
    loadScreenshots();
  }, [filters]);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadScreenshots = async () => {
    setLoading(true);
    try {
      const userId = user?.role === 'admin' || user?.role === 'manager' 
        ? (filters.userId || undefined)
        : user?.id;
      const data = await screenshotService.getAll({
        userId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setScreenshots(data);
    } catch (error) {
      console.error('Error loading screenshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (screenshot: Screenshot) => {
    setSelectedScreenshot(screenshot);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this screenshot?')) {
      try {
        await screenshotService.delete(id);
        loadScreenshots();
      } catch (error) {
        console.error('Error deleting screenshot:', error);
        alert('Failed to delete screenshot');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const filteredScreenshots = filters.type
    ? screenshots.filter((s) => s.type === filters.type)
    : screenshots;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Screenshots
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={user?.role === 'admin' || user?.role === 'manager' ? 2 : 3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={user?.role === 'admin' || user?.role === 'manager' ? 2 : 3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={filters.userId}
                  label="User"
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={user?.role === 'admin' || user?.role === 'manager' ? 2 : 3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="blurred">Blurred</MenuItem>
                <MenuItem value="thumbnail">Thumbnail</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={user?.role === 'admin' || user?.role === 'manager' ? 2 : 3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={loadScreenshots}
              disabled={loading}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Typography>Loading screenshots...</Typography>
      ) : filteredScreenshots.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No screenshots found for the selected period.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredScreenshots.map((screenshot) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={screenshot.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={screenshotService.getFileUrl(screenshot.id)}
                  alt={`Screenshot from ${format(new Date(screenshot.capturedAt), 'MMM dd, yyyy HH:mm')}`}
                  sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                  onClick={() => handleView(screenshot)}
                  style={{ cursor: 'pointer' }}
                />
                <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                  <Box>
                    <Typography variant="caption" display="block">
                      {format(new Date(screenshot.capturedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {screenshot.type} • {formatFileSize(screenshot.fileSize)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(screenshot.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedScreenshot &&
                `Screenshot - ${format(new Date(selectedScreenshot.capturedAt), 'MMM dd, yyyy HH:mm')}`}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedScreenshot && (
            <Box>
              <img
                src={screenshotService.getFileUrl(selectedScreenshot.id)}
                alt="Screenshot"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Type: {selectedScreenshot.type} | Size: {formatFileSize(selectedScreenshot.fileSize)} | 
                  Captured: {format(new Date(selectedScreenshot.capturedAt), 'PPpp')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

