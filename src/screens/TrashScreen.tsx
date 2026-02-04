import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTheme} from '../hooks/useTheme';
import {LoadingSpinner, EmptyState, DeletedLeadItem} from '../components';
import {leadService} from '../services/leadService';
import {Lead} from '../types';

export const TrashScreen: React.FC = () => {
  const {theme} = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: deletedLeads,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['deletedLeads'],
    queryFn: () => leadService.getDeletedLeads(),
  });

  const restoreMutation = useMutation({
    mutationFn: (leadId: string) => leadService.restoreLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['deletedLeads']});
      queryClient.invalidateQueries({queryKey: ['leads']});
      Alert.alert('Success', 'Lead restored successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to restore lead');
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (leadId: string) => leadService.permanentDeleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['deletedLeads']});
      Alert.alert('Success', 'Lead permanently deleted');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete lead');
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRestore = (leadId: string) => {
    restoreMutation.mutate(leadId);
  };

  const handlePermanentDelete = (leadId: string) => {
    permanentDeleteMutation.mutate(leadId);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.headerText, {color: theme.colors.text}]}>
          Deleted Leads
        </Text>
        <Text style={[styles.subHeaderText, {color: theme.colors.textSecondary}]}>
          {deletedLeads?.length || 0} items in trash
        </Text>
      </View>

      <FlatList
        data={deletedLeads}
        renderItem={({item}: {item: Lead}) => (
          <DeletedLeadItem
            lead={item}
            onRestore={() => handleRestore(item.id)}
            onPermanentDelete={() => handlePermanentDelete(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            message="No deleted leads"
            icon="trash-outline"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
});
