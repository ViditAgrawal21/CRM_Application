import React from 'react';
import {View, Text, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {Card} from './Card';
import {useTheme} from '../hooks/useTheme';

interface StatCardProps {
  title?: string;
  label?: string;
  value: number | string;
  icon?: React.ReactNode | string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({title, label, value, icon, color, style}) => {
  const {theme} = useTheme();
  const displayLabel = title || label || '';

  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return <Icon name={icon as any} size={24} color={color || theme.colors.primary} />;
    }
    
    return icon;
  };

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{renderIcon()}</View>}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.value,
              theme.typography.h2,
              {color: color || theme.colors.primary},
            ]}>
            {value}
          </Text>
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {color: theme.colors.textSecondary},
            ]}>
            {displayLabel}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {},
  textContainer: {
    flex: 1,
  },
  value: {
    marginBottom: 4,
  },
  label: {},
});
