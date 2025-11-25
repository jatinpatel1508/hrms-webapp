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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { userService, User, CreateUserData } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { companyService, Company } from '../services/companyService';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    companyId: undefined,
    hourlyRate: undefined,
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
    if (currentUser?.role === 'super_admin') {
      loadCompanies();
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll();
      setCompanies(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      console.error('Error loading companies:', err);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '', // Don't pre-fill password
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'employee' | 'manager' | 'admin',
        companyId: (user as any).companyId || undefined,
        hourlyRate: user.hourlyRate,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        companyId: undefined,
        hourlyRate: undefined,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const submitData = { ...formData };
      
      // Don't send password if editing and password is empty
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      // For super admin creating new user, companyId is required
      if (!editingUser && currentUser?.role === 'super_admin' && !submitData.companyId) {
        setError('Company selection is required');
        return;
      }

      // For non-super admin, don't send companyId (it will use their company)
      if (currentUser?.role !== 'super_admin') {
        delete submitData.companyId;
      } else if (editingUser && !submitData.companyId) {
        // For super admin editing, if companyId is not provided, don't send it (keep existing)
        delete submitData.companyId;
      }

      if (editingUser) {
        await userService.update(editingUser.id, submitData);
      } else {
        // Password is required for new users
        if (!submitData.password) {
          setError('Password is required for new users');
          return;
        }
        await userService.create(submitData);
      }
      handleCloseDialog();
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      setError('');
      await userService.delete(id);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to delete user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'manager':
        return 'info';
      default:
        return 'default';
    }
  };

  // Only admin and manager can manage users
  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'super_admin';

  if (!canManageUsers) {
    return (
      <Box>
        <Alert severity="error">You don't have permission to view this page.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
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
                <TableCell>Email</TableCell>
                {currentUser?.role === 'super_admin' && <TableCell>Company</TableCell>}
                <TableCell>Role</TableCell>
                <TableCell>Hourly Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  {currentUser?.role === 'super_admin' && (
                    <TableCell>{user.company?.name || 'N/A'}</TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.hourlyRate ? `$${user.hourlyRate}/hr` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
            />
            <TextField
              label={editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
              type="password"
              required={!editingUser}
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                required
                fullWidth
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Box>
            {currentUser?.role === 'super_admin' && (
              <FormControl fullWidth>
                <InputLabel>Company</InputLabel>
                <Select
                  value={formData.companyId || ''}
                  label="Company"
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value || undefined })}
                  required={!editingUser}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                {currentUser?.role === 'super_admin' && (
                  <MenuItem value="admin">Admin</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              label="Hourly Rate ($/hr)"
              type="number"
              fullWidth
              value={formData.hourlyRate || ''}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

