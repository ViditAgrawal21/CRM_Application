import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useRoute} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';
import {Card, LoadingSpinner, Button, Avatar, Badge} from '../components';
import {leadService} from '../services/leadService';
import {noteService, logService} from '../services/noteService';
import {templateService} from '../services/templateService';
import {formatDate, openWhatsApp} from '../utils/helpers';

export const LeadDetailsScreen: React.FC = () => {
  const {theme} = useTheme();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const {leadId} = route.params;

  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [remarkText, setRemarkText] = useState('');

  const {data: lead, isLoading} = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const leads = await leadService.getLeads();
      return leads.find(l => l.id === leadId);
    },
  });

  const {data: notes} = useQuery({
    queryKey: ['notes', leadId],
    queryFn: () => noteService.getNotes(leadId),
  });

  const {data: logs} = useQuery({
    queryKey: ['logs', leadId],
    queryFn: () => logService.getLogs(leadId),
  });

  const {data: templates} = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateService.getTemplates(),
  });

  const addNoteMutation = useMutation({
    mutationFn: (text: string) => noteService.createNote({leadId, text}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notes', leadId]});
      setRemarkModalVisible(false);
      setRemarkText('');
      Alert.alert('Success', 'Note added successfully');
    },
  });

  const handleSendTemplate = (template: any) => {
    if (lead?.phone) {
      openWhatsApp(lead.phone, template.message);
      logService.createLog({
        leadId,
        action: 'template',
        notes: `Sent template: ${template.title}`,
      });
      setTemplateModalVisible(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!lead) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Text style={[theme.typography.body1, {color: theme.colors.text, textAlign: 'center'}]}>
          Lead not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <Card>
          <View style={styles.headerContent}>
            <Avatar name={lead.name} size={80} />
            <View style={styles.nameSection}>
              <Text style={[theme.typography.h2, {color: theme.colors.text}]}>
                {lead.name}
              </Text>
              <Badge text="Hot Lead" variant="followUp" />
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                Score: 98/100
              </Text>
            </View>
          </View>
        </Card>

        {/* Metadata Card */}
        <Card style={{marginTop: 16}}>
          <View style={styles.metadataHeader}>
            <Icon name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
              Metadata Information
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Icon name="calendar" size={20} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, flex: 1}]}>
              Upload Date
            </Text>
            <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
              {formatDate(lead.created_at)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Icon name="receipt" size={20} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, flex: 1}]}>
              Source
            </Text>
            <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
              {lead.type === 'lead' ? 'Direct Lead' : 'Data'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Icon name="time" size={20} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary, flex: 1}]}>
              Last Contact
            </Text>
            <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
              {formatDate(lead.updated_at)}
            </Text>
          </View>
        </Card>

        {/* Property Inquiry Card */}
        {lead.configuration && (
          <Card style={{marginTop: 16}}>
            <View style={styles.propertyHeader}>
              <View style={styles.propertyImage}>
                <Icon name="home" size={32} color={theme.colors.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={[theme.typography.caption, {color: theme.colors.primary}]}>
                  INQUIRY PROPERTY
                </Text>
                <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                  {lead.configuration} - {lead.location}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.colors.textLight} />
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: '#9C27B0', borderRadius: theme.borderRadius.lg},
            ]}
            onPress={() => setTemplateModalVisible(true)}>
            <Icon name="document-text" size={24} color="#FFFFFF" />
            <Text style={[theme.typography.body2, {color: '#FFFFFF', marginTop: 8}]}>
              TEMPLATE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg},
            ]}>
            <Icon name="create" size={24} color="#FFFFFF" />
            <Text style={[theme.typography.body2, {color: '#FFFFFF', marginTop: 8}]}>
              EDIT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {backgroundColor: '#607D8B', borderRadius: theme.borderRadius.lg},
            ]}
            onPress={() => setLogModalVisible(true)}>
            <Icon name="time" size={24} color="#FFFFFF" />
            <Text style={[theme.typography.body2, {color: '#FFFFFF', marginTop: 8}]}>
              HISTORY
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone Number Card */}
        <Card style={{marginTop: 16}}>
          <View style={styles.phoneCard}>
            <View style={styles.phoneIcon}>
              <Icon name="call" size={24} color={theme.colors.success} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                Phone Number
              </Text>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                {lead.phone}
              </Text>
            </View>
            <TouchableOpacity style={styles.copyButton}>
              <Icon name="copy-outline" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
              Notes ({notes?.length || 0})
            </Text>
            <TouchableOpacity onPress={() => setRemarkModalVisible(true)}>
              <Icon name="add-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {notes?.slice(0, 3).map((note, index) => (
            <Card key={index} style={{marginTop: 8}}>
              <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
                {note.text}
              </Text>
              <Text
                style={[
                  theme.typography.caption,
                  {color: theme.colors.textSecondary, marginTop: 8},
                ]}>
                {formatDate(note.created_at)} by {note.user?.name}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Remark Modal */}
      <Modal
        visible={remarkModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRemarkModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                Add Remark
              </Text>
              <TouchableOpacity onPress={() => setRemarkModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

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
              placeholder="Enter your remark..."
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={6}
              value={remarkText}
              onChangeText={setRemarkText}
            />

            <Button
              title="Save Remark"
              onPress={() => addNoteMutation.mutate(remarkText)}
              loading={addNoteMutation.isPending}
              size="large"
              style={{marginTop: 16}}
            />
          </View>
        </View>
      </Modal>

      {/* Template Modal */}
      <Modal
        visible={templateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTemplateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                Select Template
              </Text>
              <TouchableOpacity onPress={() => setTemplateModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={templates}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.templateItem,
                    {borderColor: theme.colors.border, borderRadius: theme.borderRadius.md},
                  ]}
                  onPress={() => handleSendTemplate(item)}>
                  <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      theme.typography.caption,
                      {color: theme.colors.textSecondary, marginTop: 4},
                    ]}
                    numberOfLines={2}>
                    {item.message}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Log Modal */}
      <Modal
        visible={logModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLogModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                Activity Log
              </Text>
              <TouchableOpacity onPress={() => setLogModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={logs}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.logItem}>
                  <View style={styles.logDot} />
                  <View style={{flex: 1}}>
                    <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
                      {item.action.toUpperCase()}
                    </Text>
                    {item.notes && (
                      <Text
                        style={[
                          theme.typography.caption,
                          {color: theme.colors.textSecondary, marginTop: 4},
                        ]}>
                        {item.notes}
                      </Text>
                    )}
                    <Text
                      style={[
                        theme.typography.caption,
                        {color: theme.colors.textLight, marginTop: 4},
                      ]}>
                      {formatDate(item.created_at)} • {item.user?.name}
                    </Text>
                  </View>
                </View>
              )}
            />
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
  },
  headerContent: {
    alignItems: 'center',
    gap: 16,
  },
  nameSection: {
    alignItems: 'center',
    gap: 8,
  },
  metadataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  propertyImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButton: {
    padding: 8,
  },
  notesSection: {
    marginTop: 24,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  textArea: {
    height: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  templateItem: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  logItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
    marginTop: 6,
  },
});
