import apiClient from '../api/client';
import {Lead, CreateLeadData} from '../types';

export const leadService = {
  getLeads: async (): Promise<Lead[]> => {
    const response = await apiClient.get<{success: boolean; data: Lead[]}>('/api/leads');
    return response.data.data;
  },

  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await apiClient.post<{success: boolean; data: Lead}>('/api/leads', data);
    return response.data.data;
  },

  updateLead: async (leadId: string, data: Partial<CreateLeadData>): Promise<Lead> => {
    const response = await apiClient.patch<{success: boolean; data: Lead}>(
      `/api/leads/${leadId}`,
      data,
    );
    return response.data.data;
  },

  assignLead: async (leadId: string, assignedTo: string): Promise<void> => {
    await apiClient.post('/api/leads/assign', {leadId, assignedTo});
  },

  bulkUpload: async (csvContent: string): Promise<void> => {
    await apiClient.post('/api/leads/bulk', {csvContent});
  },
};
