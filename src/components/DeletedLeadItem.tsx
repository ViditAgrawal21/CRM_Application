import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {Lead} from '../types';
import {useTheme} from '../hooks/useTheme';

interface DeletedLeadItemProps {
  lead: Lead;
  onRestore: () => void;
  onPermanentDelete: () => void;
}

export const DeletedLeadItem: React.FC<DeletedLeadItemProps> = ({
  lead,
  onRestore,
  onPermanentDelete,
}) => {
  const {theme} = useTheme();

  const handleRestore = () => {
    Alert.alert(
      'Restore Lead',
      'Move this lead back to active leads?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore',
          onPress: onRestore,
        },
      ],
    );
  };

  const handlePermanentDelete = () => {
    Alert.alert(
      'Permanent Delete',
      'This will permanently delete the lead. This action cannot be undone!',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: onPermanentDelete,
        },
      ],
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
      {/* Lead Info */}
      <View style={styles.header}>
        <Text style={[styles.name, {color: theme.colors.text}]}>{lead.name}</Text>
        <Text style={[styles.phone, {color: theme.colors.textSecondary}]}>
          {lead.phone}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>Type:</Text>
          <Text style={[styles.value, {color: theme.colors.text}]}>
            {lead.type.toUpperCase()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>Status:</Text>
          <Text style={[styles.value, {color: theme.colors.text}]}>
            {lead.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
            Configuration:
          </Text>
          <Text style={[styles.value, {color: theme.colors.text}]}>
            {lead.configuration}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>Location:</Text>
          <Text style={[styles.value, {color: theme.colors.text}]}>{lead.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>Deleted By:</Text>
          <Text style={[styles.value, {color: theme.colors.text}]}>
            {lead.deletedByUser?.name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: theme.colors.textSecondary}]}>Deleted At:</Text>
          <Text style={[styles.value, {color: theme.colors.text}]}>
            {formatDate(lead.deletedAt)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleRestore}
          style={[styles.button, styles.restoreButton]}>
          <Icon name="arrow-undo" size={18} color="#fff" />
          <Text style={styles.buttonText}>Restore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePermanentDelete}
          style={[styles.button, styles.deleteButton]}>
          <Icon name="trash" size={18} color="#fff" />
          <Text style={styles.buttonText}>Delete Forever</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phone: {
    fontSize: 14,
    marginTop: 4,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 100,
  },
  value: {
    fontSize: 13,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  restoreButton: {
    backgroundColor: '#51cf66',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
