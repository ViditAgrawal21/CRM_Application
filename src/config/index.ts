import {Platform} from 'react-native';

// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
// For physical devices, use your computer's actual IP address (e.g., 192.168.x.x)
const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Android emulator
    }
    return 'http://localhost:3000/api'; // iOS simulator
  }
  // Production URL
  return 'https://your-production-api.com/api';
};

export const config = {
  apiBaseUrl: getBaseUrl(),
  propertyApiBaseUrl: 'https://property-website-748576937648.us-central1.run.app',
  apiTimeout: 30000,
};
