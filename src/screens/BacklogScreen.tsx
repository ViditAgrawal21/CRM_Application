import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {Card, Badge, Avatar, LoadingSpinner, EmptyState} from '../components';
import {followupService} from '../services/followupService';
import {Followup} from '../types';
import {formatDate, formatTime} from '../utils/helpers';
import {useNavigation} from '@react-navigation/native';

export const BacklogScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();

  const {data: backlog, isLoading, refetch} = useQuery({
    queryKey: ['followups-backlog'],
    queryFn: () => followupService.getBacklog(),
  });

  const renderBacklogCard = ({item}: {item: Followup}) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leadInfo}>
          <Avatar name={item.lead?.name || ''} size={40} />
          <View style={styles.leadDetails}>
            <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
              {item.lead?.name}
            </Text>
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
              {item.lead?.phone}
            </Text>
          </View>
        </View>
        <Badge text="BACKLOG" variant="backlog" />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            ASSIGNED TO
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            {item.lead?.assignedUser?.name || 'Self'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            LOCATION
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            {item.lead?.location}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            MISSED DATE
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.error}]}>
            {formatDate(item.reminderAt)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            TIME
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.error}]}>
            {formatTime(item.reminderAt)}
          </Text>
        </View>
      </View>

      {item.notes && (
        <Text
          style={[
            theme.typography.caption,
            {color: theme.colors.textSecondary, marginTop: 12, fontStyle: 'italic'},
          ]}>
          {item.notes}
        </Text>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: theme.colors.call, borderRadius: theme.borderRadius.md},
          ]}>
          <Icon name="logo-whatsapp" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButtonLarge,
            {backgroundColor: theme.colors.viewMore, borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => navigation.navigate('LeadDetails', {leadId: item.leadId})}>
          <Text style={[theme.typography.caption, {color: '#FFFFFF', fontWeight: '600'}]}>
            VIEW MORE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: theme.colors.notes, borderRadius: theme.borderRadius.md},
          ]}>
          <Icon name="chatbox-outline" size={16} color="#FFFFFF" />
          <Text style={[theme.typography.caption, {color: '#FFFFFF'}]}>NOTES</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={backlog}
        renderItem={renderBacklogCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="No backlog items" />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      />
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
    marginBottom: 16,
  },
  leadInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  leadDetails: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  actionButtonLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
