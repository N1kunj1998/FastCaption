import React, { useState } from "react";
import { StyleSheet } from "react-native";
import LottieNative from "lottie-react-native";

/**
 * Wraps lottie-react-native with default size and error fallback.
 * source: require('./file.json') or { uri: 'https://...' }
 */
export function LottieView({
  source,
  style,
  loop = true,
  autoPlay = true,
  width = 120,
  height = 120,
  onAnimationFailure,
  ...rest
}) {
  const [errored, setErrored] = useState(false);

  if (!source || errored) {
    return null;
  }

  return (
    <LottieNative
      source={source}
      style={[styles.animation, { width, height }, style]}
      loop={loop}
      autoPlay={autoPlay}
      onAnimationFailure={(err) => {
        setErrored(true);
        onAnimationFailure?.(err);
      }}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  animation: {
    alignSelf: "center",
  },
});
