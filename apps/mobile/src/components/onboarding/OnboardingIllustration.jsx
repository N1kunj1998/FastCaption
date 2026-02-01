import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Sparkles, FileText, Zap } from "lucide-react-native";

const ILLUSTRATION_SIZE = 200;

/**
 * Illustration for intro slides — gradient circle + icon (reference-style).
 * slideId: "hook" | "value" | "outcome"
 */
export function OnboardingIllustration({ slideId, primary, gradientStart, gradientEnd }) {
  const Icon = slideId === "hook" ? Sparkles : slideId === "value" ? FileText : Zap;
  const size = ILLUSTRATION_SIZE;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 500 }}
      style={{ alignItems: "center", justifyContent: "center", marginBottom: 24 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <LinearGradient
          colors={[gradientStart || primary, gradientEnd || primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon color="#fff" size={72} strokeWidth={2} />
        </LinearGradient>
      </View>
    </MotiView>
  );
}
