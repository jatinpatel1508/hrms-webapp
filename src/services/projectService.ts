import api from './api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  billingRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const projectService = {
  async getAll() {
    const response = await api.get('/projects');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async create(data: Partial<Project>) {
    const response = await api.post('/projects', data);
    return response.data;
  },

  async update(id: string, data: Partial<Project>) {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

