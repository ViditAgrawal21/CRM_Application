import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {Card, Badge, Avatar, LoadingSpinner, EmptyState} from '../components';
import {leadService} from '../services/leadService';
import {Lead} from '../types';
import {openPhoneDialer} from '../utils/helpers';
import {useNavigation} from '@react-navigation/native';

type FilterType = 'all' | 'new' | 'inprogress' | 'closed';

export const LeadsScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {data: leads, isLoading, refetch} = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadService.getLeads(),
  });

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'new') return matchesSearch && lead.status === 'new';
    if (filter === 'inprogress') return matchesSearch && ['contacted', 'interested'].includes(lead.status);
    if (filter === 'closed') return matchesSearch && ['converted', 'spam'].includes(lead.status);
    return matchesSearch;
  });

  const renderLeadCard = ({item}: {item: Lead}) => (
    <Card style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <Avatar name={item.name} size={48} />
          <View style={styles.leadDetails}>
            <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
              {item.name}
            </Text>
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
              {item.phone}
            </Text>
          </View>
        </View>
        <Badge
          text={item.status.toUpperCase()}
          variant={item.status === 'new' ? 'followUp' : 'default'}
        />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            ASSIGNED TO
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            {item.assignedUser?.name || 'Self'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            CONFIGURATION
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            {item.configuration}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            LOCATION
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            {item.location}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
            BUDGET
          </Text>
          <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
            $500k - $750k
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: theme.colors.call, borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => {
            openPhoneDialer(item.phone);
          }}>
          <Icon name="logo-whatsapp" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButtonLarge,
            {backgroundColor: theme.colors.viewMore, borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => navigation.navigate('LeadDetails', {leadId: item.id})}>
          <Text style={[theme.typography.caption, {color: '#FFFFFF', fontWeight: '600'}]}>
            View More
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: theme.colors.notes, borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => navigation.navigate('LeadDetails', {leadId: item.id, tab: 'notes'})}>
          <Icon name="chatbox-outline" size={16} color="#FFFFFF" />
          <Text style={[theme.typography.caption, {color: '#FFFFFF'}]}>Notes</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, {backgroundColor: theme.colors.surface}]}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, {color: theme.colors.text}]}
          placeholder="Search by name or number..."
          placeholderTextColor={theme.colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && {backgroundColor: theme.colors.primary},
            {borderRadius: theme.borderRadius.full},
          ]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              theme.typography.body2,
              {color: filter === 'all' ? '#FFFFFF' : theme.colors.text},
            ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'new' && {backgroundColor: theme.colors.primary},
            {borderRadius: theme.borderRadius.full},
          ]}
          onPress={() => setFilter('new')}>
          <Text
            style={[
              theme.typography.body2,
              {color: filter === 'new' ? '#FFFFFF' : theme.colors.text},
            ]}>
            New
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'inprogress' && {backgroundColor: theme.colors.primary},
            {borderRadius: theme.borderRadius.full},
          ]}
          onPress={() => setFilter('inprogress')}>
          <Text
            style={[
              theme.typography.body2,
              {color: filter === 'inprogress' ? '#FFFFFF' : theme.colors.text},
            ]}>
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'closed' && {backgroundColor: theme.colors.primary},
            {borderRadius: theme.borderRadius.full},
          ]}
          onPress={() => setFilter('closed')}>
          <Text
            style={[
              theme.typography.body2,
              {color: filter === 'closed' ? '#FFFFFF' : theme.colors.text},
            ]}>
            Closed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLeadCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="No leads found" />}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  leadCard: {
    marginBottom: 12,
  },
  leadHeader: {
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
