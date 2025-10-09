import api from './api';

export const authService = {
  // Login
  login: (credentials) => api.post('/auth/login/', credentials),
  
  // Logout
  logout: () => api.post('/auth/logout/'),
  
  // Register (only for superusers)
  register: (userData) => api.post('/auth/register/', userData),
  
  // Profile management
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  
  // Password management
  changePassword: (data) => api.post('/auth/change-password/', data),
  
  // Token management
  validateToken: () => api.get('/auth/validate-token/'),
  refreshToken: () => api.post('/auth/refresh-token/'),
};