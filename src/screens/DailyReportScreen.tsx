import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, Button, LoadingSpinner} from '../components';
import {reportService} from '../services/reportService';
import {SaveDailyReportData} from '../types';

export const DailyReportScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    visitsToday: '0',
    meetingsToday: '0',
    totalCalls: '0',
    nextDayPlan: '',
  });

  const dateString = selectedDate.toISOString().split('T')[0];

  const {data: report, isLoading, refetch} = useQuery({
    queryKey: ['dailyReport', dateString],
    queryFn: () => reportService.getDailyReport(dateString),
  });

  // Update form when report data loads
  useEffect(() => {
    if (report) {
      setFormData({
        visitsToday: String(report.visitsToday || report.visits || 0),
        meetingsToday: String(report.meetingsToday || report.meetings || 0),
        totalCalls: String(report.totalCalls || report.callsMade || 0),
        nextDayPlan: report.nextDayPlan || '',
      });
    }
  }, [report]);

  const saveMutation = useMutation({
    mutationFn: (data: SaveDailyReportData) => reportService.saveDailyReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['dailyReport', dateString]});
      Alert.alert('Success', 'Daily report saved successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to save report');
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      reportDate: dateString,
      visitsToday: parseInt(formData.visitsToday, 10) || 0,
      meetingsToday: parseInt(formData.meetingsToday, 10) || 0,
      totalCalls: parseInt(formData.totalCalls, 10) || 0,
      prospects: [],
      nextDayPlan: formData.nextDayPlan,
    });
  };

  const handleShare = async () => {
    if (!report) {
      Alert.alert('Error', 'Please save the report first');
      return;
    }

    const message = `
📊 Daily Report - ${formatDisplayDate(selectedDate)}

📅 Today's Activities:
• Meetings: ${formData.meetingsToday}
• Site Visits: ${formData.visitsToday}
• Total Calls: ${formData.totalCalls}

📈 Auto-tracked Stats:
• Follow-ups Done: ${report.followupsDone || 0}
• Leads Added: ${report.leadsAdded || 0}
• Deals Closed: ${report.dealsClosed || 0}

📝 Next Day Plan:
${formData.nextDayPlan || 'No plan added'}

Submitted by: ${user?.name}
    `.trim();

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleWhatsAppShare = () => {
    if (!report) {
      Alert.alert('Error', 'Please save the report first');
      return;
    }

    const message = `
📊 Daily Report - ${formatDisplayDate(selectedDate)}

📅 Today's Activities:
• Meetings: ${formData.meetingsToday}
• Site Visits: ${formData.visitsToday}
• Total Calls: ${formData.totalCalls}

📈 Auto-tracked Stats:
• Follow-ups Done: ${report.followupsDone || 0}
• Leads Added: ${report.leadsAdded || 0}
• Deals Closed: ${report.dealsClosed || 0}

📝 Next Day Plan:
${formData.nextDayPlan || 'No plan added'}

Submitted by: ${user?.name}
    `.trim();

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed');
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Selector */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Card>
            <View style={styles.dateRow}>
              <Icon name="calendar" size={24} color={theme.colors.primary} />
              <View style={{marginLeft: 12, flex: 1}}>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  Report Date
                </Text>
                <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color={theme.colors.textLight} />
            </View>
          </Card>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, {backgroundColor: '#E3F2FD'}]}>
            <Icon name="calendar-outline" size={28} color="#1976D2" />
            <Text style={[theme.typography.h3, {color: '#1976D2', marginTop: 8}]}>
              {formData.meetingsToday}
            </Text>
            <Text style={[theme.typography.caption, {color: '#1976D2'}]}>
              Meetings
            </Text>
          </Card>

          <Card style={[styles.statCard, {backgroundColor: '#F3E5F5'}]}>
            <Icon name="location-outline" size={28} color="#7B1FA2" />
            <Text style={[theme.typography.h3, {color: '#7B1FA2', marginTop: 8}]}>
              {formData.visitsToday}
            </Text>
            <Text style={[theme.typography.caption, {color: '#7B1FA2'}]}>
              Visits
            </Text>
          </Card>

          <Card style={[styles.statCard, {backgroundColor: '#E8F5E9'}]}>
            <Icon name="call-outline" size={28} color="#388E3C" />
            <Text style={[theme.typography.h3, {color: '#388E3C', marginTop: 8}]}>
              {formData.totalCalls}
            </Text>
            <Text style={[theme.typography.caption, {color: '#388E3C'}]}>
              Calls
            </Text>
          </Card>
        </View>

        {/* Input Fields */}
        <Card style={{marginTop: 16}}>
          <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 16}]}>
            Update Today's Stats
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Meetings
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                keyboardType="numeric"
                value={formData.meetingsToday}
                onChangeText={(text) => setFormData({...formData, meetingsToday: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Visits
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                keyboardType="numeric"
                value={formData.visitsToday}
                onChangeText={(text) => setFormData({...formData, visitsToday: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Calls
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                keyboardType="numeric"
                value={formData.totalCalls}
                onChangeText={(text) => setFormData({...formData, totalCalls: text})}
              />
            </View>
          </View>
        </Card>

        {/* Next Day Plan */}
        <Card style={{marginTop: 16}}>
          <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 12}]}>
            Next Day Plan
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="What's your plan for tomorrow?"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={5}
            value={formData.nextDayPlan}
            onChangeText={(text) => setFormData({...formData, nextDayPlan: text})}
          />
        </Card>

        {/* Summary from backend */}
        {report && (
          <Card style={{marginTop: 16}}>
            <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 12}]}>
              Auto-tracked Stats
            </Text>
            
            <View style={styles.summaryRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                Follow-ups Done
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                {report.followupsDone || 0}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                Leads Added
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                {report.leadsAdded || 0}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                Deals Closed
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.success}]}>
                {report.dealsClosed || 0}
              </Text>
            </View>
          </Card>
        )}

        {/* Save Button */}
        <Button
          title="Save Daily Report"
          onPress={handleSave}
          loading={saveMutation.isPending}
          size="large"
          style={{marginTop: 24}}
        />

        {/* Share Buttons */}
        {report && (
          <View style={styles.shareButtons}>
            <TouchableOpacity
              style={[styles.shareButton, {backgroundColor: theme.colors.primary}]}
              onPress={handleShare}>
              <Icon name="share-outline" size={20} color="#FFFFFF" />
              <Text style={[theme.typography.body1, {color: '#FFFFFF', marginLeft: 8}]}>
                Share Report
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, {backgroundColor: '#25D366'}]}
              onPress={handleWhatsAppShare}>
              <Icon name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={[theme.typography.body1, {color: '#FFFFFF', marginLeft: 8}]}>
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
  },
  textArea: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
});
