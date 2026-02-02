import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const {theme} = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.surface;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textLight;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return theme.colors.text;
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return {paddingVertical: 8, paddingHorizontal: 16};
      case 'medium':
        return {paddingVertical: 12, paddingHorizontal: 24};
      case 'large':
        return {paddingVertical: 16, paddingHorizontal: 32};
      default:
        return {paddingVertical: 12, paddingHorizontal: 24};
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: theme.colors.primary,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.borderRadius.md,
          ...getPadding(),
        },
        getBorderStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              theme.typography.button,
              {color: getTextColor()},
              textStyle,
            ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {},
});
