import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card} from '../components';
import {getRoleLabel} from '../utils/helpers';

export const SettingsScreen: React.FC = () => {
  const {theme, themeMode, toggleTheme} = useTheme();
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        {/* Profile Section */}
        <Card>
          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full},
              ]}>
              <Text style={[theme.typography.h2, {color: '#FFFFFF'}]}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[theme.typography.h3, {color: theme.colors.text, marginTop: 12}]}>
              {user?.name}
            </Text>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              {user?.phone}
            </Text>
            <View
              style={[
                styles.roleBadge,
                {backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.sm},
              ]}>
              <Text style={[theme.typography.caption, {color: '#FFFFFF'}]}>
                {getRoleLabel(user?.role || '')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 12}]}>
            Appearance
          </Text>
          <Card>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon
                  name={themeMode === 'dark' ? 'moon' : 'sunny'}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{false: theme.colors.border, true: theme.colors.primary}}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 12}]}>
            Account
          </Text>
          
          <Card>
            <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <Icon name="log-out-outline" size={24} color={theme.colors.error} />
                <Text style={[theme.typography.body1, {color: theme.colors.error}]}>
                  Logout
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={[theme.typography.caption, {color: theme.colors.textLight}]}>
            CRM App v1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  section: {
    marginTop: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
});
