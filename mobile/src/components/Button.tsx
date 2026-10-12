import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, Tone, typography, spacing, borderRadius, MIN_TOUCH } from '../utils/theme';

type Variant = 'primary' | 'accent' | 'secondary' | 'link';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  // Overrides the variant's fill and text colour with a palette tone.
  tone?: Tone;
  // Trailing icon, shown after the label.
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TEXT_COLOR: Record<Variant, string> = {
  primary: colors.white,
  // White on accent1 is only ~2.5:1, so the accent fill takes charcoal.
  accent: colors.charcoal,
  secondary: colors.primaryDark,
  link: colors.primaryDark,
};

const Button = ({
  label,
  onPress,
  variant = 'primary',
  tone,
  icon,
  loading = false,
  disabled = false,
  style,
}: Props) => {
  const isDisabled = disabled || loading;
  const textColor = tone?.text ?? TEXT_COLOR[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        tone && { backgroundColor: tone.background },
        isDisabled && styles.disabled,
        style,
      ]}
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
        <>
          <Text style={[styles.label, { color: textColor }, variant === 'link' && styles.linkLabel]}>
            {label}
          </Text>
          {icon && <Ionicons name={icon} size={20} color={textColor} />}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  accent: {
    backgroundColor: colors.accent1,
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
