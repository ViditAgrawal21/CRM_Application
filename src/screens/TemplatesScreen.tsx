import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, LoadingSpinner, EmptyState, Button} from '../components';
import {templateService} from '../services/templateService';
import {Template} from '../types';

export const TemplatesScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({title: '', message: ''});

  const {data: templates, isLoading, refetch} = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateService.getTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {title: string; message: string}) =>
      templateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['templates']});
      setModalVisible(false);
      setFormData({title: '', message: ''});
      Alert.alert('Success', 'Template created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({id, data}: {id: string; data: Partial<{title: string; message: string}>}) =>
      templateService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['templates']});
      setModalVisible(false);
      setEditingTemplate(null);
      setFormData({title: '', message: ''});
      Alert.alert('Success', 'Template updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['templates']});
      Alert.alert('Success', 'Template deleted successfully');
    },
  });

  const handleSave = () => {
    if (!formData.title || !formData.message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({id: editingTemplate.id, data: formData});
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({title: template.title, message: template.message});
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Template', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id)},
    ]);
  };

  const renderTemplate = ({item}: {item: Template}) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[theme.typography.h4, {color: theme.colors.text, flex: 1}]}>
          {item.title}
        </Text>
        {isAdmin && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Icon name="create-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Icon name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text
        style={[
          theme.typography.body2,
          {color: theme.colors.textSecondary, marginTop: 8},
        ]}>
        {item.message}
      </Text>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="No templates found" />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={[
            styles.fab,
            {backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full},
            theme.shadows.lg,
          ]}
          onPress={() => {
            setEditingTemplate(null);
            setFormData({title: '', message: ''});
            setModalVisible(true);
          }}>
          <Icon name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                  Title
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
                  placeholder="Template title"
                  placeholderTextColor={theme.colors.textLight}
                  value={formData.title}
                  onChangeText={text => setFormData({...formData, title: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                  Message
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                  placeholder="Template message..."
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={6}
                  value={formData.message}
                  onChangeText={text => setFormData({...formData, message: text})}
                />
              </View>

              <Button
                title={editingTemplate ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={createMutation.isPending || updateMutation.isPending}
                size="large"
              />
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
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
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
