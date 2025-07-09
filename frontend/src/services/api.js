import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    deactivateAccount: () => api.put('/auth/deactivate'),
  },

  // Neighborhood endpoints
  neighborhoods: {
    getAll: (params) => api.get('/neighborhoods', { params }),
    getById: (id) => api.get(`/neighborhoods/${id}`),
    search: (query, limit) => api.post('/neighborhoods/search', {}, { 
      params: { query, limit } 
    }),
    getByLocation: (city, state, limit) => api.get(`/neighborhoods/location/${city}/${state}`, {
      params: { limit }
    }),
    getTopByCategory: (category, limit) => api.get(`/neighborhoods/top/${category}`, {
      params: { limit }
    }),
  },

  // Preference endpoints
  preferences: {
    save: (preferenceData) => api.post('/preferences', preferenceData),
    get: (userId) => api.get(`/preferences/${userId}`),
    update: (userId, preferenceData) => api.put(`/preferences/${userId}`, preferenceData),
    delete: (userId) => api.delete(`/preferences/${userId}`),
    getSummary: (userId) => api.get(`/preferences/${userId}/summary`),
  },

  // Match endpoints
  matches: {
    get: (userId, params) => api.get(`/matches/${userId}`, { params }),
    calculate: (limit) => api.post('/matches/calculate', {}, { params: { limit } }),
    updateInteraction: (matchId, action, rating) => api.put(`/matches/${matchId}/interaction`, {}, {
      params: { action, rating }
    }),
    getDetails: (matchId) => api.get(`/matches/${matchId}/details`),
    getSaved: (userId) => api.get(`/matches/${userId}/saved`),
    delete: (matchId) => api.delete(`/matches/${matchId}`),
  },

  // Health check
  health: () => api.get('/health'),
};

// Export the axios instance for direct use
export default api;

// Export the service object for organized API calls
export { apiService }; 