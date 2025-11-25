import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { projectService, Project } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    billingRate: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleOpen = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || '',
        billingRate: project.billingRate?.toString() || '',
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', billingRate: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        billingRate: formData.billingRate ? parseFloat(formData.billingRate) : undefined,
      };

      if (editingProject) {
        await projectService.update(editingProject.id, data);
      } else {
        await projectService.create(data);
      }

      handleClose();
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          New Project
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                {user?.role === 'super_admin' && <TableCell>Company</TableCell>}
                <TableCell>Billing Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description || '-'}</TableCell>
                  {user?.role === 'super_admin' && (
                    <TableCell>{(project as any).company?.name || 'N/A'}</TableCell>
                  )}
                  <TableCell>
                    {project.billingRate ? `$${project.billingRate}/hr` : '-'}
                  </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(project)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'New Project'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Billing Rate ($/hr)"
            margin="normal"
            type="number"
            value={formData.billingRate}
            onChange={(e) =>
              setFormData({ ...formData, billingRate: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

