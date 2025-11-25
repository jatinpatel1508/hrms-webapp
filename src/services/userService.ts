import api from './api';

export interface Company {
  id: string;
  name: string;
  domain?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  subscriptionPlan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'admin' | 'super_admin';
  hourlyRate?: number;
  isActive: boolean;
  companyId?: string;
  company?: Company;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'employee' | 'manager' | 'admin';
  companyId?: string;
  hourlyRate?: number;
  isActive?: boolean;
}

export const userService = {
  async getAll() {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserData) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateUserData>) {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

