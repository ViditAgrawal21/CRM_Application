import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({message, icon}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.message, theme.typography.body1, {color: theme.colors.textSecondary}]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
  },
});
