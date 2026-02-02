import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {Card, LoadingSpinner, StatCard} from '../components';
import {reportService} from '../services/reportService';
import {formatDate} from '../utils/helpers';

export const ReportsScreen: React.FC = () => {
  const {theme} = useTheme();
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');

  const {data: dailyReport, isLoading: dailyLoading} = useQuery({
    queryKey: ['dailyReport'],
    queryFn: () => reportService.getDailyReport(),
    enabled: reportType === 'daily',
  });

  const {data: monthlyReport, isLoading: monthlyLoading} = useQuery({
    queryKey: ['monthlyReport'],
    queryFn: () => reportService.getMonthlyReport(),
    enabled: reportType === 'monthly',
  });

  const {data: stats} = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  const generateReportText = () => {
    if (reportType === 'daily' && dailyReport) {
      return `📊 *Daily CRM Report* - ${formatDate(new Date())}

📞 *Calls Made*: ${dailyReport.callsMade}
✅ *Followups Done*: ${dailyReport.followupsDone}
🤝 *Meetings*: ${dailyReport.meetings}
🏠 *Visits*: ${dailyReport.visits}
📝 *Leads Added*: ${dailyReport.leadsAdded}
💰 *Deals Closed*: ${dailyReport.dealsClosed}

---
Generated via CRM App`;
    }

    if (reportType === 'monthly' && monthlyReport) {
      return `📊 *Monthly CRM Report* - ${formatDate(new Date())}

📞 *Total Calls*: ${monthlyReport.totalCalls}
✅ *Total Followups*: ${monthlyReport.totalFollowups}
🤝 *Total Meetings*: ${monthlyReport.totalMeetings}
🏠 *Total Visits*: ${monthlyReport.totalVisits}
📝 *Leads Added*: ${monthlyReport.leadsAdded}
💰 *Deals Closed*: ${monthlyReport.dealsClosed}
📈 *Conversion Rate*: ${monthlyReport.conversionRate}%

🎯 *Target Achievement*: ${monthlyReport.targetAchievement}%

---
Generated via CRM App`;
    }

    return '';
  };

  const shareOnWhatsApp = () => {
    const text = generateReportText();
    if (text) {
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed');
        }
      });
    }
  };

  const isLoading = reportType === 'daily' ? dailyLoading : monthlyLoading;
  const report = reportType === 'daily' ? dailyReport : monthlyReport;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Report Type Selector */}
        <View style={styles.selector}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              reportType === 'daily' && {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={() => setReportType('daily')}>
            <Text
              style={[
                theme.typography.body1,
                {color: reportType === 'daily' ? '#FFFFFF' : theme.colors.text},
              ]}>
              Daily Report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectorButton,
              reportType === 'monthly' && {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={() => setReportType('monthly')}>
            <Text
              style={[
                theme.typography.body1,
                {color: reportType === 'monthly' ? '#FFFFFF' : theme.colors.text},
              ]}>
              Monthly Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Header */}
        <Card>
          <View style={styles.dateHeader}>
            <Icon name="calendar" size={24} color={theme.colors.primary} />
            <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
              {reportType === 'daily' ? "Today's Report" : 'This Month'}
            </Text>
          </View>
          <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
            {formatDate(new Date())}
          </Text>
        </Card>

        {/* Stats Grid */}
        {reportType === 'daily' && dailyReport && (
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <StatCard
                title="Calls Made"
                value={dailyReport.callsMade.toString()}
                icon="call"
                color="#2196F3"
                style={{flex: 1}}
              />
              <StatCard
                title="Followups"
                value={dailyReport.followupsDone.toString()}
                icon="checkmark-circle"
                color="#4CAF50"
                style={{flex: 1}}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                title="Meetings"
                value={dailyReport.meetings.toString()}
                icon="people"
                color="#FF9800"
                style={{flex: 1}}
              />
              <StatCard
                title="Visits"
                value={dailyReport.visits.toString()}
                icon="home"
                color="#9C27B0"
                style={{flex: 1}}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                title="Leads Added"
                value={dailyReport.leadsAdded.toString()}
                icon="person-add"
                color="#00BCD4"
                style={{flex: 1}}
              />
              <StatCard
                title="Deals Closed"
                value={dailyReport.dealsClosed.toString()}
                icon="trophy"
                color="#FF5722"
                style={{flex: 1}}
              />
            </View>
          </View>
        )}

        {reportType === 'monthly' && monthlyReport && (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statRow}>
                <StatCard
                  title="Total Calls"
                  value={monthlyReport.totalCalls.toString()}
                  icon="call"
                  color="#2196F3"
                  style={{flex: 1}}
                />
                <StatCard
                  title="Followups"
                  value={monthlyReport.totalFollowups.toString()}
                  icon="checkmark-circle"
                  color="#4CAF50"
                  style={{flex: 1}}
                />
              </View>

              <View style={styles.statRow}>
                <StatCard
                  title="Meetings"
                  value={monthlyReport.totalMeetings.toString()}
                  icon="people"
                  color="#FF9800"
                  style={{flex: 1}}
                />
                <StatCard
                  title="Visits"
                  value={monthlyReport.totalVisits.toString()}
                  icon="home"
                  color="#9C27B0"
                  style={{flex: 1}}
                />
              </View>

              <View style={styles.statRow}>
                <StatCard
                  title="Leads Added"
                  value={monthlyReport.leadsAdded.toString()}
                  icon="person-add"
                  color="#00BCD4"
                  style={{flex: 1}}
                />
                <StatCard
                  title="Deals Closed"
                  value={monthlyReport.dealsClosed.toString()}
                  icon="trophy"
                  color="#FF5722"
                  style={{flex: 1}}
                />
              </View>
            </View>

            {/* Performance Metrics */}
            <Card style={{marginTop: 16}}>
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 16}]}>
                Performance Metrics
              </Text>

              <View style={styles.metricRow}>
                <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                  Conversion Rate
                </Text>
                <Text style={[theme.typography.h4, {color: theme.colors.success}]}>
                  {monthlyReport.conversionRate}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${monthlyReport.conversionRate}%`,
                      backgroundColor: theme.colors.success,
                      borderRadius: theme.borderRadius.sm,
                    },
                  ]}
                />
              </View>

              <View style={styles.metricRow}>
                <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                  Target Achievement
                </Text>
                <Text style={[theme.typography.h4, {color: theme.colors.primary}]}>
                  {monthlyReport.targetAchievement}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${monthlyReport.targetAchievement}%`,
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.sm,
                    },
                  ]}
                />
              </View>
            </Card>
          </>
        )}

        {/* Share Button */}
        <TouchableOpacity
          style={[
            styles.shareButton,
            {backgroundColor: '#25D366', borderRadius: theme.borderRadius.lg},
          ]}
          onPress={shareOnWhatsApp}>
          <Icon name="logo-whatsapp" size={24} color="#FFFFFF" />
          <Text style={[theme.typography.body1, {color: '#FFFFFF', marginLeft: 12}]}>
            Share on WhatsApp
          </Text>
        </TouchableOpacity>

        {/* Current Targets Overview */}
        {stats && (
          <Card style={{marginTop: 16}}>
            <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 16}]}>
              Current Month Targets
            </Text>

            <View style={styles.targetRow}>
              <View style={{flex: 1}}>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  LEADS TARGET
                </Text>
                <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                  {stats.leadsAdded} / {stats.leadsTarget}
                </Text>
              </View>
              <View
                style={[
                  styles.targetBadge,
                  {backgroundColor: theme.colors.primaryLight, borderRadius: theme.borderRadius.md},
                ]}>
                <Text style={[theme.typography.body2, {color: theme.colors.primary}]}>
                  {Math.round((stats.leadsAdded / stats.leadsTarget) * 100)}%
                </Text>
              </View>
            </View>

            <View style={styles.targetRow}>
              <View style={{flex: 1}}>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  MEETINGS TARGET
                </Text>
                <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                  {stats.meetings} / {stats.meetingsTarget}
                </Text>
              </View>
              <View
                style={[
                  styles.targetBadge,
                  {backgroundColor: '#FFF3E0', borderRadius: theme.borderRadius.md},
                ]}>
                <Text style={[theme.typography.body2, {color: '#FF9800'}]}>
                  {Math.round((stats.meetings / stats.meetingsTarget) * 100)}%
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  selector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statsGrid: {
    marginTop: 16,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  targetBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
