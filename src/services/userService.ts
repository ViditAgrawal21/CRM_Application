import apiClient from '../api/client';
import {User} from '../types';

interface CreateUserData {
  name: string;
  phone: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  monthlyMeetingTarget?: number;
  monthlyVisitTarget?: number;
  monthlyRevenueTarget?: number;
  monthlyBonus?: number;
}

export const userService = {
  getTeam: async (): Promise<User[]> => {
    const response = await apiClient.get<{success: boolean; data: User[]}>('/api/users/team');
    return response.data.data;
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post<{success: boolean; data: User}>('/api/users', data);
    return response.data.data;
  },

  deactivateUser: async (userId: string): Promise<void> => {
    await apiClient.patch(`/api/users/deactivate/${userId}`);
  },
};
