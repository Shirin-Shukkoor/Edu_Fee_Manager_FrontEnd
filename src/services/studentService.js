import api from './api';

export const studentService = {
  // Get all students with filters
  getStudents: (params = {}) => api.get('/students/', { params }),
  
  // Get student by ID
  getStudent: (id) => api.get(`/students/${id}/`),
  
  // Create new student
  createStudent: (data) => api.post('/students/', data),
  
  // Update student
  updateStudent: (id, data) => api.patch(`/students/${id}/`, data),
  
  // Delete student
  deleteStudent: (id) => api.delete(`/students/${id}/`),
  
  // Get active students
  getActiveStudents: (params = {}) => api.get('/students/active/', { params }),
  
  // Get students by course/batch
  getStudentsByCourse: (courseId, params = {}) => api.get(`/courses/${courseId}/students/`, { params }),
  getStudentsByBatch: (batchId, params = {}) => api.get(`/batches/${batchId}/students/`, { params }),
  
  // Bulk operations
  bulkActivate: (studentIds) => api.post('/students/bulk-activate/', { student_ids: studentIds }),
  bulkDeactivate: (studentIds) => api.post('/students/bulk-deactivate/', { student_ids: studentIds }),
  
  // Get statistics
  getStatistics: () => api.get('/students/statistics/'),
};