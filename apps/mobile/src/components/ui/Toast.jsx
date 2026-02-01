import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/utils/themeStore";
import { useToastStore } from "@/utils/toastStore";
import { space, radius, typography } from "@/constants/designTokens";

/**
 * Global toast. Mount once in root layout; call useToastStore.getState().show("Copied!") to show.
 * Auto-hides after 2.5s (handled by toastStore).
 */
export function Toast() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { message, visible } = useToastStore();

  if (!visible || !message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top + space.lg,
          backgroundColor: theme.surfaceElevated || theme.cardBg,
          borderColor: theme.border,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[typography.bodySmall, { color: theme.text, fontWeight: "600" }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});
