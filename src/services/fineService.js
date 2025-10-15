import api from './api';

export const fineService = {
  // Get all fines with filtering
  getFines: (params = {}) => {
    return api.get('/fines/', { params });
  },

  // Get specific fine
  getFine: (uid) => {
    return api.get(`/fines/${uid}/`);
  },

  // Create new fine
  createFine: (data) => {
    return api.post('/fines/', data);
  },

  // Update fine
  updateFine: (uid, data) => {
    return api.patch(`/fines/${uid}/`, data);
  },

  // Mark fine as paid
  markFinePaid: (uid) => {
    return api.post(`/fines/${uid}/mark-paid/`);
  },

  // Waive fine
  waiveFine: (uid, data) => {
    return api.post(`/fines/${uid}/waive/`, data);
  },

  // Get overdue students
  getOverdueStudents: (params = {}) => {
    return api.get('/fines/overdue-students/', { params });
  },

  // Get fine statistics
  getFineStatistics: () => {
    return api.get('/fines/statistics/');
  }
};