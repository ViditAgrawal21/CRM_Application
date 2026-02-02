import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, LoadingSpinner} from '../components';
import {reportService} from '../services/reportService';

export const TargetsScreen: React.FC = () => {
  const {theme} = useTheme();

  const {data: stats, isLoading} = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const meetingProgress = stats ? Math.round((stats.thisMonth.meetings / (stats.meetingsTarget || 1)) * 100) : 0;
  const visitProgress = stats ? Math.round((stats.thisMonth.visits / 20) * 100) : 0; // Assuming 20 visit target
  const targetMet = meetingProgress >= 100 && visitProgress >= 100;

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        <Text style={[theme.typography.h3, {color: theme.colors.text, marginBottom: 16}]}>
          Monthly Targets
        </Text>

        <Card>
          <View style={styles.targetRow}>
            <Text style={[theme.typography.body1, {color: theme.colors.textSecondary}]}>
              Meeting Target
            </Text>
            <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
              {stats?.thisMonth.meetings || 0} / {stats?.meetingsTarget || 0}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${meetingProgress}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </Card>

        <Card style={{marginTop: 16}}>
          <View style={styles.targetRow}>
            <Text style={[theme.typography.body1, {color: theme.colors.textSecondary}]}>
              Visit Target
            </Text>
            <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
              {stats?.thisMonth.visits || 0} / 20
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${visitProgress}%`,
                  backgroundColor: theme.colors.success,
                },
              ]}
            />
          </View>
        </Card>

        {targetMet && (
          <Card style={{marginTop: 16, backgroundColor: theme.colors.success}}>
            <Text style={[theme.typography.h4, {color: '#FFFFFF', textAlign: 'center'}]}>
              🎉 Target Achieved!
            </Text>
          </Card>
        )}
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
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});
