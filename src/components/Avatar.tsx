import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {getInitials} from '../utils/helpers';

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 40,
  backgroundColor,
}) => {
  const {theme} = useTheme();
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor || theme.colors.primary,
        },
      ]}>
      <Text style={[styles.text, {fontSize: size * 0.4, color: '#FFFFFF'}]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
