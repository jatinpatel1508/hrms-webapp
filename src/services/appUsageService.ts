import api from './api';

export interface AppUsageLog {
  id: string;
  userId: string;
  appName: string;
  windowTitle?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  isProductive: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AppUsageStats {
  appName: string;
  totalDuration: number;
  count: number;
}

export const appUsageService = {
  async getAll(params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/app-usage', { params });
    return response.data;
  },

  async getStats(userId: string, startDate: string, endDate: string) {
    const response = await api.get('/app-usage/stats', {
      params: { userId, startDate, endDate },
    });
    return response.data;
  },
};

