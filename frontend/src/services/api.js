import axios from 'axios';

// Get base URL: priority is localStorage override -> env variable -> default localhost:5000/api
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('rentmart_api_url');
    if (custom) return custom;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach dynamic baseURL and JWT token automatically on every request
api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle unauthorized responses
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;
