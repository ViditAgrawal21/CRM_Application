import apiClient from '../api/client';
import {Lead, CreateLeadData, LeadType, BulkUploadRecord, BulkUploadResponse} from '../types';

export interface UpdateLeadRemarkData {
  remark: string;
}

export interface GetLeadsParams {
  type?: LeadType;
}

export const leadService = {
  getLeads: async (params?: GetLeadsParams): Promise<Lead[]> => {
    let url = '/leads';
    if (params?.type) {
      url += `?type=${params.type}`;
    }
    const response = await apiClient.get<{success: boolean; data: Lead[]}>(url);
    return response.data.data;
  },

  getLead: async (leadId: string): Promise<Lead> => {
    const response = await apiClient.get<{success: boolean; data: Lead}>(`/leads/${leadId}`);
    return response.data.data;
  },

  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await apiClient.post<{success: boolean; data: Lead}>('/leads', data);
    return response.data.data;
  },

  updateLead: async (leadId: string, data: Partial<CreateLeadData>): Promise<Lead> => {
    const response = await apiClient.patch<{success: boolean; data: Lead}>(
      `/leads/${leadId}`,
      data,
    );
    return response.data.data;
  },

  // Update lead remark - backend auto-syncs to meetings/visits
  updateLeadRemark: async (leadId: string, remark: string): Promise<Lead> => {
    const response = await apiClient.patch<{success: boolean; data: Lead}>(
      `/leads/${leadId}`,
      {remark},
    );
    return response.data.data;
  },

  assignLead: async (leadId: string, assignedTo: string): Promise<void> => {
    await apiClient.post('/leads/assign', {leadId, assignedTo});
  },

  // Bulk upload leads/data from Excel
  bulkUpload: async (
    type: LeadType,
    date: string,
    records: BulkUploadRecord[],
  ): Promise<BulkUploadResponse> => {
    const response = await apiClient.post<{success: boolean; data: BulkUploadResponse}>(
      '/leads/bulk/upload',
      {
        type,
        date,
        records,
      },
    );
    return response.data.data;
  },
};
