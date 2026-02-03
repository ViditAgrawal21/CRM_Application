import apiClient from '../api/client';
import {Meeting, Visit, UserRole} from '../types';

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
  scheduledTime?: Date | string;
}

interface GetMeetingsParams {
  status?: string;
  userRole?: UserRole;
  showAll?: boolean;
}

export const meetingService = {
  getMeetings: async (params?: GetMeetingsParams): Promise<Meeting[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userRole) queryParams.append('userRole', params.userRole);
    if (params?.showAll) queryParams.append('showAll', 'true');
    
    const queryString = queryParams.toString();
    const url = queryString ? `/meetings?${queryString}` : '/meetings';
    const response = await apiClient.get<{success: boolean; data: Meeting[]}>(url);
    return response.data.data;
  },

  getMeeting: async (id: string): Promise<Meeting> => {
    const response = await apiClient.get<{success: boolean; data: Meeting}>(`/meetings/${id}`);
    return response.data.data;
  },

  createMeeting: async (data: CreateMeetingData): Promise<Meeting> => {
    const response = await apiClient.post<{success: boolean; data: Meeting}>(
      '/meetings',
      data,
    );
    return response.data.data;
  },

  updateMeeting: async (id: string, data: UpdateMeetingData): Promise<Meeting> => {
    const response = await apiClient.patch<{success: boolean; data: Meeting}>(
      `/meetings/${id}`,
      data,
    );
    return response.data.data;
  },

  completeMeeting: async (id: string): Promise<Meeting> => {
    const response = await apiClient.patch<{success: boolean; data: Meeting}>(
      `/meetings/${id}`,
      {status: 'completed'},
    );
    return response.data.data;
  },

  rescheduleMeeting: async (id: string, scheduledTime: Date | string): Promise<Meeting> => {
    const response = await apiClient.patch<{success: boolean; data: Meeting}>(
      `/meetings/${id}`,
      {scheduledTime, status: 'scheduled'},
    );
    return response.data.data;
  },
};

export const visitService = {
  getVisits: async (params?: GetMeetingsParams): Promise<Visit[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userRole) queryParams.append('userRole', params.userRole);
    if (params?.showAll) queryParams.append('showAll', 'true');
    
    const queryString = queryParams.toString();
    const url = queryString ? `/visits?${queryString}` : '/visits';
    const response = await apiClient.get<{success: boolean; data: Visit[]}>(url);
    return response.data.data;
  },

  getVisit: async (id: string): Promise<Visit> => {
    const response = await apiClient.get<{success: boolean; data: Visit}>(`/visits/${id}`);
    return response.data.data;
  },

  createVisit: async (data: CreateVisitData): Promise<Visit> => {
    const response = await apiClient.post<{success: boolean; data: Visit}>('/visits', data);
    return response.data.data;
  },

  updateVisit: async (id: string, data: UpdateMeetingData): Promise<Visit> => {
    const response = await apiClient.patch<{success: boolean; data: Visit}>(
      `/visits/${id}`,
      data,
    );
    return response.data.data;
  },

  completeVisit: async (id: string): Promise<Visit> => {
    const response = await apiClient.patch<{success: boolean; data: Visit}>(
      `/visits/${id}`,
      {status: 'completed'},
    );
    return response.data.data;
  },

  rescheduleVisit: async (id: string, scheduledTime: Date | string): Promise<Visit> => {
    const response = await apiClient.patch<{success: boolean; data: Visit}>(
      `/visits/${id}`,
      {scheduledTime, status: 'scheduled'},
    );
    return response.data.data;
  },
};
