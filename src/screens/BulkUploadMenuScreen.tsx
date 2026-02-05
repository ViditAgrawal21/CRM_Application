import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';

export const BulkUploadMenuScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();

  const options = [
    {
      title: 'Single Lead Upload',
      subtitle: 'Add one lead at a time',
      icon: 'person-add-outline',
      color: '#FF9800',
      onPress: () => navigation.navigate('AddLead', {type: 'lead'}),
    },
    {
      title: 'Single Data Upload',
      subtitle: 'Add one data entry at a time',
      icon: 'document-text-outline',
      color: '#2196F3',
      onPress: () => navigation.navigate('AddLead', {type: 'data'}),
    },
    {
      title: 'Bulk Lead Upload',
      subtitle: 'Upload multiple leads via Excel',
      icon: 'cloud-upload-outline',
      color: '#4CAF50',
      onPress: () => navigation.navigate('BulkUpload', {type: 'lead'}),
    },
    {
      title: 'Bulk Data Upload',
      subtitle: 'Upload multiple data entries via Excel',
      icon: 'cloud-upload-outline',
      color: '#009688',
      onPress: () => navigation.navigate('BulkUpload', {type: 'data'}),
    },
  ];

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.content}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              {backgroundColor: theme.colors.surface},
              theme.shadows.sm,
            ]}
            onPress={option.onPress}>
            <View style={[styles.iconContainer, {backgroundColor: option.color + '20'}]}>
              <Icon name={option.icon as any} size={32} color={option.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                {option.title}
              </Text>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                {option.subtitle}
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
});
