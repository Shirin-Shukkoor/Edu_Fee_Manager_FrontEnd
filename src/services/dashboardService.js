import api from './api';

const dashboardService = {
  // Get dashboard statistics with optional filtering
  getStatistics: (filter = 'all') => {
    const params = filter !== 'all' ? { filter } : {};
    return api.get('/dashboard/statistics/', { params });
  },

  // Get upcoming due dates (next 10 days)
  getUpcomingDues: () => {
    return api.get('/dashboard/upcoming-dues/');
  },

  // Get today's due notifications
  getTodayNotifications: () => {
    return api.get('/dashboard/today-notifications/');
  },
};

export default dashboardService;