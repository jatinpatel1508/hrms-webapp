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

export interface RegisterCompanyData {
  companyName: string;
  domain?: string;
  address?: string;
  phone?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface CreateCompanyData {
  name: string;
  domain?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  subscriptionPlan?: string;
}

export const companyService = {
  async register(data: RegisterCompanyData) {
    const response = await api.post('/companies/register', data);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/companies');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async create(data: CreateCompanyData) {
    const response = await api.post('/companies', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCompanyData>) {
    const response = await api.patch(`/companies/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

