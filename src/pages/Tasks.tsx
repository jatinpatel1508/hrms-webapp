import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { taskService, Task, CreateTaskData, TaskStatus, TaskPriority } from '../services/taskService';
import { projectService, Project } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [formData, setFormData] = useState<CreateTaskData>({
    projectId: '',
    name: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    assignedUserId: '',
    dueDate: '',
    estimatedHours: undefined,
  });

  useEffect(() => {
    loadProjects();
    loadUsers();
    loadTasks();
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAll(selectedProjectId || undefined);
      setTasks(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        projectId: task.projectId,
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignedUserId: task.assignedUserId || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours,
      });
    } else {
      setEditingTask(null);
      setFormData({
        projectId: selectedProjectId || '',
        name: '',
        description: '',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        assignedUserId: '',
        dueDate: '',
        estimatedHours: undefined,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingTask) {
        await taskService.update(editingTask.id, formData);
      } else {
        await taskService.create(formData);
      }
      handleCloseDialog();
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      setError('');
      await taskService.delete(id);
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await taskService.updateStatus(id, status);
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to update status');
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'error';
      case TaskPriority.MEDIUM:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth sx={{ maxWidth: 300 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={selectedProjectId}
            label="Filter by Project"
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {user?.role === 'super_admin' && <TableCell>Company</TableCell>}
                <TableCell>Project</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Estimated Hours</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  {user?.role === 'super_admin' && (
                    <TableCell>{(task as any).project?.company?.name || 'N/A'}</TableCell>
                  )}
                  <TableCell>{task.project?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {task.assignedUser
                      ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                      : 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      size="small"
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value={TaskStatus.PENDING}>Pending</MenuItem>
                      <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                      <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
                      <MenuItem value={TaskStatus.CANCELLED}>Cancelled</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{task.estimatedHours || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(task)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(task.id)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.projectId}
                label="Project"
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Task Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  >
                    <MenuItem value={TaskStatus.PENDING}>Pending</MenuItem>
                    <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                    <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
                    <MenuItem value={TaskStatus.CANCELLED}>Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  >
                    <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                    <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={formData.assignedUserId}
                label="Assigned To"
                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Estimated Hours"
                  type="number"
                  fullWidth
                  value={formData.estimatedHours || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

