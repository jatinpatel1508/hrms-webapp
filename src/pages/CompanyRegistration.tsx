import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { companyService } from '../services/companyService';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function CompanyRegistration() {
  const [formData, setFormData] = useState({
    companyName: '',
    domain: '',
    address: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await companyService.register({
        companyName: formData.companyName,
        domain: formData.domain || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
      });

      // Auto-login after registration
      if (result.admin) {
        await login(formData.adminEmail, formData.adminPassword);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.userMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Register Your Company
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Create a new company account and admin user
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Company Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="companyName"
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="domain"
                  label="Domain (optional)"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  label="Address (optional)"
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone (optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Admin Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="adminFirstName"
                  label="First Name"
                  name="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="adminLastName"
                  label="Last Name"
                  name="adminLastName"
                  value={formData.adminLastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="adminEmail"
                  label="Email Address"
                  name="adminEmail"
                  type="email"
                  autoComplete="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="adminPassword"
                  label="Password"
                  type="password"
                  id="adminPassword"
                  autoComplete="new-password"
                  value={formData.adminPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Company'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign in
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

