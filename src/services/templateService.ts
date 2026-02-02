import apiClient from '../api/client';
import {Template} from '../types';

interface CreateTemplateData {
  title: string;
  message: string;
}

export const templateService = {
  getTemplates: async (): Promise<Template[]> => {
    const response = await apiClient.get<{success: boolean; data: Template[]}>(
      '/api/templates',
    );
    return response.data.data;
  },

  createTemplate: async (data: CreateTemplateData): Promise<Template> => {
    const response = await apiClient.post<{success: boolean; data: Template}>(
      '/api/templates',
      data,
    );
    return response.data.data;
  },

  updateTemplate: async (
    id: string,
    data: Partial<CreateTemplateData>,
  ): Promise<Template> => {
    const response = await apiClient.patch<{success: boolean; data: Template}>(
      `/api/templates/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/templates/${id}`);
  },
};
