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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { companyService, Company, CreateCompanyData } from '../services/companyService';
import { useAuth } from '../contexts/AuthContext';

export default function Companies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    domain: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
    subscriptionPlan: '',
  });

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      if (isSuperAdmin) {
        const data = await companyService.getAll();
        setCompanies(Array.isArray(data) ? data : [data]);
      } else {
        // Regular admin can view their own company
        const data = await companyService.getById(user!.companyId);
        setCompanies([data]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        domain: company.domain || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        isActive: company.isActive,
        subscriptionPlan: company.subscriptionPlan || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        domain: '',
        address: '',
        phone: '',
        email: '',
        isActive: true,
        subscriptionPlan: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
  };

  const handleViewCompany = async (id: string) => {
    try {
      const company = await companyService.getById(id);
      setViewingCompany(company);
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to load company');
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingCompany) {
        await companyService.update(editingCompany.id, formData);
      } else {
        await companyService.create(formData);
      }
      handleCloseDialog();
      loadCompanies();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to save company');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }
    try {
      setError('');
      await companyService.delete(id);
      loadCompanies();
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Failed to delete company');
    }
  };

  if (!isSuperAdmin && user) {
    // Regular admin view - show only their company
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Company Information
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : companies.length > 0 ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {companies[0].name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Domain: {companies[0].domain || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {companies[0].email || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {companies[0].phone || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Address: {companies[0].address || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subscription Plan: {companies[0].subscriptionPlan || 'N/A'}
            </Typography>
            <Chip
              label={companies[0].isActive ? 'Active' : 'Inactive'}
              color={companies[0].isActive ? 'success' : 'default'}
              sx={{ mt: 2 }}
            />
          </Paper>
        ) : null}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Companies</Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Company
          </Button>
        )}
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
                <TableCell>Domain</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Subscription Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.domain || 'N/A'}</TableCell>
                  <TableCell>{company.email || 'N/A'}</TableCell>
                  <TableCell>{company.phone || 'N/A'}</TableCell>
                  <TableCell>{company.subscriptionPlan || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={company.isActive ? 'Active' : 'Inactive'}
                      color={company.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewCompany(company.id)}
                      title="View"
                    >
                      <ViewIcon />
                    </IconButton>
                    {isSuperAdmin && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(company)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(company.id)}
                          title="Delete"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
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
          {editingCompany ? 'Edit Company' : 'Create Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Company Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Domain"
              fullWidth
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Address"
              multiline
              rows={2}
              fullWidth
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Subscription Plan</InputLabel>
              <Select
                value={formData.subscriptionPlan}
                label="Subscription Plan"
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                label="Status"
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingCompany} onClose={() => setViewingCompany(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Company Details</DialogTitle>
        <DialogContent>
          {viewingCompany && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><strong>Name:</strong> {viewingCompany.name}</Typography>
              <Typography><strong>Domain:</strong> {viewingCompany.domain || 'N/A'}</Typography>
              <Typography><strong>Email:</strong> {viewingCompany.email || 'N/A'}</Typography>
              <Typography><strong>Phone:</strong> {viewingCompany.phone || 'N/A'}</Typography>
              <Typography><strong>Address:</strong> {viewingCompany.address || 'N/A'}</Typography>
              <Typography><strong>Subscription Plan:</strong> {viewingCompany.subscriptionPlan || 'N/A'}</Typography>
              <Typography><strong>Status:</strong> 
                <Chip
                  label={viewingCompany.isActive ? 'Active' : 'Inactive'}
                  color={viewingCompany.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCompany(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

