import apiClient from '../api/client';
import {AuthResponse, LoginCredentials, User} from '../types';
import {saveToken, saveUser, clearStorage} from '../utils/storage';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{success: boolean; data: AuthResponse}>(
      '/auth/login',
      credentials,
    );
    
    if (response.data.success && response.data.data) {
      await saveToken(response.data.data.token);
      await saveUser(response.data.data.user);
      return response.data.data;
    }
    
    throw new Error('Login failed');
  },

  logout: async (): Promise<void> => {
    await clearStorage();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{success: boolean; data: User}>('/auth/me');
    return response.data.data;
  },
};
