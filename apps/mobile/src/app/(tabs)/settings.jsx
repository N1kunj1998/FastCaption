import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { ChevronRight, Crown, LogIn, LogOut, Palette } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeStore";
import { useAuth } from "@/utils/auth/useAuth";
import { NICHES, STYLES } from "@/constants/onboarding";

const TERMS_URL =
  process.env.EXPO_PUBLIC_TERMS_URL || "https://example.com/terms";
const PRIVACY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_URL || "https://example.com/privacy";
const PRO_URL =
  process.env.EXPO_PUBLIC_PRO_URL || "https://example.com/upgrade";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark, setTheme, loadTheme } = useTheme();
  const { isAuthenticated, isReady, signIn, signOut } = useAuth();
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState("");
  const [showEditPreferences, setShowEditPreferences] = useState(false);
  const [editNiche, setEditNiche] = useState(null);
  const [editStyle, setEditStyle] = useState(null);

  useEffect(() => {
    loadSettings();
    loadTheme();
  }, []);

  function openEditPreferences() {
    setEditNiche(niche === "Not set" ? null : niche);
    setEditStyle(style === "Not set" ? null : style);
    setShowEditPreferences(true);
  }

  async function saveEditPreferences() {
    await AsyncStorage.setItem("userNiche", editNiche ?? "");
    await AsyncStorage.setItem("userStyle", editStyle ?? "");
    await loadSettings();
    setShowEditPreferences(false);
  }

  async function loadSettings() {
    const userNiche = await AsyncStorage.getItem("userNiche");
    const userStyle = await AsyncStorage.getItem("userStyle");
    setNiche(userNiche || "Not set");
    setStyle(userStyle || "Not set");
  }

  async function handleResetOnboarding() {
    Alert.alert(
      "Reset Preferences",
      "This will reset your niche and style preferences.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("hasOnboarded");
            router.replace("/onboarding");
          },
        },
      ],
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ padding: 24, paddingBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: theme.text }}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingTop: 8,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 24 }}>
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.textSecondary,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Appearance
            </Text>
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Palette color={theme.accent} size={24} />
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.text,
                      }}
                    >
                      {isDark ? "Dark Theme" : "Light Theme"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      Switch between themes
                    </Text>
                  </View>
                </View>
                <Switch
                  value={!isDark}
                  onValueChange={(value) => setTheme(!value)}
                  trackColor={{ false: "#767577", true: theme.primary }}
                  thumbColor={theme.cardBg}
                />
              </View>
            </View>
          </View>

          {isReady && (
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: theme.textSecondary,
                  marginBottom: 12,
                  textTransform: "uppercase",
                }}
              >
                Account
              </Text>
              <TouchableOpacity
                onPress={isAuthenticated ? signOut : signIn}
                style={{
                  backgroundColor: theme.cardBg,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                {isAuthenticated ? (
                  <LogOut color={theme.text} size={24} />
                ) : (
                  <LogIn color={theme.primary} size={24} />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: theme.text }}
                  >
                    {isAuthenticated ? "Sign out" : "Sign in"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {isAuthenticated
                      ? "Sign out of your account"
                      : "Sign in to sync across devices"}
                  </Text>
                </View>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
            </View>
          )}

          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.textSecondary,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Subscription
            </Text>
            <TouchableOpacity
              onPress={() => WebBrowser.openBrowserAsync(PRO_URL)}
              style={{
                backgroundColor: theme.cardBg,
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Crown color="#FFD700" size={24} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: theme.text }}
                >
                  Upgrade to Pro
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Unlimited scripts & premium features
                </Text>
              </View>
              <ChevronRight color={theme.textTertiary} size={20} />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.textSecondary,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              Preferences
            </Text>
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Niche
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.text,
                    textTransform: "capitalize",
                  }}
                >
                  {niche}
                </Text>
              </View>
              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  Style
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.text,
                    textTransform: "capitalize",
                  }}
                >
                  {style}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={openEditPreferences}
              style={{
                marginTop: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: theme.primary }}>
                Change preferences
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResetOnboarding}
              style={{
                marginTop: 8,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: theme.textTertiary }}>
                Reset onboarding (start over)
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.textSecondary,
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              About
            </Text>
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, color: theme.text }}>
                  Terms of Service
                </Text>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginHorizontal: 16,
                }}
              />
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, color: theme.text }}>
                  Privacy Policy
                </Text>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditPreferences}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditPreferences(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "700", color: theme.text }}
              >
                Change preferences
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditPreferences(false)}
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 16, color: theme.primary }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 10,
                }}
              >
                Niche
              </Text>
              <View style={{ gap: 8, marginBottom: 20 }}>
                {NICHES.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => setEditNiche(n.id)}
                    style={{
                      backgroundColor:
                        editNiche === n.id ? theme.primary : theme.cardBg,
                      padding: 14,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderWidth: 1,
                      borderColor:
                        editNiche === n.id ? theme.primary : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{n.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color:
                          editNiche === n.id ? theme.primaryText : theme.text,
                      }}
                    >
                      {n.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 10,
                }}
              >
                Style
              </Text>
              <View style={{ gap: 8, marginBottom: 24 }}>
                {STYLES.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setEditStyle(s.id)}
                    style={{
                      backgroundColor:
                        editStyle === s.id ? theme.primary : theme.cardBg,
                      padding: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        editStyle === s.id ? theme.primary : theme.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color:
                          editStyle === s.id ? theme.primaryText : theme.text,
                      }}
                    >
                      {s.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color:
                          editStyle === s.id
                            ? theme.primaryText
                            : theme.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {s.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={saveEditPreferences}
              style={{
                backgroundColor: theme.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.primaryText,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
