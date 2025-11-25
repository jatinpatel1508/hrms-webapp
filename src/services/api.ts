import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle token expiration and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx errors
    if (
      (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
      config &&
      !config._retry &&
      (config._retryCount || 0) < MAX_RETRIES
    ) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;

      await sleep(RETRY_DELAY * config._retryCount);
      return api(config);
    }

    // Format error message for user
    const errorMessage =
      error.response?.data && typeof error.response.data === 'object'
        ? (error.response.data as any).message || 'An error occurred'
        : error.message || 'Network error. Please check your connection.';

    return Promise.reject({
      ...error,
      userMessage: errorMessage,
    });
  },
);

export default api;

