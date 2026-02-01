import { View, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#8B5CF6",
  "#A78BFA",
  "#059669",
  "#10B981",
  "#0284C7",
  "#0EA5E9",
  "#EA580C",
  "#F97316",
  "#EC4899",
  "#F59E0B",
  "#22c55e",
  "#6366F1",
  "#fff",
  "#FEF3C7",
];

/**
 * Confetti burst using react-native-confetti-cannon.
 * Slower explosion + fall so the animation is easy to see.
 */
export function ConfettiOverlay({ onComplete }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <ConfettiCannon
        count={200}
        origin={{ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT * 0.4 }}
        explosionSpeed={500}
        fallSpeed={3500}
        colors={CONFETTI_COLORS}
        fadeOut
        autoStart
        onAnimationEnd={onComplete}
      />
    </View>
  );
}
