// Centralized API configuration with automatic JWT auth headers
import axios from 'axios';
import { getAuthData, clearAuthData } from './auth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor — automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const { token } = getAuthData();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth and redirect to login
      clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
