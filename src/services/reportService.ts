import apiClient from '../api/client';
import {DashboardStats, DailyReport, MonthlyReport} from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{success: boolean; data: DashboardStats}>(
      '/api/dashboard/stats',
    );
    return response.data.data;
  },
};

export const reportService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{success: boolean; data: DashboardStats}>(
      '/api/dashboard/stats',
    );
    return response.data.data;
  },

  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const url = date ? `/api/reports/daily?date=${date}` : '/api/reports/daily';
    const response = await apiClient.get<{success: boolean; data: DailyReport}>(url);
    return response.data.data;
  },

  getMonthlyReport: async (month?: string): Promise<MonthlyReport> => {
    const url = month ? `/api/reports/monthly?month=${month}` : '/api/reports/monthly';
    const response = await apiClient.get<{success: boolean; data: MonthlyReport}>(url);
    return response.data.data;
  },

  saveDailyReport: async (reportDate: string, nextDayPlan: string): Promise<void> => {
    await apiClient.post('/api/reports/daily', {reportDate, nextDayPlan});
  },
};
