import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/utils/themeStore";
import { space, radius, getShadow } from "@/constants/designTokens";

/**
 * Base card with optional padding, border, and shadow.
 * Uses surface (cards) or surfaceElevated (modals) and theme-aware shadow for clear hierarchy.
 */
export function Card({
  children,
  padding = "md",
  bordered = true,
  elevated = false,
  style,
  ...rest
}) {
  const { theme, isDark } = useTheme();
  const paddingValue = padding === "none" ? 0 : padding === "sm" ? space.sm : space.md;
  const shadowStyle = getShadow(isDark, elevated ? "md" : "sm");

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
          padding: paddingValue,
          borderRadius: radius.md,
          borderWidth: bordered ? 1 : 0,
          borderColor: theme.border,
          ...shadowStyle,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
