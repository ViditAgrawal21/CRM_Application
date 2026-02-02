import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {EmptyState} from '../components';

export const PropertiesScreen: React.FC = () => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <EmptyState message="Properties coming soon - External API will be integrated" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
