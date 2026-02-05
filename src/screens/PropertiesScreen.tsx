import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {LoadingSpinner, EmptyState, Badge} from '../components';
import {propertyService} from '../services/propertyService';
import {Property} from '../types';

export const PropertiesScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {data: properties, isLoading, refetch} = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getProperties(),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'sold':
        return '#F44336';
      case 'under_construction':
        return '#FF9800';
      default:
        return theme.colors.primary;
    }
  };

  const filteredProperties = properties?.filter(property => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const searchableFields = [
      property.title,
      property.location,
      property.propertyType,
      property.status.replace('_', ' '),
      property.possession || '',
      property.unitsLine || '',
      property.listingBy || '',
    ].map(field => field.toLowerCase());
    
    // Search in all fields
    return searchableFields.some(field => field.includes(query));
  });

  const renderProperty = ({item}: {item: Property}) => (
    <TouchableOpacity
      style={[styles.propertyCard, {backgroundColor: theme.colors.surface}]}
      onPress={() => navigation.navigate('PropertyDetails', {propertyId: item.id})}>
      <Image source={{uri: item.imageUrl}} style={styles.propertyImage} />

      <View style={styles.propertyInfo}>
        <Text style={[styles.title, {color: theme.colors.text}]}>{item.title}</Text>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.location, {color: theme.colors.textSecondary}]}>
            {item.location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="business-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.type, {color: theme.colors.textSecondary}]}>
            {item.propertyType}
          </Text>
        </View>

        {item.unitsLine && (
          <Text style={[styles.units, {color: theme.colors.primary}]} numberOfLines={2}>
            {item.unitsLine}
          </Text>
        )}

        <View style={styles.footer}>
          {item.possession && (
            <View style={styles.possessionBadge}>
              <Icon name="calendar-outline" size={14} color="#666" />
              <Text style={styles.possessionText}>{item.possession}</Text>
            </View>
          )}
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
          placeholder="Search properties by title, location..."
          placeholderTextColor={theme.colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyState message="No properties available" icon="home-outline" />}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContainer: {
    padding: 12,
  },
  propertyCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  propertyInfo: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  location: {
    fontSize: 13,
  },
  type: {
    fontSize: 13,
  },
  units: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  possessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  possessionText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
