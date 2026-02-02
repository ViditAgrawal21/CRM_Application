import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../hooks/useAuth';
import {LoginScreen} from '../screens/LoginScreen';
import {AddLeadScreen} from '../screens/AddLeadScreen';
import {LeadDetailsScreen} from '../screens/LeadDetailsScreen';
import {FollowUpScreen} from '../screens/FollowUpScreen';
import {BacklogScreen} from '../screens/BacklogScreen';
import {TemplatesScreen} from '../screens/TemplatesScreen';
import {MeetingScheduleScreen} from '../screens/MeetingScheduleScreen';
import {VisitScheduleScreen} from '../screens/VisitScheduleScreen';
import {ReportsScreen} from '../screens/ReportsScreen';
import {BottomTabNavigator} from './BottomTabNavigator';
import {LoadingSpinner} from '../components';
import {useTheme} from '../hooks/useTheme';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();
  const {theme} = useTheme();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddLead"
              component={AddLeadScreen}
              options={{title: 'Add New Lead'}}
            />
            <Stack.Screen
              name="LeadDetails"
              component={LeadDetailsScreen}
              options={{title: 'Lead Details'}}
            />
            <Stack.Screen
              name="FollowUp"
              component={FollowUpScreen}
              options={{title: "Today's Follow-ups"}}
            />
            <Stack.Screen
              name="Backlog"
              component={BacklogScreen}
              options={{title: 'Backlog Follow-ups'}}
            />
            <Stack.Screen
              name="Templates"
              component={TemplatesScreen}
              options={{title: 'Message Templates'}}
            />
            <Stack.Screen
              name="MeetingSchedule"
              component={MeetingScheduleScreen}
              options={{title: 'Meeting Schedule'}}
            />
            <Stack.Screen
              name="VisitSchedule"
              component={VisitScheduleScreen}
              options={{title: 'Visit Schedule'}}
            />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
              options={{title: 'Reports'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
