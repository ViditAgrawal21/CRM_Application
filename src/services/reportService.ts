import apiClient from '../api/client';
import {DashboardStats, DailyReport, MonthlyReport, SaveDailyReportData} from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{success: boolean; data: DashboardStats}>(
      '/dashboard/stats',
    );
    return response.data.data;
  },
};

export const reportService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<{success: boolean; data: DashboardStats}>(
      '/dashboard/stats',
    );
    return response.data.data;
  },

  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const url = date ? `/reports/daily?date=${date}` : '/reports/daily';
    const response = await apiClient.get<{success: boolean; data: DailyReport}>(url);
    return response.data.data;
  },

  getMonthlyReport: async (month?: string): Promise<MonthlyReport> => {
    const url = month ? `/reports/monthly?month=${month}` : '/reports/monthly';
    const response = await apiClient.get<{success: boolean; data: MonthlyReport}>(url);
    return response.data.data;
  },

  saveDailyReport: async (data: SaveDailyReportData): Promise<DailyReport> => {
    const response = await apiClient.post<{success: boolean; data: DailyReport}>(
      '/reports/daily',
      data,
    );
    return response.data.data;
  },
};
