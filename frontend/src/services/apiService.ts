/**
 * API Service - Centralized HTTP client
 * All API calls go through this service using POST method
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BASE_URL = 'http://localhost:3005/api/';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized, UNLESS we are already on the login page
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * All API calls use POST method as required
 */
const ApiService = {
  login: (data: any) => apiClient.post('login', data), // Login doesn't wrap in { data } because it's public
  getEmployeeList: (data: any) => apiClient.post('getEmployeeList', { data }),
  addEditEmployee: (data: any) => apiClient.post('addEditEmployee', { data }),
  getSpecificEmployee: (data: any) => apiClient.post('getSpecificEmployee', { data }),
  deleteEmployee: (data: any) => apiClient.post('deleteEmployee', { data }),
  getDashboardStats: () => apiClient.post('getDashboardStats', { data: {} }),
  getDynamicChartData: (data: any) => apiClient.post('getDynamicChartData', { data }),
  getHealthRecords: (data: any = {}) => apiClient.post('getHealthRecords', { data }),
  addHealthRecord: (data: any) => apiClient.post('addHealthRecord', { data }),
  deleteHealthRecord: (data: any) => apiClient.post('deleteHealthRecord', { data }),
  getJobRotationSuggestions: () => apiClient.post('getJobRotationSuggestions', { data: {} }),
  executeJobRotation: (data: any) => apiClient.post('executeJobRotation', { data }),
  revertTemporarySwap: (data: any) => apiClient.post('revertTemporarySwap', { data }),
  getRotationAuditTrail: () => apiClient.post('getRotationAuditTrail', { data: {} }),
  respondToAutomatedRecommendation: (data: any) => apiClient.post('respondToAutomatedRecommendation', { data }),
  getSickLeaves: () => apiClient.post('getSickLeaves', { data: {} }),
  addSickLeave: (data: any) => apiClient.post('addSickLeave', { data }),
  getSymptomImpactTrend: () => apiClient.post('getSymptomImpactTrend', { data: {} }),
  runSchedulerSimulation: () => apiClient.post('runSchedulerSimulation', { data: {} }),
};

export default ApiService;
