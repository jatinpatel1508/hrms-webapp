import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import api from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    screenshot_interval: '5',
    screenshot_type: 'full',
    screenshot_blur: '10',
    idle_threshold: '5',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const keys = Object.keys(settings) as Array<keyof typeof settings>;
      const values = await Promise.all(
        keys.map((key) => api.get(`/settings/${key}/value`)),
      );
      const newSettings: Record<string, string> = {};
      keys.forEach((key, index) => {
        newSettings[key] = values[index].data || settings[key];
      });
      setSettings(newSettings as typeof settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await api.patch(`/settings/${key}`, { value });
      }
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Screenshot Settings
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Screenshot Interval (minutes)"
              type="number"
              value={settings.screenshot_interval}
              onChange={(e) =>
                setSettings({ ...settings, screenshot_interval: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Screenshot Type</InputLabel>
              <Select
                value={settings.screenshot_type}
                label="Screenshot Type"
                onChange={(e) =>
                  setSettings({ ...settings, screenshot_type: e.target.value })
                }
              >
                <MenuItem value="full">Full</MenuItem>
                <MenuItem value="blurred">Blurred</MenuItem>
                <MenuItem value="thumbnail">Thumbnail</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Blur Amount"
              type="number"
              value={settings.screenshot_blur}
              onChange={(e) =>
                setSettings({ ...settings, screenshot_blur: e.target.value })
              }
              disabled={settings.screenshot_type !== 'blurred'}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Idle Detection
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Idle Threshold (minutes)"
              type="number"
              value={settings.idle_threshold}
              onChange={(e) =>
                setSettings({ ...settings, idle_threshold: e.target.value })
              }
            />
          </Grid>
        </Grid>

        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </Paper>
    </Box>
  );
}

