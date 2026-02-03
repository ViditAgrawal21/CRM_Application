import apiClient from '../api/client';
import {Followup} from '../types';

interface CreateFollowupData {
  leadId: string;
  reminderAt: string;
  notes?: string;
}

interface UpdateFollowupData {
  status?: 'pending' | 'done' | 'cancelled';
  outcome?: string;
  notes?: string;
}

export const followupService = {
  getTodayFollowups: async (): Promise<Followup[]> => {
    const response = await apiClient.get<{success: boolean; data: Followup[]}>(
      '/followups/today',
    );
    return response.data.data;
  },

  getBacklog: async (): Promise<Followup[]> => {
    const response = await apiClient.get<{success: boolean; data: Followup[]}>(
      '/followups/backlog',
    );
    return response.data.data;
  },

  createFollowup: async (data: CreateFollowupData): Promise<Followup> => {
    const response = await apiClient.post<{success: boolean; data: Followup}>(
      '/followups',
      data,
    );
    return response.data.data;
  },

  updateFollowup: async (id: string, data: UpdateFollowupData): Promise<Followup> => {
    const response = await apiClient.patch<{success: boolean; data: Followup}>(
      `/followups/${id}`,
      data,
    );
    return response.data.data;
  },
};
