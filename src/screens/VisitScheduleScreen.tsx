import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, LoadingSpinner, Button, EmptyState, Badge} from '../components';
import {visitService} from '../services/meetingService';
import {leadService} from '../services/leadService';
import {formatDate, formatTime, extractTimeFromRemark, isOwnerRole, getRemarkFormatSuggestions} from '../utils/helpers';
import {useNavigation} from '@react-navigation/native';
import {Visit} from '../types';

export const VisitScheduleScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [rescheduleText, setRescheduleText] = useState('');
  const [leadId, setLeadId] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [property, setProperty] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [filterTab, setFilterTab] = useState<'my' | 'team'>('my');

  const isOwner = isOwnerRole(user?.role || '');

  const {data: visits, isLoading} = useQuery({
    queryKey: ['visits', user?.role, filterTab],
    queryFn: () => visitService.getVisits({
      userRole: user?.role,
      showAll: isOwner && filterTab === 'team',
    }),
  });

  const {data: leads} = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadService.getLeads(),
  });

  const createMutation = useMutation({
    mutationFn: visitService.createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['visits']});
      resetForm();
      Alert.alert('Success', 'Visit scheduled successfully');
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({visitId, rescheduleRemark}: {visitId: string; rescheduleRemark?: string}) => {
      await visitService.completeVisit(visitId);
      // If reschedule remark provided, update lead remark for auto-sync
      if (rescheduleRemark && selectedVisit?.lead_id) {
        await leadService.updateLeadRemark(selectedVisit.lead_id, rescheduleRemark);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['visits']});
      queryClient.invalidateQueries({queryKey: ['leads']});
      setRescheduleModalVisible(false);
      setSelectedVisit(null);
      setRescheduleText('');
      Alert.alert('Success', 'Visit marked as completed');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({visitId, leadId, rescheduleRemark}: {visitId: string; leadId: string; rescheduleRemark: string}) => {
      // Update lead remark to trigger backend auto-sync
      await leadService.updateLeadRemark(leadId, rescheduleRemark);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['visits']});
      queryClient.invalidateQueries({queryKey: ['leads']});
      setRescheduleModalVisible(false);
      setSelectedVisit(null);
      setRescheduleText('');
      Alert.alert('Success', 'Visit rescheduled. Backend will sync automatically.');
    },
  });

  const resetForm = () => {
    setModalVisible(false);
    setLeadId('');
    setScheduledTime(new Date());
    setProperty('');
    setNotes('');
  };

  const handleCreate = () => {
    if (!leadId || !property) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    createMutation.mutate({leadId, scheduledTime, property, notes});
  };

  const handleMarkDone = (visit: Visit) => {
    setSelectedVisit(visit);
    setRescheduleModalVisible(true);
  };

  const handleReschedule = (visit: Visit) => {
    setSelectedVisit(visit);
    setRescheduleText('');
    setRescheduleModalVisible(true);
  };

  const handleConfirmDone = () => {
    if (!selectedVisit) return;
    completeMutation.mutate({
      visitId: selectedVisit.id,
      rescheduleRemark: rescheduleText || undefined,
    });
  };

  const handleConfirmReschedule = () => {
    if (!selectedVisit || !rescheduleText) {
      Alert.alert('Error', 'Please enter reschedule time');
      return;
    }
    rescheduleMutation.mutate({
      visitId: selectedVisit.id,
      leadId: selectedVisit.lead_id,
      rescheduleRemark: `Visit ${rescheduleText}`,
    });
  };

  const getStatusColor = (status: string, isPast: boolean) => {
    if (status === 'completed') return theme.colors.success;
    if (isPast) return '#F44336'; // Red for missed
    return '#2196F3'; // Blue for scheduled
  };

  const renderVisitCard = ({item}: {item: Visit}) => {
    const lead = item.lead || leads?.find(l => l.id === item.lead_id);
    const isPast = new Date(item.scheduled_at) < new Date();
    const isCompleted = item.status === 'completed';
    const extractedTime = extractTimeFromRemark(item.remark || '');

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('VisitDetail', {visitId: item.id})}
        activeOpacity={0.7}>
        <Card style={[styles.card, {borderLeftWidth: 4, borderLeftColor: getStatusColor(item.status, isPast)}]}>
          <View style={styles.cardHeader}>
            <View style={{flex: 1}}>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                {lead?.name || 'Unknown Lead'}
              </Text>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                {lead?.phone}
              </Text>
              {/* Show user info for owner/team view */}
              {isOwner && filterTab === 'team' && item.user && (
                <View style={styles.userInfo}>
                  <Icon name="person-outline" size={14} color={theme.colors.primary} />
                  <Text style={[theme.typography.caption, {color: theme.colors.primary, marginLeft: 4}]}>
                    {item.user.name} • {item.user.phone}
                  </Text>
                </View>
              )}
            </View>
            <Badge
              text={isCompleted ? 'COMPLETED' : isPast ? 'MISSED' : 'SCHEDULED'}
              variant={isCompleted ? 'success' : isPast ? 'backlog' : 'meeting'}
            />
          </View>

          <View style={styles.propertySection}>
            <View style={[styles.propertyIcon, {backgroundColor: theme.colors.background}]}>
              <Icon name="home" size={24} color={theme.colors.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[theme.typography.caption, {color: theme.colors.primary}]}>
                PROPERTY VISIT
              </Text>
              <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
                {item.site_location}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="time-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body2, {color: theme.colors.text, marginLeft: 8}]}>
              {formatDate(item.scheduled_at)} • {formatTime(item.scheduled_at)}
            </Text>
          </View>

          {item.notes && (
            <View style={styles.infoRow}>
              <Icon name="document-text-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={[theme.typography.body2, {color: theme.colors.text, marginLeft: 8}]}>
                {item.notes}
              </Text>
            </View>
          )}

          {/* Show remark if exists */}
          {item.remark && (
            <View style={[styles.remarkSection, {backgroundColor: theme.colors.primaryLight || '#E3F2FD'}]}>
              <Icon name="chatbubble-outline" size={16} color={theme.colors.primary} />
              <Text style={[theme.typography.body2, {color: theme.colors.primary, marginLeft: 8, flex: 1}]}>
                {item.remark}
              </Text>
              {extractedTime && (
                <View style={styles.extractedTime}>
                  <Icon name="calendar" size={14} color={theme.colors.success} />
                  <Text style={[theme.typography.caption, {color: theme.colors.success, marginLeft: 4}]}>
                    {extractedTime}
                  </Text>
                </View>
              )}
            </View>
          )}

          {!isCompleted && (
            <View style={styles.actionButtons}>
              <Button
                title="Mark Done"
                onPress={() => handleMarkDone(item)}
                variant="primary"
                size="small"
                style={{flex: 1, marginRight: 8}}
              />
              <Button
                title="Reschedule"
                onPress={() => handleReschedule(item)}
                variant="outline"
                size="small"
                style={{flex: 1}}
              />
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Filter Tabs for Owner */}
      {isOwner && (
        <View style={[styles.filterTabs, {backgroundColor: theme.colors.surface}]}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterTab === 'my' && {backgroundColor: theme.colors.primary},
            ]}
            onPress={() => setFilterTab('my')}>
            <Text style={[
              theme.typography.body2,
              {color: filterTab === 'my' ? '#FFFFFF' : theme.colors.text},
            ]}>
              My Visits
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterTab === 'team' && {backgroundColor: theme.colors.primary},
            ]}
            onPress={() => setFilterTab('team')}>
            <Text style={[
              theme.typography.body2,
              {color: filterTab === 'team' ? '#FFFFFF' : theme.colors.text},
            ]}>
              Team Visits
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={visits}
        keyExtractor={item => item.id}
        renderItem={renderVisitCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No visits scheduled" icon="home-outline" />}
      />

      <TouchableOpacity
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Visit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetForm}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                  Schedule Property Visit
                </Text>
                <TouchableOpacity onPress={resetForm}>
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[theme.typography.body2, {color: theme.colors.text, marginBottom: 8}]}>
                Select Lead
              </Text>
              <View
                style={[
                  styles.picker,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}>
                {leads?.slice(0, 5).map(lead => (
                  <TouchableOpacity
                    key={lead.id}
                    style={[
                      styles.leadOption,
                      leadId === lead.id && {backgroundColor: theme.colors.primaryLight},
                    ]}
                    onPress={() => setLeadId(lead.id)}>
                    <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
                      {lead.name} - {lead.phone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={[
                  theme.typography.body2,
                  {color: theme.colors.text, marginTop: 16, marginBottom: 8},
                ]}>
                Date & Time
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}>
                <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
                  {formatDate(scheduledTime)} • {formatTime(scheduledTime)}
                </Text>
                <Icon name="calendar" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <Text
                style={[
                  theme.typography.body2,
                  {color: theme.colors.text, marginTop: 16, marginBottom: 8},
                ]}>
                Property Address *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
                placeholder="Enter property address"
                placeholderTextColor={theme.colors.textLight}
                value={property}
                onChangeText={setProperty}
              />

              <Text
                style={[
                  theme.typography.body2,
                  {color: theme.colors.text, marginTop: 16, marginBottom: 8},
                ]}>
                Notes (Optional)
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
                placeholder="Add any additional notes"
                placeholderTextColor={theme.colors.textLight}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />

              <Button
                title="Schedule Visit"
                onPress={handleCreate}
                loading={createMutation.isPending}
                size="large"
                style={{marginTop: 24}}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Mark Done / Reschedule Modal */}
      <Modal
        visible={rescheduleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setRescheduleModalVisible(false);
          setSelectedVisit(null);
          setRescheduleText('');
        }}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                {selectedVisit?.status === 'completed' ? 'Reschedule Visit' : 'Mark as Done'}
              </Text>
              <TouchableOpacity onPress={() => {
                setRescheduleModalVisible(false);
                setSelectedVisit(null);
                setRescheduleText('');
              }}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, marginBottom: 16}]}>
              When should this visit happen? (Optional for done, required for reschedule)
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
                  title="Reschedule"
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

      {showDatePicker && (
        <DateTimePicker
          value={scheduledTime}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setScheduledTime(date);
              setShowTimePicker(true);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={scheduledTime}
          mode="time"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) setScheduledTime(date);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  propertySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  propertyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  remarkSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  extractedTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  picker: {
    borderWidth: 1,
    maxHeight: 200,
  },
  leadOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    fontSize: 16,
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
