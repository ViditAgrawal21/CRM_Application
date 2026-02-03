import apiClient from '../api/client';
import {Note, Log} from '../types';

interface CreateNoteData {
  leadId: string;
  text: string;
}

interface CreateLogData {
  leadId: string;
  action: 'call' | 'whatsapp' | 'template' | 'meeting' | 'visit' | 'note' | 'status_change';
  duration?: number;
  outcome?: string;
  notes?: string;
}

export const noteService = {
  getNotes: async (leadId: string): Promise<Note[]> => {
    const response = await apiClient.get<{success: boolean; data: Note[]}>(
      `/notes?leadId=${leadId}`,
    );
    return response.data.data;
  },

  createNote: async (data: CreateNoteData): Promise<Note> => {
    const response = await apiClient.post<{success: boolean; data: Note}>('/notes', data);
    return response.data.data;
  },
};

export const logService = {
  getLogs: async (leadId: string): Promise<Log[]> => {
    const response = await apiClient.get<{success: boolean; data: Log[]}>(
      `/logs?leadId=${leadId}`,
    );
    return response.data.data;
  },

  createLog: async (data: CreateLogData): Promise<Log> => {
    const response = await apiClient.post<{success: boolean; data: Log}>('/logs', data);
    return response.data.data;
  },
};
