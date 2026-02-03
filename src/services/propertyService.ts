import apiClient from '../api/client';
import {Property} from '../types';

export const propertyService = {
  getProperties: async (location?: string): Promise<Property[]> => {
    const url = location ? `/properties?location=${location}` : '/properties';
    const response = await apiClient.get<{success: boolean; data: Property[]}>(url);
    return response.data.data;
  },
};
