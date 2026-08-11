import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, borderRadius, spacing } from '../../lib/theme';

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.secondary, borderWidth: 0 };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
      case 'destructive':
        return { backgroundColor: colors.destructive, borderWidth: 0 };
      case 'primary':
      default:
        return { backgroundColor: colors.primary, borderWidth: 0 };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return { color: colors.foreground };
      case 'secondary':
        return { color: colors.secondaryForeground };
      case 'destructive':
      case 'primary':
      default:
        return { color: colors.primaryForeground };
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.sm + 4 },
          text: { fontSize: 13 },
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
          text: { fontSize: 16 },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.md },
          text: { fontSize: 14 },
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[
        styles.button,
        getContainerStyle(),
        sizeStyle.container,
        (disabled || loading) && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} size="small" />
      ) : (
        <Text style={[styles.text, getTextStyle(), sizeStyle.text]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
