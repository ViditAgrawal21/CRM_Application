import axios, {AxiosInstance, InternalAxiosRequestConfig, AxiosError} from 'axios';
import {Alert} from 'react-native';
import {config} from '../config';
import {getToken, clearStorage} from '../utils/storage';

const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (axiosConfig: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && axiosConfig.headers) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor with better error handling
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    // Network error
    if (!error.response) {
      Alert.alert(
        'Network Error',
        'Unable to connect to server. Please check your internet connection.',
      );
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Handle different HTTP status codes
    switch (status) {
      case 401:
        // Unauthorized - clear storage and force re-login
        await clearStorage();
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
        );
        break;

      case 403:
        Alert.alert('Access Denied', 'You do not have permission to perform this action.');
        break;

      case 404:
        Alert.alert('Not Found', 'The requested resource was not found.');
        break;

      case 500:
      case 502:
      case 503:
        Alert.alert('Server Error', 'Something went wrong on our end. Please try again later.');
        break;

      default:
        // Show error message from API if available
        const message = (error.response?.data as any)?.message || 'An unexpected error occurred';
        Alert.alert('Error', message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
