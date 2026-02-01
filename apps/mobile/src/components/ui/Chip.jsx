import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useTheme } from "@/utils/themeStore";
import { space, radius, typography } from "@/constants/designTokens";

/**
 * Selectable chip/pill (e.g. script format, duration). Clear selected/unselected styles.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  leftIcon,
  disabled = false,
  style,
  textStyle,
  ...rest
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: selected ? theme.primary : theme.cardBg,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          paddingVertical: space.xs,
          paddingHorizontal: space.md,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {leftIcon ? (
        <View style={styles.icon}>{leftIcon}</View>
      ) : null}
      <Text
        style={[
          typography.bodySmall,
          { fontWeight: "600" },
          { color: selected ? theme.primaryText : theme.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  icon: {
    marginRight: 2,
  },
});
