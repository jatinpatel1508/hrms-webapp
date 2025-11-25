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
  Button,
  TextField,
} from '@mui/material';
import { payrollService, PayrollRecord } from '../services/payrollService';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export default function Payroll() {
  const { user } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [calculateForm, setCalculateForm] = useState({
    userId: '',
    periodStart: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    periodEnd: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadPayrollRecords();
  }, []);

  const loadPayrollRecords = async () => {
    try {
      const data = await payrollService.getAll();
      setPayrollRecords(data);
    } catch (error) {
      console.error('Error loading payroll records:', error);
    }
  };

  const handleCalculate = async () => {
    try {
      await payrollService.calculate(
        calculateForm.userId,
        calculateForm.periodStart,
        calculateForm.periodEnd,
      );
      loadPayrollRecords();
    } catch (error) {
      console.error('Error calculating payroll:', error);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await payrollService.markAsPaid(id);
      loadPayrollRecords();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(2);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payroll
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Calculate Payroll
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField
            label="User ID"
            value={calculateForm.userId}
            onChange={(e) =>
              setCalculateForm({ ...calculateForm, userId: e.target.value })
            }
          />
          <TextField
            label="Period Start"
            type="date"
            value={calculateForm.periodStart}
            onChange={(e) =>
              setCalculateForm({ ...calculateForm, periodStart: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Period End"
            type="date"
            value={calculateForm.periodEnd}
            onChange={(e) =>
              setCalculateForm({ ...calculateForm, periodEnd: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleCalculate}>
            Calculate
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                {user?.role === 'super_admin' && <TableCell>Company</TableCell>}
                <TableCell>Period</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Idle Hours</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrollRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.user
                      ? `${record.user.firstName} ${record.user.lastName}`
                      : '-'}
                  </TableCell>
                  {user?.role === 'super_admin' && (
                    <TableCell>{(record as any).company?.name || 'N/A'}</TableCell>
                  )}
                <TableCell>
                  {format(new Date(record.periodStart), 'MMM dd')} -{' '}
                  {format(new Date(record.periodEnd), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{formatHours(record.totalHours)}</TableCell>
                <TableCell>{formatHours(record.idleHours)}</TableCell>
                <TableCell>${record.hourlyRate}/hr</TableCell>
                <TableCell>${record.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  {record.isPaid ? (
                    <span style={{ color: 'green' }}>Paid</span>
                  ) : (
                    <span style={{ color: 'orange' }}>Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  {!record.isPaid && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleMarkAsPaid(record.id)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

