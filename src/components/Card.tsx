import React from 'react';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({children, style, padding}) => {
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          padding: padding ?? theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
        },
        theme.shadows.sm,
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {},
});
