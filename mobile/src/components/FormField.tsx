import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, MIN_TOUCH } from '../utils/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface FormFieldProps extends TextInputProps {
  label: string;
  icon: IoniconName;
  // Password fields get a show/hide toggle instead of staying masked.
  secure?: boolean;
}

const FormField = ({ label, icon, secure = false, ...inputProps }: FormFieldProps) => {
  const [isHidden, setIsHidden] = useState(secure);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <Ionicons name={icon} size={20} color={colors.textMuted} />
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          secureTextEntry={secure && isHidden}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...inputProps}
        />
        {secure && (
          <TouchableOpacity
            style={styles.inputToggle}
            onPress={() => setIsHidden(!isHidden)}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? `Show ${label}` : `Hide ${label}`}
          >
            <Ionicons name={isHidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 54,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primaryDark,
  },
  textInput: {
    ...typography.paragraph,
    // lineHeight on a TextInput misaligns the caret on iOS.
    lineHeight: undefined,
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    color: colors.charcoal,
  },
  inputToggle: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FormField;
