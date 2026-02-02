import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface BadgeProps {
  text: string;
  variant?: 'followUp' | 'backlog' | 'meeting' | 'propertyVisit' | 'success' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({text, variant = 'default'}) => {
  const {theme} = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'followUp':
        return theme.colors.followUp;
      case 'backlog':
        return theme.colors.backlog;
      case 'meeting':
        return theme.colors.meeting;
      case 'propertyVisit':
        return theme.colors.propertyVisit;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.borderRadius.sm,
        },
      ]}>
      <Text style={[styles.text, theme.typography.caption, {color: '#FFFFFF'}]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontSize: 10,
  },
});
