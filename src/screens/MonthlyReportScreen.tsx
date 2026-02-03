import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {Card, LoadingSpinner} from '../components';
import {reportService} from '../services/reportService';

export const MonthlyReportScreen: React.FC = () => {
  const {theme} = useTheme();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const {data: report, isLoading, refetch} = useQuery({
    queryKey: ['monthlyReport', selectedMonth],
    queryFn: () => reportService.getMonthlyReport(selectedMonth),
  });

  const navigateMonth = (direction: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', {month: 'long', year: 'numeric'});
  };

  const ProgressBar: React.FC<{
    percentage: number;
    color: string;
    bgColor: string;
  }> = ({percentage, color, bgColor}) => (
    <View style={[styles.progressBg, {backgroundColor: bgColor}]}>
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: `${Math.min(percentage, 100)}%`,
          },
        ]}
      />
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Month Selector */}
        <Card>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              onPress={() => navigateMonth(-1)}
              style={[styles.navButton, {backgroundColor: theme.colors.background}]}>
              <Icon name="chevron-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <View style={{alignItems: 'center'}}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Monthly Report
              </Text>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                {formatMonthDisplay(selectedMonth)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateMonth(1)}
              style={[styles.navButton, {backgroundColor: theme.colors.background}]}>
              <Icon name="chevron-forward" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* User Info */}
        {report?.userName && (
          <Card style={{marginTop: 16}}>
            <View style={styles.userRow}>
              <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
                <Text style={[theme.typography.h4, {color: '#FFF'}]}>
                  {report.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{marginLeft: 12}}>
                <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                  {report.userName}
                </Text>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  {report.userRole?.toUpperCase() || 'EMPLOYEE'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Meetings Performance */}
        <Card style={[styles.perfCard, {backgroundColor: '#E3F2FD', marginTop: 16}]}>
          <View style={styles.perfHeader}>
            <Icon name="calendar" size={24} color="#1976D2" />
            <Text style={[theme.typography.h4, {color: '#1976D2', marginLeft: 8}]}>
              Meetings
            </Text>
          </View>

          <View style={styles.perfStats}>
            <Text style={[theme.typography.h2, {color: '#1976D2'}]}>
              {report?.achieved?.meetings || report?.totalMeetings || 0}
            </Text>
            <Text style={[theme.typography.body2, {color: '#1976D2'}]}>
              / {report?.targets?.meetings || 25} target
            </Text>
          </View>

          <ProgressBar
            percentage={report?.performance?.meetingPercentage || 0}
            color="#1976D2"
            bgColor="#90CAF9"
          />

          <Text style={[theme.typography.caption, {color: '#1976D2', marginTop: 8}]}>
            {report?.performance?.meetingPercentage || 0}% achieved
          </Text>
        </Card>

        {/* Visits Performance */}
        <Card style={[styles.perfCard, {backgroundColor: '#F3E5F5', marginTop: 12}]}>
          <View style={styles.perfHeader}>
            <Icon name="location" size={24} color="#7B1FA2" />
            <Text style={[theme.typography.h4, {color: '#7B1FA2', marginLeft: 8}]}>
              Visits
            </Text>
          </View>

          <View style={styles.perfStats}>
            <Text style={[theme.typography.h2, {color: '#7B1FA2'}]}>
              {report?.achieved?.visits || report?.totalVisits || 0}
            </Text>
            <Text style={[theme.typography.body2, {color: '#7B1FA2'}]}>
              / {report?.targets?.visits || 15} target
            </Text>
          </View>

          <ProgressBar
            percentage={report?.performance?.visitPercentage || 0}
            color="#7B1FA2"
            bgColor="#CE93D8"
          />

          <Text style={[theme.typography.caption, {color: '#7B1FA2', marginTop: 8}]}>
            {report?.performance?.visitPercentage || 0}% achieved
          </Text>
        </Card>

        {/* Revenue Performance */}
        {report?.targets?.revenue && (
          <Card style={[styles.perfCard, {backgroundColor: '#FFF3E0', marginTop: 12}]}>
            <View style={styles.perfHeader}>
              <Icon name="cash" size={24} color="#E65100" />
              <Text style={[theme.typography.h4, {color: '#E65100', marginLeft: 8}]}>
                Revenue
              </Text>
            </View>

            <View style={styles.perfStats}>
              <Text style={[theme.typography.h2, {color: '#E65100'}]}>
                ₹{(report?.achieved?.revenue || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={[theme.typography.body2, {color: '#E65100'}]}>
                / ₹{report.targets.revenue.toLocaleString('en-IN')}
              </Text>
            </View>

            <ProgressBar
              percentage={report?.performance?.revenuePercentage || 0}
              color="#E65100"
              bgColor="#FFE0B2"
            />

            <Text style={[theme.typography.caption, {color: '#E65100', marginTop: 8}]}>
              {report?.performance?.revenuePercentage || 0}% achieved
            </Text>
          </Card>
        )}

        {/* Bonus Card */}
        <Card style={[styles.bonusCard, {backgroundColor: '#E8F5E9', marginTop: 16}]}>
          <View style={styles.bonusContent}>
            <Icon name="trophy" size={40} color="#388E3C" />
            <View style={{marginLeft: 16, flex: 1}}>
              <Text style={[theme.typography.caption, {color: '#388E3C'}]}>
                BONUS EARNED
              </Text>
              <Text style={[theme.typography.h1, {color: '#388E3C'}]}>
                ₹{(report?.bonusEarned || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={[theme.typography.caption, {color: '#66BB6A'}]}>
                Max: ₹{(report?.targets?.bonus || 10000).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Other Stats */}
        <Card style={{marginTop: 16}}>
          <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 16}]}>
            Other Statistics
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="call" size={24} color={theme.colors.primary} />
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginTop: 8}]}>
                {report?.totalCalls || 0}
              </Text>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Total Calls
              </Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="checkmark-done" size={24} color={theme.colors.success} />
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginTop: 8}]}>
                {report?.totalFollowups || 0}
              </Text>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Follow-ups
              </Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="person-add" size={24} color={theme.colors.info || '#2196F3'} />
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginTop: 8}]}>
                {report?.leadsAdded || 0}
              </Text>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Leads Added
              </Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="checkmark-circle" size={24} color={theme.colors.success} />
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginTop: 8}]}>
                {report?.dealsClosed || 0}
              </Text>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Deals Closed
              </Text>
            </View>
          </View>

          {/* Conversion Rate */}
          <View style={[styles.conversionRow, {borderTopColor: theme.colors.border}]}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Conversion Rate
            </Text>
            <Text style={[theme.typography.h4, {color: theme.colors.success}]}>
              {(report?.conversionRate || 0).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.conversionRow}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Target Achievement
            </Text>
            <Text style={[theme.typography.h4, {color: theme.colors.primary}]}>
              {(report?.targetAchievement || 0).toFixed(1)}%
            </Text>
          </View>
        </Card>
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
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfCard: {
    padding: 16,
    borderRadius: 12,
  },
  perfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perfStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    marginBottom: 12,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bonusCard: {
    padding: 20,
    borderRadius: 12,
  },
  bonusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
});
