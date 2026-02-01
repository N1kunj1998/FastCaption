import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/utils/themeStore";
import { space, radius, typography } from "@/constants/designTokens";

/**
 * Reusable button with variants, loading, disabled, and optional icon.
 * Primary variant uses gradient (hero/CTA) and triggers light haptic on press (where supported).
 */
export function Button({
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  label,
  icon: Icon,
  iconPosition = "left",
  fullWidth,
  size = "md",
  style,
  textStyle,
  ...rest
}) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const useGradient = variant === "primary" && !isDisabled && (theme.primaryGradientStart != null && theme.primaryGradientEnd != null);

  const handlePress = (e) => {
    if (variant === "primary" && !isDisabled && Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    onPress?.(e);
  };

  const variantStyles = {
    primary: {
      backgroundColor: useGradient ? "transparent" : theme.primary,
      borderColor: useGradient ? "transparent" : theme.primary,
      borderWidth: useGradient ? 0 : 1,
    },
    secondary: {
      backgroundColor: theme.cardBg,
      borderColor: theme.border,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
    },
    danger: {
      backgroundColor: theme.error,
      borderColor: theme.error,
      borderWidth: 1,
    },
  };

  const textColorByVariant = {
    primary: theme.primaryText,
    secondary: theme.text,
    ghost: theme.primary,
    danger: "#fff",
  };

  const paddingVertical = size === "sm" ? space.xs : space.md;
  const paddingHorizontal = size === "sm" ? space.sm : space.lg;
  const textStyleToken = size === "sm" ? typography.buttonSmall : typography.button;

  const content = loading ? (
    <ActivityIndicator size="small" color={textColorByVariant[variant]} />
  ) : (
    <View style={styles.content}>
      {Icon && iconPosition === "left" && (
        <Icon color={textColorByVariant[variant]} size={size === "sm" ? 18 : 20} style={styles.iconLeft} />
      )}
      <Text
        style={[
          textStyleToken,
          { color: textColorByVariant[variant] },
          textStyle,
        ]}
      >
        {label}
      </Text>
      {Icon && iconPosition === "right" && (
        <Icon color={textColorByVariant[variant]} size={size === "sm" ? 18 : 20} style={styles.iconRight} />
      )}
    </View>
  );

  const buttonContent = useGradient ? (
    <View style={[styles.gradientWrap, { borderRadius: radius.md }]}>
      <LinearGradient
        colors={[theme.primaryGradientStart, theme.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.contentWrap, { paddingVertical, paddingHorizontal }]}>{content}</View>
    </View>
  ) : (
    content
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        variantStyles[variant],
        {
          paddingVertical: useGradient ? 0 : paddingVertical,
          paddingHorizontal: useGradient ? 0 : paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
          borderRadius: radius.md,
          width: fullWidth ? "100%" : undefined,
          overflow: "hidden",
        },
        style,
      ]}
      {...rest}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  gradientWrap: {
    flex: 1,
    width: "100%",
    minHeight: 48,
    overflow: "hidden",
  },
  contentWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  iconLeft: {
    marginRight: space.xs,
  },
  iconRight: {
    marginLeft: space.xs,
  },
});
