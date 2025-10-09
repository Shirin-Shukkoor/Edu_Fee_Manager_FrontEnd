import api from './api';

export const batchService = {
  // Get all batches with filters
  getBatches: (params = {}) => api.get('/batches/', { params }),
  
  // Get batch by ID
  getBatch: (id) => api.get(`/batches/${id}/`),
  
  // Create new batch
  createBatch: (data) => api.post('/batches/', data),
  
  // Update batch
  updateBatch: (id, data) => api.patch(`/batches/${id}/`, data),
  
  // Delete batch
  deleteBatch: (id) => api.delete(`/batches/${id}/`),
  
  // Get active batches
  getActiveBatches: (params = {}) => api.get('/batches/active/', { params }),
};