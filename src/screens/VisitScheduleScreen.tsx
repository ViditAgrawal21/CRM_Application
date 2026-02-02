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
import {Card, LoadingSpinner, Button, EmptyState, Badge} from '../components';
import {visitService} from '../services/meetingService';
import {leadService} from '../services/leadService';
import {formatDate, formatTime} from '../utils/helpers';

export const VisitScheduleScreen: React.FC = () => {
  const {theme} = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [property, setProperty] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {data: visits, isLoading} = useQuery({
    queryKey: ['visits'],
    queryFn: () => visitService.getVisits(),
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
    mutationFn: visitService.completeVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['visits']});
      Alert.alert('Success', 'Visit marked as completed');
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

  const renderVisitCard = ({item}: any) => {
    const lead = leads?.find(l => l.id === item.leadId);
    const isPast = new Date(item.scheduledTime) < new Date();
    const isCompleted = item.status === 'completed';

    return (
      <Card style={{marginBottom: 12}}>
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
              {lead?.name || 'Unknown Lead'}
            </Text>
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
              {lead?.phone}
            </Text>
          </View>
          <Badge
            text={isCompleted ? 'COMPLETED' : isPast ? 'MISSED' : 'SCHEDULED'}
            variant={isCompleted ? 'success' : isPast ? 'backlog' : 'meeting'}
          />
        </View>

        <View style={styles.propertySection}>
          <View style={styles.propertyIcon}>
            <Icon name="home" size={24} color={theme.colors.primary} />
          </View>
          <View style={{flex: 1}}>
            <Text style={[theme.typography.caption, {color: theme.colors.primary}]}>
              PROPERTY VISIT
            </Text>
            <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
              {item.property}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={18} color={theme.colors.textSecondary} />
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            {formatDate(item.scheduledTime)} • {formatTime(item.scheduledTime)}
          </Text>
        </View>

        {item.notes && (
          <View style={styles.infoRow}>
            <Icon name="document-text-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
              {item.notes}
            </Text>
          </View>
        )}

        {!isCompleted && (
          <Button
            title="Mark as Completed"
            onPress={() => completeMutation.mutate(item.id)}
            variant="outline"
            size="small"
            style={{marginTop: 12}}
          />
        )}
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
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
  list: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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
    height: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
