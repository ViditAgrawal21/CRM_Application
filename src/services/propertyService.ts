import axios from 'axios';
import {config} from '../config';
import {Property, SharePropertyRequest, SharePropertyResponse} from '../types';
import {getToken} from '../utils/storage';

const propertyApi = axios.create({
  baseURL: config.propertyApiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
propertyApi.interceptors.request.use(
  async config => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Handle response errors
propertyApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'Request failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  },
);

export const propertyService = {
  // Get all properties
  getProperties: async (): Promise<Property[]> => {
    const response = await propertyApi.get<any[]>(
      '/api/public/properties',
    );
    // Transform snake_case API response to camelCase
    return response.data.map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      propertyType: prop.property_type,
      location: prop.location,
      imageUrl: prop.image_url,
      status: prop.status,
      possession: prop.possession,
      totalLandAcres: prop.total_land_acres,
      totalTowers: prop.total_towers,
      amenitiesSummary: prop.amenities_summary,
      totalFloors: prop.total_floors,
      listingBy: prop.listing_by,
      phone: prop.phone,
      driveLink: prop.drive_link,
      unitsLine: prop.units_line,
      createdAt: prop.created_at,
      updatedAt: prop.updated_at,
    }));
  },

  // Get single property by ID
  getProperty: async (propertyId: number): Promise<Property> => {
    const response = await propertyApi.get<any>(
      `/api/public/properties/${propertyId}`,
    );
    const prop = response.data;
    // Transform snake_case API response to camelCase
    return {
      id: prop.id,
      title: prop.title,
      propertyType: prop.property_type,
      location: prop.location,
      imageUrl: prop.image_url,
      status: prop.status,
      possession: prop.possession,
      totalLandAcres: prop.total_land_acres,
      totalTowers: prop.total_towers,
      amenitiesSummary: prop.amenities_summary,
      totalFloors: prop.total_floors,
      listingBy: prop.listing_by,
      phone: prop.phone,
      driveLink: prop.drive_link,
      unitsLine: prop.units_line,
      createdAt: prop.created_at,
      updatedAt: prop.updated_at,
    };
  },

  // Share property via WhatsApp
  shareProperty: async (
    propertyId: number,
    data: SharePropertyRequest,
  ): Promise<SharePropertyResponse> => {
    const response = await propertyApi.post<{success: boolean; data: SharePropertyResponse}>(
      `/api/properties/${propertyId}/share`,
      data,
    );
    return response.data.data;
  },
};
