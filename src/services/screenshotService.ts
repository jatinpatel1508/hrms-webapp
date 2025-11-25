import api from './api';

export interface Screenshot {
  id: string;
  userId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  type: 'full' | 'blurred' | 'thumbnail';
  capturedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const screenshotService = {
  async getAll(params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/screenshots', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/screenshots/${id}`);
    return response.data;
  },

  getFileUrl(id: string): string {
    return `${api.defaults.baseURL}/screenshots/${id}/file`;
  },

  async delete(id: string) {
    const response = await api.delete(`/screenshots/${id}`);
    return response.data;
  },
};

