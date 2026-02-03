import {Platform} from 'react-native';

// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
// For physical devices, use your computer's actual IP address (e.g., 192.168.x.x)
const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'; // Android emulator
    }
    return 'http://localhost:3000'; // iOS simulator
  }
  // Production URL
  return 'https://your-production-api.com';
};

export const config = {
  apiBaseUrl: getBaseUrl(),
  apiTimeout: 30000,
};
