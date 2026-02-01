import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/utils/themeStore";
import { space, typography } from "@/constants/designTokens";
import { Button } from "./Button";
import { LottieView } from "./LottieView";

/**
 * Empty state: optional Lottie + icon + title + description + optional CTA.
 * When lottieSource is provided, Lottie is shown; icon is fallback when Lottie fails.
 */
export function EmptyState({
  icon: Icon,
  lottieSource,
  title,
  description,
  actionLabel,
  onAction,
  style,
  iconStyle,
}) {
  const { theme } = useTheme();
  const [lottieFailed, setLottieFailed] = useState(false);
  const showLottie = lottieSource && !lottieFailed;
  const showIcon = Icon && !showLottie;

  return (
    <View style={[styles.wrapper, style]}>
      {showLottie ? (
        <View style={[styles.iconWrap, iconStyle]}>
          <LottieView
            source={lottieSource}
            width={140}
            height={140}
            loop
            autoPlay
            onAnimationFailure={() => setLottieFailed(true)}
          />
        </View>
      ) : showIcon ? (
        <View style={[styles.iconWrap, iconStyle]}>
          <Icon color={theme.textTertiary} size={48} />
        </View>
      ) : null}
      <Text style={[typography.heading3, { color: theme.text, textAlign: "center", marginBottom: space.xs }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            typography.bodySmall,
            { color: theme.textSecondary, textAlign: "center", marginBottom: space.lg },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="primary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    marginBottom: space.lg,
  },
});
