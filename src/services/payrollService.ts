import api from './api';

export interface PayrollRecord {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  idleHours: number;
  hourlyRate: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const payrollService = {
  async getAll(userId?: string) {
    const response = await api.get('/payroll', { params: { userId } });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  async calculate(userId: string, periodStart: string, periodEnd: string) {
    const response = await api.post('/payroll/calculate', {
      userId,
      periodStart,
      periodEnd,
    });
    return response.data;
  },

  async markAsPaid(id: string) {
    const response = await api.patch(`/payroll/${id}/mark-paid`);
    return response.data;
  },
};

