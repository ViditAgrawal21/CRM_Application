import apiClient from '../api/client';
import {Meeting, Visit} from '../types';

interface CreateMeetingData {
  leadId: string;
  scheduledTime: Date | string;
  location: string;
  purpose?: string;
}

interface CreateVisitData {
  leadId: string;
  scheduledTime: Date | string;
  property: string;
  notes?: string;
}

interface UpdateMeetingData {
  status?: 'scheduled' | 'completed' | 'cancelled';
  outcome?: string;
  notes?: string;
}

export const meetingService = {
  getMeetings: async (status?: string): Promise<Meeting[]> => {
    const url = status ? `/api/meetings?status=${status}` : '/api/meetings';
    const response = await apiClient.get<{success: boolean; data: Meeting[]}>(url);
    return response.data.data;
  },

  createMeeting: async (data: CreateMeetingData): Promise<Meeting> => {
    const response = await apiClient.post<{success: boolean; data: Meeting}>(
      '/api/meetings',
      data,
    );
    return response.data.data;
  },

  updateMeeting: async (id: string, data: UpdateMeetingData): Promise<Meeting> => {
    const response = await apiClient.patch<{success: boolean; data: Meeting}>(
      `/api/meetings/${id}`,
      data,
    );
    return response.data.data;
  },

  completeMeeting: async (id: string): Promise<Meeting> => {
    const response = await apiClient.patch<{success: boolean; data: Meeting}>(
      `/api/meetings/${id}`,
      {status: 'completed'},
    );
    return response.data.data;
  },
};

export const visitService = {
  getVisits: async (status?: string): Promise<Visit[]> => {
    const url = status ? `/api/visits?status=${status}` : '/api/visits';
    const response = await apiClient.get<{success: boolean; data: Visit[]}>(url);
    return response.data.data;
  },

  createVisit: async (data: CreateVisitData): Promise<Visit> => {
    const response = await apiClient.post<{success: boolean; data: Visit}>('/api/visits', data);
    return response.data.data;
  },

  updateVisit: async (id: string, data: UpdateMeetingData): Promise<Visit> => {
    const response = await apiClient.patch<{success: boolean; data: Visit}>(
      `/api/visits/${id}`,
      data,
    );
    return response.data.data;
  },

  completeVisit: async (id: string): Promise<Visit> => {
    const response = await apiClient.patch<{success: boolean; data: Visit}>(
      `/api/visits/${id}`,
      {status: 'completed'},
    );
    return response.data.data;
  },
};
