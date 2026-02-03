import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../hooks/useTheme';
import {Button} from '../components';
import {leadService} from '../services/leadService';
import {LeadType} from '../types';

export const AddLeadScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();

  // Get type from navigation params (default to 'lead')
  const initialType: LeadType = route.params?.type || 'lead';

  const [formData, setFormData] = useState({
    type: initialType,
    name: '',
    phone: '',
    configuration: '',
    location: '',
    remark: '',
  });

  const createMutation = useMutation({
    mutationFn: () =>
      leadService.createLead({
        ...formData,
        date: new Date().toISOString().split('T')[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['leads']});
      Alert.alert('Success', `${formData.type === 'lead' ? 'Lead' : 'Data'} created successfully`);
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create lead');
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }
    createMutation.mutate();
  };

  // Update navigation title based on type
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: formData.type === 'lead' ? 'Add New Lead' : 'Add New Data',
    });
  }, [navigation, formData.type]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="Customer name"
              placeholderTextColor={theme.colors.textLight}
              value={formData.name}
              onChangeText={text => setFormData({...formData, name: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Phone *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="Phone number"
              placeholderTextColor={theme.colors.textLight}
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={text => setFormData({...formData, phone: text})}
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Configuration
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="e.g. 2BHK"
              placeholderTextColor={theme.colors.textLight}
              value={formData.configuration}
              onChangeText={text => setFormData({...formData, configuration: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Location
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="Location"
              placeholderTextColor={theme.colors.textLight}
              value={formData.location}
              onChangeText={text => setFormData({...formData, location: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
              Remark
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
              placeholder="Notes..."
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={4}
              value={formData.remark}
              onChangeText={text => setFormData({...formData, remark: text})}
            />
          </View>

          <Button
            title={formData.type === 'lead' ? 'Create Lead' : 'Create Data'}
            onPress={handleSubmit}
            loading={createMutation.isPending}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    height: 100,
    textAlignVertical: 'top',
  },
});
