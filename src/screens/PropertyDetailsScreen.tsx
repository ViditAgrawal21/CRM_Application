import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {useTheme} from '../hooks/useTheme';
import {LoadingSpinner, Card} from '../components';
import {propertyService} from '../services/propertyService';

export const PropertyDetailsScreen: React.FC = () => {
  const {theme} = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {propertyId} = route.params;

  const {data: property, isLoading} = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyService.getProperty(propertyId),
  });

  const openDriveLink = () => {
    if (property?.driveLink) {
      Linking.openURL(property.driveLink).catch(() => {
        Alert.alert('Error', 'Could not open drive link');
      });
    }
  };

  const callProperty = () => {
    if (property?.phone) {
      Linking.openURL(`tel:${property.phone}`).catch(() => {
        Alert.alert('Error', 'Could not make call');
      });
    }
  };

  const sharePropertyNative = async () => {
    try {
      await Share.share({
        message: `🏠 ${property?.title}\n\n📍 ${property?.location}\n\nCheck out this amazing property!`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const shareWithLead = () => {
    if (property) {
      navigation.navigate('ShareProperty', {property});
    }
  };

  if (isLoading || !property) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Image source={{uri: property.imageUrl}} style={styles.headerImage} />

      <View style={[styles.content, {backgroundColor: theme.colors.surface}]}>
        <Text style={[styles.title, {color: theme.colors.text}]}>{property.title}</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="location" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, {color: theme.colors.text}]}>
              {property.location}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="business" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, {color: theme.colors.text}]}>
              {property.propertyType}
            </Text>
          </View>

          {property.possession && (
            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, {color: theme.colors.text}]}>
                Possession: {property.possession}
              </Text>
            </View>
          )}

          {property.listingBy && (
            <View style={styles.infoRow}>
              <Icon name="person" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, {color: theme.colors.text}]}>
                Listed by: {property.listingBy}
              </Text>
            </View>
          )}
        </View>

        {property.unitsLine && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Available Units
            </Text>
            <Text style={[styles.unitsText, {color: theme.colors.textSecondary}]}>
              {property.unitsLine}
            </Text>
          </Card>
        )}

        {property.amenitiesSummary && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Amenities</Text>
            <Text style={[styles.amenitiesText, {color: theme.colors.textSecondary}]}>
              {property.amenitiesSummary}
            </Text>
          </Card>
        )}

        {/* Property Stats */}
        <Card style={styles.statsSection}>
          {property.totalLandAcres && (
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Land Area:
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {property.totalLandAcres} Acres
              </Text>
            </View>
          )}

          {property.totalTowers && (
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Towers:
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {property.totalTowers}
              </Text>
            </View>
          )}

          {property.totalFloors && (
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Floors:
              </Text>
              <Text style={[styles.statValue, {color: theme.colors.text}]}>
                {property.totalFloors}
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {property.phone && (
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: theme.colors.call}]}
            onPress={callProperty}>
            <Icon name="call" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}

        {property.driveLink && (
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: theme.colors.primary}]}
            onPress={openDriveLink}>
            <Icon name="folder-open" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Documents</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: '#25D366'}]}
          onPress={shareWithLead}>
          <Icon name="logo-whatsapp" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Share with Lead</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: theme.colors.textSecondary}]}
          onPress={sharePropertyNative}>
          <Icon name="share-social" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  unitsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  amenitiesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsSection: {
    padding: 16,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    minWidth: '45%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
