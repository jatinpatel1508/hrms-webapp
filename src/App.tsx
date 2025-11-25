import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Login from './pages/Login';
import CompanyRegistration from './pages/CompanyRegistration';
import Dashboard from './pages/Dashboard';
import TimeLogs from './pages/TimeLogs';
import Projects from './pages/Projects';
import Payroll from './pages/Payroll';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Screenshots from './pages/Screenshots';
import Companies from './pages/Companies';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#50c878',
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/company-registration" element={<CompanyRegistration />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="time-logs" element={<TimeLogs />} />
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="users" element={<Users />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="settings" element={<Settings />} />
              <Route path="reports" element={<Reports />} />
              <Route path="screenshots" element={<Screenshots />} />
              <Route path="companies" element={<Companies />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

