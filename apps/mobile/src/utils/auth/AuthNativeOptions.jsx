import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { useTheme } from "@/utils/themeStore";
import { useAuth } from "./useAuth";
import { authWithGoogle } from "@/utils/api";
import { space, radius, typography } from "@/constants/designTokens";
import { Button } from "@/components/ui";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const PLACEHOLDER_CLIENT_ID = "com.fastcaption.placeholder";

export function AuthNativeOptions({ onClose }) {
  const { theme } = useTheme();
  const { signInWithApple, setAuth } = useAuth();
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID || PLACEHOLDER_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID || PLACEHOLDER_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID || PLACEHOLDER_CLIENT_ID,
  });

  const [loading, setLoading] = useState(null);
  const closeModal = typeof onClose === "function" ? onClose : () => {};

  useEffect(() => {
    if (!response || response.type !== "success") return;
    WebBrowser.maybeCompleteAuthSession();
    const idToken = response.params?.id_token;
    if (!idToken) {
      console.warn("[Auth] Google response missing id_token", response);
      return;
    }
    console.log("[Auth] Calling backend with Google idToken...");
    setLoading("google");
    authWithGoogle({ idToken })
      .then((result) => {
        console.log("[Auth] Google sign-in success, closing modal");
        setAuth(result);
        closeModal();
      })
      .catch((err) => {
        console.error("[Auth] Google sign-in failed:", err?.message ?? err);
        setLoading(null);
        Alert.alert("Sign in failed", err.message || "Google sign-in failed");
      });
  }, [response, setAuth, closeModal]);

  const handleApple = async () => {
    if (Platform.OS !== "ios") return;
    console.log("[Auth] Starting Apple sign-in...");
    setLoading("apple");
    try {
      await signInWithApple();
      console.log("[Auth] Apple sign-in success");
    } catch (err) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        console.log("[Auth] Apple sign-in canceled by user");
        setLoading(null);
        return;
      }
      console.error("[Auth] Apple sign-in failed:", err?.message ?? err);
      setLoading(null);
      Alert.alert("Sign in failed", err.message || "Apple sign-in failed");
    }
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(
        "Not configured",
        "Google sign-in requires EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env. See README."
      );
      return;
    }
    promptAsync();
  };

  return (
    <View style={{ gap: space.md }}>
      <Text
        style={[typography.heading3, { color: theme.text, marginBottom: space.xs }]}
        accessibilityRole="header"
        accessibilityLabel="Sign in or sign up"
      >
        Sign in or sign up
      </Text>
      <Text
        style={[typography.bodySmall, { color: theme.textSecondary, marginBottom: space.sm }]}
      >
        Sign in once to save and sync your scripts. We only use this to save your scripts.
      </Text>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          onPress={handleApple}
          disabled={!!loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#000",
            paddingVertical: space.md,
            paddingHorizontal: space.lg,
            borderRadius: radius.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: space.xs,
            minHeight: 48,
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Apple"
          accessibilityState={{ disabled: !!loading }}
        >
          {loading === "apple" ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[typography.button, { color: "#fff" }]}>
              Sign in with Apple
            </Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleGoogle}
        disabled={!!loading || !request}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.cardBg,
          paddingVertical: space.md,
          paddingHorizontal: space.lg,
          borderRadius: radius.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: space.xs,
          borderWidth: 1,
          borderColor: theme.border,
          minHeight: 48,
        }}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Google"
        accessibilityState={{ disabled: !!loading || !request }}
      >
        {loading === "google" ? (
          <ActivityIndicator color={theme.primary} size="small" />
        ) : (
          <Text style={[typography.button, { color: theme.text }]}>
            Sign in or sign up with Google
          </Text>
        )}
      </TouchableOpacity>

      <Button
        onPress={closeModal}
        variant="ghost"
        label="Cancel"
        fullWidth
        style={{ marginTop: space.xs }}
        accessibilityLabel="Cancel sign in"
        accessibilityHint="Closes the sign in sheet"
      />
    </View>
  );
}
