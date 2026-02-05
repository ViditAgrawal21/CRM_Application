import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';
import {Card, LoadingSpinner, Button, Badge, Avatar} from '../components';
import {visitService} from '../services/meetingService';
import {leadService} from '../services/leadService';
import {formatDate, formatTime, extractTimeFromRemark, getRemarkFormatSuggestions, openPhoneDialer, openWhatsApp} from '../utils/helpers';

export const VisitDetailScreen: React.FC = () => {
  const {theme} = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const {visitId} = route.params;

  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleText, setRescheduleText] = useState('');

  const {data: visit, isLoading} = useQuery({
    queryKey: ['visit', visitId],
    queryFn: () => visitService.getVisit(visitId),
  });

  const {data: leads} = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadService.getLeads(),
  });

  const lead = visit?.lead || leads?.find(l => l.id === visit?.leadId);

  const completeMutation = useMutation({
    mutationFn: async ({rescheduleRemark}: {rescheduleRemark?: string}) => {
      await visitService.completeVisit(visitId);
      // If reschedule remark provided, update lead remark for auto-sync
      if (rescheduleRemark && visit?.leadId) {
        await leadService.updateLeadRemark(visit.leadId, `Visit ${rescheduleRemark}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['visits']});
      queryClient.invalidateQueries({queryKey: ['visit', visitId]});
      queryClient.invalidateQueries({queryKey: ['leads']});
      setRescheduleModalVisible(false);
      setRescheduleText('');
      Alert.alert('Success', 'Visit marked as completed', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (rescheduleRemark: string) => {
      if (!visit?.leadId) throw new Error('No lead ID');
      // Update lead remark to trigger backend auto-sync
      await leadService.updateLeadRemark(visit.leadId, `Visit ${rescheduleRemark}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['visits']});
      queryClient.invalidateQueries({queryKey: ['visit', visitId]});
      queryClient.invalidateQueries({queryKey: ['leads']});
      setRescheduleModalVisible(false);
      setRescheduleText('');
      Alert.alert('Success', 'Visit rescheduled. Backend will sync automatically.');
    },
  });

  const handleMarkDone = () => {
    setRescheduleModalVisible(true);
  };

  const handleConfirmDone = () => {
    completeMutation.mutate({
      rescheduleRemark: rescheduleText || undefined,
    });
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleText) {
      Alert.alert('Error', 'Please enter reschedule time');
      return;
    }
    rescheduleMutation.mutate(rescheduleText);
  };

  const getStatusColor = (status: string, isPast: boolean) => {
    if (status === 'completed') return theme.colors.success;
    if (isPast) return '#F44336';
    return '#2196F3';
  };

  if (isLoading || !visit) {
    return <LoadingSpinner />;
  }

  const isPast = new Date(visit.scheduledAt) < new Date();
  const isCompleted = visit.status === 'completed';
  const extractedTime = extractTimeFromRemark(visit.remark || '');

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Lead Info Card */}
        <Card>
          <View style={styles.leadHeader}>
            <Avatar name={lead?.name || 'Unknown'} size={60} />
            <View style={styles.leadInfo}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                {lead?.name || 'Unknown Lead'}
              </Text>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                {lead?.phone}
              </Text>
              <Badge
                text={isCompleted ? 'COMPLETED' : isPast ? 'MISSED' : 'SCHEDULED'}
                variant={isCompleted ? 'success' : isPast ? 'backlog' : 'meeting'}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, {backgroundColor: '#4CAF50'}]}
              onPress={() => lead?.phone && openPhoneDialer(lead.phone)}>
              <Icon name="call" size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, {backgroundColor: '#25D366'}]}
              onPress={() => lead?.phone && openWhatsApp(lead.phone)}>
              <Icon name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, {backgroundColor: theme.colors.primary}]}
              onPress={() => navigation.navigate('LeadDetails', {leadId: lead?.id})}>
              <Icon name="person" size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>View Lead</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Property Details Card */}
        <Card style={{marginTop: 16}}>
          <View style={styles.propertyHeader}>
            <View style={[styles.propertyIcon, {backgroundColor: theme.colors.primaryLight || '#E3F2FD'}]}>
              <Icon name="home" size={32} color={theme.colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[theme.typography.caption, {color: theme.colors.primary}]}>
                PROPERTY VISIT
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                {visit.siteLocation}
              </Text>
            </View>
          </View>
        </Card>

        {/* Visit Details Card */}
        <Card style={{marginTop: 16}}>
          <View style={styles.sectionHeader}>
            <Icon name="navigate" size={24} color={theme.colors.primary} />
            <Text style={[theme.typography.h4, {color: theme.colors.text, marginLeft: 12}]}>
              Visit Details
            </Text>
          </View>

          <View style={[styles.statusBar, {backgroundColor: getStatusColor(visit.status, isPast) + '20'}]}>
            <View style={[styles.statusDot, {backgroundColor: getStatusColor(visit.status, isPast)}]} />
            <Text style={[theme.typography.body2, {color: getStatusColor(visit.status, isPast)}]}>
              {isCompleted ? 'Completed' : isPast ? 'Missed' : 'Scheduled'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Date & Time
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                {formatDate(visit.scheduledAt)} at {formatTime(visit.scheduledAt)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-outline" size={20} color={theme.colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Site Location
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                {visit.siteLocation}
              </Text>
            </View>
          </View>

          {visit.notes && (
            <View style={styles.detailRow}>
              <Icon name="document-text-outline" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  Notes
                </Text>
                <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                  {visit.notes}
                </Text>
              </View>
            </View>
          )}

          {visit.outcome && (
            <View style={styles.detailRow}>
              <Icon name="checkmark-circle-outline" size={20} color={theme.colors.success} />
              <View style={styles.detailContent}>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  Outcome
                </Text>
                <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                  {visit.outcome}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Remark Card */}
        {visit.remark && (
          <Card style={{marginTop: 16}}>
            <View style={styles.sectionHeader}>
              <Icon name="chatbubble" size={24} color={theme.colors.primary} />
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginLeft: 12}]}>
                Remark
              </Text>
            </View>

            <Text style={[theme.typography.body1, {color: theme.colors.text, marginTop: 12}]}>
              {visit.remark}
            </Text>

            {extractedTime && (
              <View style={[styles.extractedTimeCard, {backgroundColor: theme.colors.success + '20'}]}>
                <Icon name="calendar" size={18} color={theme.colors.success} />
                <Text style={[theme.typography.body2, {color: theme.colors.success, marginLeft: 8}]}>
                  📅 Next Scheduled: {extractedTime}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* User Info Card (for team view) */}
        {visit.user && (
          <Card style={{marginTop: 16}}>
            <View style={styles.sectionHeader}>
              <Icon name="person" size={24} color={theme.colors.primary} />
              <Text style={[theme.typography.h4, {color: theme.colors.text, marginLeft: 12}]}>
                Assigned To
              </Text>
            </View>

            <View style={styles.userCard}>
              <Avatar name={visit.user.name} size={48} />
              <View style={styles.userDetails}>
                <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                  {visit.user.name}
                </Text>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  {visit.user.phone}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <View style={styles.actionButtons}>
            <Button
              title="Mark as Done"
              onPress={handleMarkDone}
              variant="primary"
              size="large"
              style={{flex: 1, marginRight: 8}}
            />
            <Button
              title="Reschedule"
              onPress={() => {
                setRescheduleText('');
                setRescheduleModalVisible(true);
              }}
              variant="outline"
              size="large"
              style={{flex: 1}}
            />
          </View>
        )}
      </ScrollView>

      {/* Mark Done / Reschedule Modal */}
      <Modal
        visible={rescheduleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRescheduleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                Mark as Done
              </Text>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, marginBottom: 16}]}>
              When should this visit happen? (Leave empty if not needed)
            </Text>

            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="e.g., 5th Feb at 2 PM"
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={2}
              value={rescheduleText}
              onChangeText={setRescheduleText}
            />

            {/* Format suggestions */}
            <View style={styles.suggestionSection}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, marginBottom: 8}]}>
                Suggested formats:
              </Text>
              <View style={styles.suggestions}>
                {getRemarkFormatSuggestions().slice(2, 4).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionChip, {backgroundColor: theme.colors.background}]}
                    onPress={() => setRescheduleText(suggestion.replace('Meeting ', '').replace('Visit ', ''))}>
                    <Text style={[theme.typography.caption, {color: theme.colors.primary}]}>
                      {suggestion.replace('Meeting ', '').replace('Visit ', '')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Mark as Done"
                onPress={handleConfirmDone}
                loading={completeMutation.isPending}
                variant="primary"
                size="large"
                style={{flex: 1, marginRight: 8}}
              />
              {rescheduleText && (
                <Button
                  title="Reschedule Only"
                  onPress={handleConfirmReschedule}
                  loading={rescheduleMutation.isPending}
                  variant="outline"
                  size="large"
                  style={{flex: 1}}
                />
              )}
            </View>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  leadInfo: {
    flex: 1,
    gap: 4,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  propertyIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  extractedTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  userDetails: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
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
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  suggestionSection: {
    marginTop: 16,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
