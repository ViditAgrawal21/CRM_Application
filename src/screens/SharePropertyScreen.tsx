import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import {useQuery, useMutation} from '@tanstack/react-query';
import {useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {LoadingSpinner, EmptyState, Card, Avatar} from '../components';
import {leadService} from '../services/leadService';
import {propertyService} from '../services/propertyService';
import {Lead, Property} from '../types';

export const SharePropertyScreen: React.FC = () => {
  const {theme} = useTheme();
  const route = useRoute<any>();
  const {property} = route.params as {property: Property};
  const [customNumber, setCustomNumber] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {data: leads, isLoading} = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadService.getLeads(),
  });

  const shareMutation = useMutation({
    mutationFn: (data: {leadId?: string; phoneNumber?: string}) =>
      propertyService.shareProperty(property.id, data),
    onSuccess: data => {
      Linking.openURL(data.whatsappLink).catch(() => {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to generate share link');
    },
  });

  const shareWithLead = (lead: Lead) => {
    Alert.alert(
      'Share Property',
      `Share "${property.title}" with ${lead.name} via WhatsApp?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Share',
          onPress: () => shareMutation.mutate({leadId: lead.id}),
        },
      ],
    );
  };

  const shareWithCustomNumber = () => {
    if (!customNumber || customNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    shareMutation.mutate({phoneNumber: customNumber});
    setCustomNumber('');
    setShowCustomInput(false);
  };

  const renderLead = ({item}: {item: Lead}) => (
    <TouchableOpacity
      style={[styles.leadCard, {backgroundColor: theme.colors.surface}]}
      onPress={() => shareWithLead(item)}
      disabled={shareMutation.isPending}>
      <View style={styles.leadInfo}>
        <Avatar name={item.name} size={48} />
        <View style={styles.leadDetails}>
          <Text style={[styles.leadName, {color: theme.colors.text}]}>{item.name}</Text>
          <Text style={[styles.leadPhone, {color: theme.colors.textSecondary}]}>
            {item.phone}
          </Text>
          {item.status && (
            <Text style={[styles.leadStatus, {color: theme.colors.textLight}]}>
              Status: {item.status}
            </Text>
          )}
        </View>
      </View>
      <Icon name="chevron-forward" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Property Preview */}
      <Card style={styles.propertyPreview}>
        <Text style={[styles.propertyTitle, {color: theme.colors.text}]}>
          {property.title}
        </Text>
        <View style={styles.propertyMeta}>
          <Icon name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.propertyLocation, {color: theme.colors.textSecondary}]}>
            {property.location}
          </Text>
        </View>
        <View style={styles.propertyMeta}>
          <Icon name="business-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.propertyType, {color: theme.colors.textSecondary}]}>
            {property.propertyType}
          </Text>
        </View>
      </Card>

      {/* Custom Number Input */}
      {!showCustomInput ? (
        <TouchableOpacity
          style={[styles.customNumberButton, {backgroundColor: '#25D366'}]}
          onPress={() => setShowCustomInput(true)}>
          <Icon name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.customNumberText}>Share with Custom Number</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.customInputContainer, {backgroundColor: theme.colors.surface}]}>
          <TextInput
            style={[styles.customInput, {color: theme.colors.text}]}
            placeholder="Enter phone number"
            placeholderTextColor={theme.colors.textLight}
            value={customNumber}
            onChangeText={setCustomNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <View style={styles.customInputButtons}>
            <TouchableOpacity
              style={[styles.customInputButton, {backgroundColor: theme.colors.textLight}]}
              onPress={() => {
                setShowCustomInput(false);
                setCustomNumber('');
              }}>
              <Text style={styles.customInputButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customInputButton, {backgroundColor: '#25D366'}]}
              onPress={shareWithCustomNumber}
              disabled={shareMutation.isPending}>
              <Text style={styles.customInputButtonText}>
                {shareMutation.isPending ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Or Select a Lead:
      </Text>

      <FlatList
        data={leads}
        renderItem={renderLead}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.leadsList}
        ListEmptyComponent={<EmptyState message="No leads found" icon="people-outline" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  propertyPreview: {
    margin: 16,
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  propertyLocation: {
    fontSize: 14,
  },
  propertyType: {
    fontSize: 14,
  },
  customNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  customNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  customInputContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  customInputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  customInputButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  customInputButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  leadsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  leadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  leadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  leadDetails: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 14,
  },
  leadStatus: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
