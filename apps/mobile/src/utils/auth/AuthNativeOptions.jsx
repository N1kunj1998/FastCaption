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
import { useAuthModal } from "./store";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const PLACEHOLDER_CLIENT_ID = "com.fastcaption.placeholder";

export function AuthNativeOptions({ onClose }) {
  const { theme } = useTheme();
  const { signInWithApple, setAuth, close } = useAuth();
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID || PLACEHOLDER_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID || PLACEHOLDER_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID || PLACEHOLDER_CLIENT_ID,
  });

  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (!response || response.type !== "success") return;
    WebBrowser.maybeCompleteAuthSession();
    const idToken = response.params?.id_token;
    if (!idToken) return;
    setLoading("google");
    authWithGoogle({ idToken })
      .then((result) => {
        setAuth(result);
        close();
      })
      .catch((err) => {
        setLoading(null);
        Alert.alert("Sign in failed", err.message || "Google sign-in failed");
      });
  }, [response, setAuth, close]);

  const handleApple = async () => {
    if (Platform.OS !== "ios") return;
    setLoading("apple");
    try {
      await signInWithApple();
    } catch (err) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        setLoading(null);
        return;
      }
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
    <View style={{ padding: 24, gap: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 8,
        }}
      >
        Sign in with
      </Text>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          onPress={handleApple}
          disabled={!!loading}
          style={{
            backgroundColor: theme.text,
            padding: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {loading === "apple" ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
              Sign in with Apple
            </Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleGoogle}
        disabled={!!loading || !request}
        style={{
          backgroundColor: theme.cardBg,
          padding: 16,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        {loading === "google" ? (
          <ActivityIndicator color={theme.primary} size="small" />
        ) : (
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>
            Sign in with Google
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClose}
        style={{ padding: 12, alignItems: "center", marginTop: 8 }}
      >
        <Text style={{ fontSize: 14, color: theme.textTertiary }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
