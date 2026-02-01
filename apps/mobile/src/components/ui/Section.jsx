import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/utils/themeStore";
import { space, typography } from "@/constants/designTokens";

/**
 * Section title with optional action (e.g. "APPEARANCE", "Change" link). Used in Settings and Library.
 */
export function Section({
  title,
  actionLabel,
  onAction,
  children,
  style,
  titleStyle,
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.header, { marginBottom: space.sm }]}>
        <Text
          style={[
            typography.caption,
            {
              color: theme.textSecondary,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {actionLabel && onAction ? (
          <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[typography.bodySmall, { fontWeight: "600", color: theme.primary }]}>
              {actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: space.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.xs,
  },
});
