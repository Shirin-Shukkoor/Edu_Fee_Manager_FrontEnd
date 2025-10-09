import api from './api';

export const feeService = {
  // Course Fees
  getCourseFees: (params = {}) => api.get('/course-fees/', { params }),
  getCourseFee: (id) => api.get(`/course-fees/${id}/`),
  createCourseFee: (data) => api.post('/course-fees/', data),
  updateCourseFee: (id, data) => api.patch(`/course-fees/${id}/`, data),
  deleteCourseFee: (id) => api.delete(`/course-fees/${id}/`),
  getCourseFeeByCourse: (courseId, params = {}) => api.get(`/courses/${courseId}/fees/`, { params }),
  getCourseFeeStatistics: () => api.get('/course-fees/statistics/'),

  // Fee Management
  getFeeManagement: (params = {}) => api.get('/fee-management/', { params }),
  getFeeManagementById: (id) => api.get(`/fee-management/${id}/`),
  createFeeManagement: (data) => api.post('/fee-management/', data),
  updateFeeManagement: (id, data) => api.patch(`/fee-management/${id}/`, data),
  deleteFeeManagement: (id) => api.delete(`/fee-management/${id}/`),
  getFeeManagementByStudent: (studentId) => api.get(`/students/${studentId}/fee-management/`),
  getFeeManagementInstallments: (feeId, params = {}) => api.get(`/fee-management/${feeId}/installments/`, { params }),
  getFeeManagementStatistics: () => api.get('/fee-management/statistics/'),
  getPendingPayments: (params = {}) => api.get('/fee-management/pending-payments/', { params }),

  // Payment Management
  getPayments: (params = {}) => api.get('/payments/', { params }),
  getPayment: (id) => api.get(`/payments/${id}/`),
  createPayment: (data) => api.post('/payments/', data),
  updatePayment: (id, data) => api.patch(`/payments/${id}/`, data),
  deletePayment: (id) => api.delete(`/payments/${id}/`),
  getStudentPayments: (studentId, params = {}) => api.get(`/students/${studentId}/payments/`, { params }),
  getStudentFeeRecords: (params = {}) => api.get('/student-fee-records/', { params }),
  getPaymentStatistics: () => api.get('/payments/statistics/'),
};