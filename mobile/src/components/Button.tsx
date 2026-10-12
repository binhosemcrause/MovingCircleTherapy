import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { colors, typography, spacing, borderRadius, MIN_TOUCH } from '../utils/theme';

type Variant = 'primary' | 'secondary' | 'link';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button = ({ label, onPress, variant = 'primary', loading = false, disabled = false, style }: Props) => {
  const isDisabled = disabled || loading;
  const textColor = variant === 'primary' ? colors.white : colors.primaryDark;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }, variant === 'link' && styles.linkLabel]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
  },
  primary: {
    backgroundColor: colors.primaryDark,
    minHeight: 54,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    minHeight: 54,
  },
  link: {
    paddingHorizontal: spacing.sm,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.label,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
  linkLabel: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});

export default Button;
