import api from './api';

export interface TimeLog {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  idleTime: number;
  description?: string;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const timeLogService = {
  async getAll(params?: {
    userId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/time-logs', { params });
    return response.data;
  },

  async getActive() {
    const response = await api.get('/time-logs/active');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/time-logs/${id}`);
    return response.data;
  },

  async create(data: Partial<TimeLog>) {
    const response = await api.post('/time-logs', data);
    return response.data;
  },

  async update(id: string, data: Partial<TimeLog>) {
    const response = await api.patch(`/time-logs/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/time-logs/${id}`);
    return response.data;
  },
};

