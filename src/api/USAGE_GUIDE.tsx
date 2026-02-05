/**
 * API Client Usage Guide
 * 
 * The API client automatically handles:
 * - JWT token injection
 * - Account deactivation (403 with ACCOUNT_DEACTIVATED code)
 * - Session expiration (401)
 * - Network errors
 * - Server errors (500, 502, 503)
 * - Auto-logout and navigation to login screen
 * 
 * All you need to do is make API calls normally!
 */

import React, {useState} from 'react';
import {View, Text, FlatList, Alert} from 'react-native';
import apiClient from '../api/client';
import {Lead} from '../types';

/**
 * Example 1: Simple GET request
 * If account is deactivated, user is automatically logged out
 * and redirected to login screen with an alert
 */
const MyComponent = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    try {
      const response = await apiClient.get('/leads');
      setLeads(response.data.data);
    } catch (error: any) {
      // Account deactivation is handled by interceptor
      // Only handle other errors here
      if (error.response?.data?.code !== 'ACCOUNT_DEACTIVATED') {
        console.error('Failed to fetch leads:', error);
        // Generic error alert (you can customize this)
        Alert.alert('Error', error.response?.data?.error || 'Failed to fetch leads');
      }
    }
  };

  return (
    <View>
      <FlatList
        data={leads}
        renderItem={({item}) => <Text>{item.name}</Text>}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

/**
 * Example 2: POST request with data
 */
const createLead = async (leadData: any) => {
  try {
    const response = await apiClient.post('/leads', leadData);
    Alert.alert('Success', 'Lead created successfully');
    return response.data.data;
  } catch (error: any) {
    // Deactivation handled automatically
    if (error.response?.data?.code !== 'ACCOUNT_DEACTIVATED') {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create lead');
    }
    throw error;
  }
};

/**
 * Example 3: Using existing services (already using apiClient)
 * All services in /services folder use apiClient, so they automatically
 * benefit from the account deactivation handling!
 */
import {leadService} from '../services/leadService';

const fetchLeadsUsingService = async () => {
  try {
    const leads = await leadService.getLeads();
    // Success handling
  } catch (error: any) {
    // Deactivation handled automatically
    if (error.response?.data?.code !== 'ACCOUNT_DEACTIVATED') {
      Alert.alert('Error', 'Failed to fetch leads');
    }
  }
};

/**
 * Example 4: Silent error handling (no alert for deactivation)
 */
const silentFetch = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error: any) {
    // Interceptor shows alert for deactivation
    // Just log or ignore here
    console.error('Silent fetch failed:', error);
    return null;
  }
};

/**
 * What happens when account is deactivated:
 * 
 * 1. API returns 403 with {code: 'ACCOUNT_DEACTIVATED', message: '...'}
 * 2. Interceptor catches this
 * 3. Clears all AsyncStorage (token, user data)
 * 4. Shows alert: "Account Deactivated - Contact administrator"
 * 5. When user presses OK, navigates to Login screen
 * 6. Component's catch block receives the error
 * 7. You can optionally handle it (but usually interceptor handles everything)
 * 
 * Best Practice:
 * - Just make API calls normally
 * - Check if error.response?.data?.code !== 'ACCOUNT_DEACTIVATED' 
 *   before showing custom error alerts
 * - Let the interceptor handle deactivation
 */

export default MyComponent;
