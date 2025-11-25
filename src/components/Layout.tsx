import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccessTime as TimeLogsIcon,
  Folder as ProjectsIcon,
  AttachMoney as PayrollIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  CameraAlt as ScreenshotsIcon,
  Business as CompaniesIcon,
  Assignment as TasksIcon,
  People as UsersIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import ConnectionStatus from './ConnectionStatus';

const drawerWidth = 240;

const getMenuItems = (userRole?: string) => {
  const items = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Time Logs', icon: <TimeLogsIcon />, path: '/time-logs' },
    { text: 'Projects', icon: <ProjectsIcon />, path: '/projects' },
    { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { text: 'Payroll', icon: <PayrollIcon />, path: '/payroll' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Screenshots', icon: <ScreenshotsIcon />, path: '/screenshots' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Add Users menu item for admin, manager, and super_admin
  if (userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin') {
    items.splice(4, 0, { text: 'Users', icon: <UsersIcon />, path: '/users' });
  }

  // Add Companies menu item for super admin
  if (userRole === 'super_admin') {
    items.splice(4, 0, { text: 'Companies', icon: <CompaniesIcon />, path: '/companies' });
  }

  return items;
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            HRMS Time Tracking
          </Typography>
          <Avatar
            sx={{ cursor: 'pointer' }}
            onClick={handleMenuOpen}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {getMenuItems(user?.role).map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
        <ConnectionStatus />
      </Box>
    </Box>
  );
}

