import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {DashboardScreen} from '../screens/DashboardScreen';
import {LeadsScreen} from '../screens/LeadsScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {PropertiesScreen} from '../screens/PropertiesScreen';
import {TargetsScreen} from '../screens/TargetsScreen';
import {useNavigation} from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({color, size}) => <Icon name="home" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{
          tabBarIcon: ({color, size}) => <Icon name="people" size={size} color={color} />,
        }}
      />
      {isAdmin ? (
        <Tab.Screen
          name="AddNew"
          component={DashboardScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: () => (
              <TouchableOpacity
                style={[
                  styles.fabButton,
                  {backgroundColor: theme.colors.primary},
                  theme.shadows.lg,
                ]}
                onPress={() => navigation.navigate('AddLead')}>
                <Icon name="add" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('AddLead');
            },
          }}
        />
      ) : (
        <Tab.Screen
          name="Targets"
          component={TargetsScreen}
          options={{
            tabBarIcon: ({color, size}) => <Icon name="trophy" size={size} color={color} />,
          }}
        />
      )}
      <Tab.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{
          tabBarIcon: ({color, size}) => <Icon name="business" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => <Icon name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
