import api from './api';

export const courseService = {
  // Get all courses with filters
  getCourses: (params = {}) => api.get('/courses/', { params }),
  
  // Get course by ID
  getCourse: (id) => api.get(`/courses/${id}/`),
  
  // Create new course
  createCourse: (data) => api.post('/courses/', data),
  
  // Update course
  updateCourse: (id, data) => api.patch(`/courses/${id}/`, data),
  
  // Delete course
  deleteCourse: (id) => api.delete(`/courses/${id}/`),
  
  // Get active courses
  getActiveCourses: (params = {}) => api.get('/courses/active/', { params }),
  
  // Bulk operations
  bulkActivate: (courseIds) => api.post('/courses/bulk-activate/', { course_ids: courseIds }),
  bulkDeactivate: (courseIds) => api.post('/courses/bulk-deactivate/', { course_ids: courseIds }),
  
  // Get statistics
  getStatistics: () => api.get('/courses/statistics/'),
};