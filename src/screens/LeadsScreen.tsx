import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Card, Badge, Avatar, LoadingSpinner, EmptyState} from '../components';
import {leadService} from '../services/leadService';
import {Lead, LeadType} from '../types';
import {openPhoneDialer} from '../utils/helpers';
import {useNavigation, useRoute} from '@react-navigation/native';

type FilterType = 'all' | 'new' | 'inprogress' | 'closed';
type TypeFilter = 'all' | 'lead' | 'data';

export const LeadsScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Set initial type filter from route params
  useEffect(() => {
    if (route.params?.type) {
      setTypeFilter(route.params.type);
    }
  }, [route.params?.type]);

  const {data: leads, isLoading, refetch} = useQuery({
    queryKey: ['leads', typeFilter],
    queryFn: () => leadService.getLeads(typeFilter !== 'all' ? {type: typeFilter as LeadType} : undefined),
  });

  const softDeleteMutation = useMutation({
    mutationFn: (leadId: string) => leadService.softDeleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['leads']});
      Alert.alert('Success', 'Lead moved to trash');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete lead');
    },
  });

  // Add trash button in header for admin/owner
  useEffect(() => {
    navigation.setOptions({
      headerRight: user && ['admin'].includes(user.role) ? () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Trash')}
          style={{marginRight: 15}}>
          <Icon name="trash-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : undefined,
    });
  }, [user, navigation, theme]);

  const handleSoftDelete = (leadId: string, leadName: string) => {
    Alert.alert(
      'Delete Lead',
      `Move "${leadName}" to trash?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => softDeleteMutation.mutate(leadId),
        },
      ],
    );
  };

  const getTypeBadge = (type: LeadType) => {
    return type === 'lead'
      ? {label: 'Website', color: '#4CAF50'}
      : {label: 'Market', color: '#FF9800'};
  };

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'new') return matchesSearch && lead.status === 'new';
    if (filter === 'inprogress') return matchesSearch && ['contacted', 'interested'].includes(lead.status);
    if (filter === 'closed') return matchesSearch && ['converted', 'spam'].includes(lead.status);
    return matchesSearch;
  }).sort((a, b) => {
    // Sort by createdAt descending (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderLeadCard = ({item}: {item: Lead}) => {
    const typeBadge = getTypeBadge(item.type);
    return (
      <Card style={styles.leadCard}>
        {/* Type Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.typeBadge, {backgroundColor: typeBadge.color}]}>
            <Text style={styles.typeBadgeText}>{typeBadge.label}</Text>
          </View>
        </View>

        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Avatar name={item.name} size={48} />
            <View style={styles.leadDetails}>
              <Text style={[theme.typography.body1, {color: theme.colors.text, fontWeight: '600'}]}>
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => openPhoneDialer(item.phone)}>
                <Text style={[theme.typography.body2, {color: '#FF9800', fontWeight: '600'}]}>
                  {item.phone}
                </Text>
              </TouchableOpacity>
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

        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: '#ff6b6b', borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => handleSoftDelete(item.id, item.name)}>
          <Icon name="trash-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Card>
    );
  };

  const renderListHeader = () => (
    <>
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

      {/* Type Filter Tabs */}
      <View style={styles.typeFilterContainer}>
        <TouchableOpacity
          style={[
            styles.typeFilterTab,
            typeFilter === 'all' && {backgroundColor: theme.colors.primary},
            {borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => setTypeFilter('all')}>
          <Text
            style={[
              theme.typography.body2,
              {color: typeFilter === 'all' ? '#FFFFFF' : theme.colors.text},
            ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeFilterTab,
            typeFilter === 'lead' && {backgroundColor: '#4CAF50'},
            {borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => setTypeFilter('lead')}>
          <Text
            style={[
              theme.typography.body2,
              {color: typeFilter === 'lead' ? '#FFFFFF' : theme.colors.text},
            ]}>
            🌐 Website Leads
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeFilterTab,
            typeFilter === 'data' && {backgroundColor: '#FF9800'},
            {borderRadius: theme.borderRadius.md},
          ]}
          onPress={() => setTypeFilter('data')}>
          <Text
            style={[
              theme.typography.body2,
              {color: typeFilter === 'data' ? '#FFFFFF' : theme.colors.text},
            ]}>
            📊 Market Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
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
    </>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <FlatList
        data={filteredLeads}
        renderItem={renderLeadCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderListHeader}
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
  typeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
  },
  typeFilterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 80,
  },
  leadCard: {
    marginBottom: 10,
    position: 'relative',
    paddingTop: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 85,
  },
  leadInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  leadDetails: {
    flex: 1,
    gap: 6,
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
    gap: 6,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
