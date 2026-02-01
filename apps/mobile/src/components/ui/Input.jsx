import React, { forwardRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/utils/themeStore";
import { space, radius, typography } from "@/constants/designTokens";

/**
 * Text input with optional label, error state, and character count. Ref is forwarded to TextInput.
 */
export const Input = forwardRef(function Input(
  {
    value,
    onChangeText,
    placeholder,
    label,
    error,
    maxLength,
    multiline,
    editable = true,
    style,
    inputStyle,
    ...rest
  },
  ref
) {
  const { theme } = useTheme();
  const showCount = typeof maxLength === "number" && maxLength > 0;
  const count = value?.length ?? 0;
  const countWarning = showCount && count > maxLength * 0.9;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[typography.label, { color: theme.text, marginBottom: space.xs }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        maxLength={maxLength}
        multiline={multiline}
        editable={editable}
        style={[
          typography.body,
          {
            backgroundColor: theme.cardBg,
            color: theme.text,
            paddingVertical: space.md,
            paddingHorizontal: space.md,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: error ? theme.error : theme.border,
            minHeight: multiline ? 100 : undefined,
            textAlignVertical: multiline ? "top" : "center",
          },
          inputStyle,
        ]}
        {...rest}
      />
      {(showCount || error) && (
        <View style={styles.footer}>
          {error ? (
            <Text style={[typography.caption, { color: theme.error }]}>{error}</Text>
          ) : null}
          {showCount ? (
            <Text
              style={[
                typography.caption,
                {
                  color: countWarning ? theme.error : theme.textTertiary,
                  marginLeft: "auto",
                },
              ]}
            >
              {count} / {maxLength}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space.xs,
    minHeight: 16,
  },
});
