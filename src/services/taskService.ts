import api from './api';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Task {
  id: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedUserId?: string;
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dueDate?: string;
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  projectId: string;
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedUserId?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export const taskService = {
  async getAll(projectId?: string) {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async create(data: CreateTaskData) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTaskData>) {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async assignTask(id: string, userId: string) {
    const response = await api.patch(`/tasks/${id}/assign`, { userId });
    return response.data;
  },

  async updateStatus(id: string, status: TaskStatus) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },
};

