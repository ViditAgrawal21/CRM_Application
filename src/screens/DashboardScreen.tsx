import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, LoadingSpinner, Badge, Avatar} from '../components';
import {dashboardService} from '../services/reportService';
import {meetingService, visitService} from '../services/meetingService';
import {getGreeting, getRoleLabel, isOwnerRole, formatDate, formatTime, extractTimeFromRemark} from '../utils/helpers';
import {useNavigation} from '@react-navigation/native';
import {Meeting, Visit} from '../types';

export const DashboardScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const isOwner = isOwnerRole(user?.role || '');

  const [activityFilter, setActivityFilter] = useState<'my' | 'team'>('my');
  const [selectedActivity, setSelectedActivity] = useState<Meeting | Visit | null>(null);
  const [activityModalVisible, setActivityModalVisible] = useState(false);

  const {data: stats, isLoading, refetch} = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  // Fetch meetings for owner dashboard
  const {data: meetings} = useQuery({
    queryKey: ['dashboard-meetings', activityFilter],
    queryFn: () => meetingService.getMeetings({
      userRole: user?.role,
      showAll: isOwner && activityFilter === 'team',
    }),
    enabled: isOwner,
  });

  // Fetch visits for owner dashboard
  const {data: visits} = useQuery({
    queryKey: ['dashboard-visits', activityFilter],
    queryFn: () => visitService.getVisits({
      userRole: user?.role,
      showAll: isOwner && activityFilter === 'team',
    }),
    enabled: isOwner,
  });

  const greeting = getGreeting();

  const actionCards = [
    {title: 'Lead (+)', icon: 'person-add-outline', screen: 'AddLead', params: {type: 'lead'}, color: '#FF9800'},
    {title: 'Data', icon: 'document-text-outline', screen: 'AddLead', params: {type: 'data'}, color: '#2196F3'},
    {title: 'Follow Up', icon: 'time-outline', screen: 'FollowUp', color: '#4CAF50'},
    {title: 'Backlog', icon: 'alert-circle-outline', screen: 'Backlog', color: '#FF9800'},
    {title: 'Meeting Schedule', icon: 'calendar-outline', screen: 'MeetingSchedule', color: '#9C27B0'},
    {title: 'Visit Schedule', icon: 'navigate-outline', screen: 'VisitSchedule', color: '#F44336'},
    {title: 'Bulk Upload', icon: 'cloud-upload-outline', screen: 'BulkUpload', params: {type: 'lead'}, color: '#009688'},
    {title: 'Template', icon: 'chatbox-outline', screen: 'Templates', color: '#2196F3'},
    {title: 'Daily Report', icon: 'today-outline', screen: 'DailyReport', color: '#4CAF50'},
    {title: 'Monthly Report', icon: 'calendar-number-outline', screen: 'MonthlyReport', color: '#00BCD4'},
  ];

  const getStatusColor = (status: string, isPast: boolean) => {
    if (status === 'completed') return '#4CAF50'; // Green
    if (isPast) return '#F44336'; // Red for missed
    return '#2196F3'; // Blue for scheduled
  };

  const handleActivityPress = (activity: Meeting | Visit) => {
    setSelectedActivity(activity);
    setActivityModalVisible(true);
  };

  const renderActivityItem = (activity: Meeting | Visit, type: 'meeting' | 'visit') => {
    const isPast = new Date(activity.scheduled_at) < new Date();
    const statusColor = getStatusColor(activity.status, isPast);
    const extractedTime = extractTimeFromRemark(activity.remark || '');

    return (
      <TouchableOpacity
        key={activity.id}
        style={[styles.activityItem, {borderLeftColor: statusColor, borderLeftWidth: 4}]}
        onPress={() => handleActivityPress(activity)}>
        <View style={styles.activityHeader}>
          <View style={{flex: 1}}>
            <Text style={[theme.typography.body2, {color: theme.colors.text, fontWeight: '600'}]}>
              {activity.lead?.name || 'Unknown Lead'}
            </Text>
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
              {formatDate(activity.scheduled_at)} • {formatTime(activity.scheduled_at)}
            </Text>
          </View>
          <Badge
            text={type === 'meeting' ? 'MEETING' : 'VISIT'}
            variant={type === 'meeting' ? 'meeting' : 'propertyVisit'}
          />
        </View>

        {/* Show user info for team view */}
        {isOwner && activityFilter === 'team' && activity.user && (
          <View style={styles.activityUser}>
            <Icon name="person-outline" size={14} color={theme.colors.primary} />
            <Text style={[theme.typography.caption, {color: theme.colors.primary, marginLeft: 4}]}>
              {activity.user.name} • {activity.user.phone}
            </Text>
          </View>
        )}

        {/* Show remark if exists */}
        {activity.remark && (
          <View style={styles.activityRemark}>
            <Icon name="chatbubble-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, marginLeft: 4, flex: 1}]} numberOfLines={1}>
              {activity.remark}
            </Text>
            {extractedTime && (
              <Text style={[theme.typography.caption, {color: theme.colors.success}]}>
                📅 {extractedTime}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Combine and sort activities by date
  const allActivities = [
    ...(meetings || []).map(m => ({...m, type: 'meeting' as const})),
    ...(visits || []).map(v => ({...v, type: 'visit' as const})),
  ].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const upcomingActivities = allActivities.filter(
    a => a.status === 'scheduled' && new Date(a.scheduled_at) >= new Date()
  );

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

        {/* Owner Dashboard - Team Activities Section */}
        {isOwner && (
          <View style={styles.activitiesSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                Team Activities
              </Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activityFilter === 'my' && {backgroundColor: theme.colors.primary},
                  ]}
                  onPress={() => setActivityFilter('my')}>
                  <Text style={[
                    theme.typography.caption,
                    {color: activityFilter === 'my' ? '#FFFFFF' : theme.colors.text},
                  ]}>
                    My
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    activityFilter === 'team' && {backgroundColor: theme.colors.primary},
                  ]}
                  onPress={() => setActivityFilter('team')}>
                  <Text style={[
                    theme.typography.caption,
                    {color: activityFilter === 'team' ? '#FFFFFF' : theme.colors.text},
                  ]}>
                    Team
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#4CAF50'}]} />
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  Completed
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#2196F3'}]} />
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  Scheduled
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#F44336'}]} />
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  Missed
                </Text>
              </View>
            </View>

            {/* Activities List */}
            <Card style={{marginTop: 12}}>
              {upcomingActivities.length > 0 ? (
                upcomingActivities.slice(0, 5).map(activity => 
                  renderActivityItem(activity, activity.type)
                )
              ) : (
                <View style={styles.emptyActivities}>
                  <Icon name="calendar-outline" size={48} color={theme.colors.textLight} />
                  <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, marginTop: 12}]}>
                    No upcoming activities
                  </Text>
                </View>
              )}

              {upcomingActivities.length > 5 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('MeetingSchedule')}>
                  <Text style={[theme.typography.body2, {color: theme.colors.primary}]}>
                    View All ({upcomingActivities.length})
                  </Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </Card>
          </View>
        )}

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
                  navigation.navigate(action.screen, action.params || {});
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

      {/* Activity Detail Modal */}
      <Modal
        visible={activityModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setActivityModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                Activity Details
              </Text>
              <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedActivity && (
              <View style={styles.modalBody}>
                {/* Lead Info */}
                <View style={styles.modalLeadInfo}>
                  <Avatar name={selectedActivity.lead?.name || 'Unknown'} size={48} />
                  <View style={{marginLeft: 12, flex: 1}}>
                    <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                      {selectedActivity.lead?.name || 'Unknown Lead'}
                    </Text>
                    <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                      {selectedActivity.lead?.phone}
                    </Text>
                  </View>
                </View>

                {/* Employee Info */}
                {selectedActivity.user && (
                  <View style={[styles.modalSection, {backgroundColor: theme.colors.primaryLight || '#E3F2FD'}]}>
                    <Icon name="person" size={20} color={theme.colors.primary} />
                    <View style={{marginLeft: 12, flex: 1}}>
                      <Text style={[theme.typography.caption, {color: theme.colors.primary}]}>
                        ASSIGNED TO
                      </Text>
                      <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                        {selectedActivity.user.name}
                      </Text>
                      <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                        {selectedActivity.user.phone}
                      </Text>
                    </View>
                  </View>
                )}

                {/* DateTime */}
                <View style={styles.modalRow}>
                  <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[theme.typography.body1, {color: theme.colors.text, marginLeft: 12}]}>
                    {formatDate(selectedActivity.scheduled_at)} at {formatTime(selectedActivity.scheduled_at)}
                  </Text>
                </View>

                {/* Location */}
                <View style={styles.modalRow}>
                  <Icon name="location-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[theme.typography.body1, {color: theme.colors.text, marginLeft: 12}]}>
                    {('location' in selectedActivity ? selectedActivity.location : (selectedActivity as Visit).site_location) || 'N/A'}
                  </Text>
                </View>

                {/* Remark */}
                {selectedActivity.remark && (
                  <View style={[styles.modalSection, {backgroundColor: theme.colors.background}]}>
                    <Icon name="chatbubble" size={20} color={theme.colors.textSecondary} />
                    <View style={{marginLeft: 12, flex: 1}}>
                      <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                        REMARK
                      </Text>
                      <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                        {selectedActivity.remark}
                      </Text>
                      {extractTimeFromRemark(selectedActivity.remark) && (
                        <Text style={[theme.typography.body2, {color: theme.colors.success, marginTop: 4}]}>
                          📅 {extractTimeFromRemark(selectedActivity.remark)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* View Details Button */}
                <TouchableOpacity
                  style={[styles.viewDetailsButton, {backgroundColor: theme.colors.primary}]}
                  onPress={() => {
                    setActivityModalVisible(false);
                    const isMeeting = 'location' in selectedActivity;
                    navigation.navigate(
                      isMeeting ? 'MeetingDetail' : 'VisitDetail',
                      {[isMeeting ? 'meetingId' : 'visitId']: selectedActivity.id}
                    );
                  }}>
                  <Text style={[theme.typography.body1, {color: '#FFFFFF'}]}>
                    View Full Details
                  </Text>
                  <Icon name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  activitiesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  activityRemark: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  emptyActivities: {
    padding: 32,
    alignItems: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBody: {
    gap: 16,
  },
  modalLeadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSection: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
});
