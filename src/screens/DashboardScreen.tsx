import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, LoadingSpinner} from '../components';
import {dashboardService} from '../services/reportService';
import {getGreeting, getRoleLabel} from '../utils/helpers';
import {useNavigation} from '@react-navigation/native';

export const DashboardScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<any>();

  const {data: stats, isLoading, refetch} = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const greeting = getGreeting();

  const actionCards = [
    {title: 'Lead (+)', icon: 'person-add-outline', screen: 'AddLead', color: '#FF9800'},
    {title: 'Data', icon: 'document-text-outline', screen: 'Leads', color: '#2196F3'},
    {title: 'Follow Up', icon: 'time-outline', screen: 'FollowUp', color: '#4CAF50'},
    {title: 'Backlog', icon: 'alert-circle-outline', screen: 'Backlog', color: '#FF9800'},
    {title: 'Meeting Schedule', icon: 'calendar-outline', screen: 'MeetingSchedule', color: '#9C27B0'},
    {title: 'Visit Schedule', icon: 'navigate-outline', screen: 'VisitSchedule', color: '#F44336'},
    {title: 'Add Lead/Data', icon: 'add-circle-outline', screen: 'AddLead', color: '#FF9800'},
    {title: 'Template', icon: 'chatbox-outline', screen: 'Templates', color: '#2196F3'},
    {title: 'Report', icon: 'stats-chart-outline', screen: 'Reports', color: '#F44336'},
    {title: 'History Monthly', icon: 'calendar-number-outline', screen: 'History', color: '#00BCD4'},
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[theme.colors.primary]} />
        }>
        {/* Header with User Info */}
        <View style={[styles.header, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full},
              ]}>
              <Text style={[theme.typography.h4, {color: '#FFFFFF'}]}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                {getRoleLabel(user?.role || '').toUpperCase()}
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                Hi {user?.name}!
              </Text>
            </View>
          </View>
        </View>

        {/* Greeting Card with Gradient */}
        <View style={styles.greetingSection}>
          <Card style={styles.greetingCard}>
            <Text style={[theme.typography.h2, {color: '#FFFFFF', marginBottom: 8}]}>
              {greeting}
            </Text>
            <Text style={[theme.typography.body2, {color: '#FFFFFF', opacity: 0.9}]}>
              You have {stats?.overview.pendingFollowups || 0} follow-ups scheduled for today.
            </Text>
          </Card>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={[theme.typography.body1, {color: theme.colors.textSecondary}]}>
              Total Lead
            </Text>
            <View
              style={[
                styles.badge,
                {backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.sm},
              ]}>
              <Text style={[theme.typography.caption, {color: '#FFFFFF'}]}>+12%</Text>
            </View>
          </View>
          <Text style={[theme.typography.h1, {color: theme.colors.text, marginBottom: 20}]}>
            {stats?.overview.totalLeads || 428}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="call" size={20} color={theme.colors.primary} />
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Calls
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>24</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="people" size={20} color={theme.colors.primary} />
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Meetings
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                {stats?.thisMonth.meetings || 12}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="navigate" size={20} color={theme.colors.primary} />
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Visits
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                {stats?.thisMonth.visits || 8}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="bookmark" size={20} color={theme.colors.primary} />
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Booked
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>3</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions Title */}
        <Text
          style={[
            styles.sectionTitle,
            theme.typography.h4,
            {color: theme.colors.text},
          ]}>
          Quick Actions
        </Text>

        {/* Action Grid with Colored Borders */}
        <View style={styles.actionGrid}>
          {actionCards.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.borderRadius.lg,
                },
                theme.shadows.sm,
              ]}
              onPress={() => {
                if (action.screen) {
                  navigation.navigate(action.screen);
                }
              }}>
              <View style={[styles.colorBar, {backgroundColor: action.color}]} />
              <View style={styles.actionContent}>
                <View
                  style={[
                    styles.iconCircle,
                    {backgroundColor: action.color + '20'},
                  ]}>
                  <Icon name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text
                  style={[
                    theme.typography.body2,
                    {color: theme.colors.text, marginTop: 8, textAlign: 'center'},
                  ]}>
                  {action.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  greetingCard: {
    padding: 24,
    backgroundColor: '#FF9800',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    width: '47%',
    overflow: 'hidden',
    marginBottom: 12,
  },
  colorBar: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  actionContent: {
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
