import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { ChevronRight, Crown, LogIn, LogOut, Palette, ExternalLink, Star, MessageCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, COLOR_THEMES } from "@/utils/themeStore";
import { useAuth } from "@/utils/auth/useAuth";
import { useAuthModal } from "@/utils/auth/store";
import { useSubscription, PAYWALL_RESULT, logRevenueCatDiagnostics } from "@/utils/purchases";
import { useToastStore } from "@/utils/toastStore";
import { NICHES, STYLES, PLATFORMS } from "@/constants/onboarding";
import { space, radius, typography } from "@/constants/designTokens";
import { Section, Card, Button } from "@/components/ui";

const TERMS_URL =
  process.env.EXPO_PUBLIC_TERMS_URL || "https://example.com/terms";
const PRIVACY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_URL || "https://example.com/privacy";
const RATE_URL =
  process.env.EXPO_PUBLIC_RATE_URL || "https://apps.apple.com/app/fastcaption";
const FEEDBACK_URL =
  process.env.EXPO_PUBLIC_FEEDBACK_URL || "mailto:support@example.com";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark, setTheme, loadTheme, colorThemeId, setColorTheme } = useTheme();
  const { isAuthenticated, isReady, auth, signOut } = useAuth();
  const { open: openAuth } = useAuthModal();
  const { isPro, isLoading: subscriptionLoading, presentPaywall, presentCustomerCenter } = useSubscription();
  const showToast = useToastStore((s) => s.show);
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState("");
  const [platform, setPlatform] = useState("");
  const [userName, setUserName] = useState("");
  const [showEditPreferences, setShowEditPreferences] = useState(false);
  const [showColorThemeModal, setShowColorThemeModal] = useState(false);
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
    const [userNiche, userStyle, userPlatform, name] = await Promise.all([
      AsyncStorage.getItem("userNiche"),
      AsyncStorage.getItem("userStyle"),
      AsyncStorage.getItem("userPlatform"),
      AsyncStorage.getItem("userName"),
    ]);
    setNiche(userNiche || "Not set");
    setStyle(userStyle || "Not set");
    const platformLabel = PLATFORMS.find((p) => p.id === userPlatform)?.label;
    setPlatform(platformLabel || (userPlatform ? userPlatform : "Not set"));
    setUserName((name || "").trim());
  }

  async function handleResetOnboarding() {
    Alert.alert(
      "Reset onboarding",
      "This will take you back to the onboarding flow. Your preferences (niche, style, platform, name) will be reset.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("hasOnboarded");
            await AsyncStorage.removeItem("userNiche");
            await AsyncStorage.removeItem("userStyle");
            await AsyncStorage.removeItem("userPlatform");
            await AsyncStorage.removeItem("userName");
            router.replace("/onboarding");
          },
        },
      ]
    );
  }

  const accountLabel = isAuthenticated ? "Signed in" : "Sign in";
  const accountSubtitle = isAuthenticated
    ? (auth?.user?.email ? auth.user.email : "Sign out of your account")
    : "Sign in to sync across devices";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ paddingHorizontal: space.lg, paddingBottom: space.md }}>
        <Text
          style={[typography.heading1, { color: theme.text }]}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: space.xs,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space.lg }}>
          {/* Appearance */}
          <Section title="APPEARANCE">
            <Card padding="none" bordered>
              <View
                style={{
                  padding: space.md,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
                  <Palette color={theme.accent} size={24} />
                  <View>
                    <Text style={[typography.label, { color: theme.text }]}>
                      {isDark ? "Dark theme" : "Light theme"}
                    </Text>
                    <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xxs }]}>
                      Switch between themes
                    </Text>
                  </View>
                </View>
                <Switch
                  value={!isDark}
                  onValueChange={(value) => setTheme(!value)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.cardBg}
                  accessibilityLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
                />
              </View>
            </Card>
            <TouchableOpacity onPress={() => setShowColorThemeModal(true)} activeOpacity={0.8} style={{ marginTop: 1 }}>
              <Card padding="md" bordered>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={[typography.label, { color: theme.text }]}>
                    Color theme
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: (COLOR_THEMES[colorThemeId] || COLOR_THEMES.purple).primary,
                      }}
                    />
                    <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                      {(COLOR_THEMES[colorThemeId] || COLOR_THEMES.purple).name}
                    </Text>
                    <ChevronRight color={theme.textTertiary} size={20} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </Section>

          {/* Account */}
          {isReady && (
            <Section title="ACCOUNT">
              <TouchableOpacity
                onPress={isAuthenticated ? signOut : () => openAuth({ mode: "signup" })}
                activeOpacity={0.8}
              >
                <Card padding="md" bordered>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: space.sm,
                    }}
                  >
                    {isAuthenticated ? (
                      <LogOut color={theme.text} size={24} />
                    ) : (
                      <LogIn color={theme.primary} size={24} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.label, { color: theme.text }]}>
                        {accountLabel}
                      </Text>
                      <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xxs }]}>
                        {accountSubtitle}
                      </Text>
                    </View>
                    <ChevronRight color={theme.textTertiary} size={20} />
                  </View>
                </Card>
              </TouchableOpacity>
            </Section>
          )}

          {/* Subscription — FastCaption Pro */}
          <Section title="SUBSCRIPTION">
            <TouchableOpacity
              onPress={async () => {
                if (isPro) {
                  await presentCustomerCenter();
                } else {
                  const result = await presentPaywall();
                  const success = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
                  if (success) showToast("Welcome to FastCaption Pro!");
                }
              }}
              activeOpacity={0.8}
              disabled={subscriptionLoading}
            >
              <Card padding="md" bordered>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: space.sm,
                  }}
                >
                  <Crown color={isPro ? "#FFD700" : theme.textSecondary} size={24} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.label, { color: theme.text }]}>
                      {isPro ? "FastCaption Pro" : "Upgrade to FastCaption Pro"}
                    </Text>
                    <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xxs }]}>
                      {isPro
                        ? "Manage subscription & billing"
                        : "Monthly or yearly — unlimited scripts & premium features"}
                    </Text>
                  </View>
                  <ChevronRight color={theme.textTertiary} size={20} />
                </View>
              </Card>
            </TouchableOpacity>
          </Section>

          {/* Preferences */}
          <Section title="PREFERENCES">
            <Card padding="none" bordered>
              <View
                style={{
                  padding: space.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
              >
                <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: space.xxs }]}>
                  Niche
                </Text>
                <Text style={[typography.body, { color: theme.text, textTransform: "capitalize" }]}>
                  {niche}
                </Text>
              </View>
              <View
                style={{
                  padding: space.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
              >
                <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: space.xxs }]}>
                  Style
                </Text>
                <Text style={[typography.body, { color: theme.text, textTransform: "capitalize" }]}>
                  {style}
                </Text>
              </View>
              <View
                style={{
                  padding: space.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
              >
                <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: space.xxs }]}>
                  Platform
                </Text>
                <Text style={[typography.body, { color: theme.text }]}>
                  {platform}
                </Text>
              </View>
              <View style={{ padding: space.md }}>
                <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: space.xxs }]}>
                  Name
                </Text>
                <Text style={[typography.body, { color: theme.text }]}>
                  {userName || "Not set"}
                </Text>
              </View>
            </Card>
            <TouchableOpacity
              onPress={openEditPreferences}
              style={{ marginTop: space.xs }}
              activeOpacity={0.8}
            >
              <Text style={[typography.bodySmall, { fontWeight: "600", color: theme.primary }]}>
                Change preferences
              </Text>
            </TouchableOpacity>
            <Button
              onPress={handleResetOnboarding}
              variant="ghost"
              label="Reset onboarding"
              size="sm"
              style={{ marginTop: space.sm }}
              accessibilityLabel="Reset onboarding and start over"
            />
          </Section>

          {/* Developer (dev only) */}
          {__DEV__ && (
            <Section title="DEVELOPER">
              <TouchableOpacity
                onPress={async () => {
                  await logRevenueCatDiagnostics();
                  showToast("RevenueCat diagnostics logged — check Metro/console");
                }}
                activeOpacity={0.8}
              >
                <Card padding="md" bordered>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
                      <Text style={[typography.label, { color: theme.primary, flex: 1 }]}>
                        Log RevenueCat diagnostics
                      </Text>
                      <ChevronRight color={theme.textTertiary} size={20} />
                    </View>
                    <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xxs }]}>
                      Dump offerings, customerInfo, store products to console
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </Section>
          )}

          {/* About */}
          <Section title="ABOUT">
            <Card padding="none" bordered>
              <TouchableOpacity
                onPress={() => RATE_URL.startsWith("http") && WebBrowser.openBrowserAsync(RATE_URL)}
                style={{
                  padding: space.md,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.sm,
                }}
                activeOpacity={0.8}
                disabled={!RATE_URL.startsWith("http")}
              >
                <Star color={theme.accent} size={20} />
                <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
                  Rate us
                </Text>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginHorizontal: space.md,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (FEEDBACK_URL.startsWith("http")) {
                    WebBrowser.openBrowserAsync(FEEDBACK_URL);
                  } else if (FEEDBACK_URL.startsWith("mailto:")) {
                    WebBrowser.openBrowserAsync(FEEDBACK_URL);
                  }
                }}
                style={{
                  padding: space.md,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.sm,
                }}
                activeOpacity={0.8}
              >
                <MessageCircle color={theme.accent} size={20} />
                <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
                  Feedback
                </Text>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginHorizontal: space.md,
                }}
              />
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}
                style={{
                  padding: space.md,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
              >
                <Text style={[typography.body, { color: theme.text }]}>
                  Terms of Service
                </Text>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginHorizontal: space.md,
                }}
              />
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}
                style={{
                  padding: space.md,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                activeOpacity={0.8}
              >
                <Text style={[typography.body, { color: theme.text }]}>
                  Privacy Policy
                </Text>
                <ChevronRight color={theme.textTertiary} size={20} />
              </TouchableOpacity>
            </Card>
            <Text
              style={[
                typography.caption,
                { color: theme.textTertiary, marginTop: space.sm },
              ]}
            >
              Version {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </Section>
        </View>
      </ScrollView>

      {/* Preferences modal */}
      <Modal
        visible={showEditPreferences}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditPreferences(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setShowEditPreferences(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              padding: space.lg,
              paddingBottom: insets.bottom + space.lg,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: space.lg,
              }}
            >
              <Text style={[typography.heading3, { color: theme.text }]}>
                Change preferences
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditPreferences(false)}
                style={{ padding: space.xs }}
              >
                <Text style={[typography.body, { fontWeight: "600", color: theme.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <Text style={[typography.label, { color: theme.text, marginBottom: space.sm }]}>
                Niche
              </Text>
              <View style={{ gap: space.xs, marginBottom: space.lg }}>
                {NICHES.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => setEditNiche(n.id)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: editNiche === n.id ? theme.primary : theme.cardBg,
                      padding: space.md,
                      borderRadius: radius.md,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: space.sm,
                      borderWidth: 1,
                      borderColor: editNiche === n.id ? theme.primary : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{n.emoji}</Text>
                    <Text
                      style={[
                        typography.label,
                        {
                          color: editNiche === n.id ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {n.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[typography.label, { color: theme.text, marginBottom: space.sm }]}>
                Style
              </Text>
              <View style={{ gap: space.xs, marginBottom: space.lg }}>
                {STYLES.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setEditStyle(s.id)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: editStyle === s.id ? theme.primary : theme.cardBg,
                      padding: space.md,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: editStyle === s.id ? theme.primary : theme.border,
                    }}
                  >
                    <Text
                      style={[
                        typography.label,
                        {
                          color: editStyle === s.id ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {s.label}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        {
                          color:
                            editStyle === s.id
                              ? theme.primaryText
                              : theme.textSecondary,
                          marginTop: space.xxs,
                        },
                      ]}
                    >
                      {s.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Button
              onPress={saveEditPreferences}
              variant="primary"
              label="Save"
              fullWidth
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Color theme picker modal */}
      <Modal visible={showColorThemeModal} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: space.lg }} onPress={() => setShowColorThemeModal(false)}>
          <Pressable style={{ backgroundColor: theme.surfaceElevated, borderRadius: radius.xl, padding: space.xl, borderWidth: 1, borderColor: theme.border }} onPress={(e) => e.stopPropagation()}>
            <Text style={[typography.heading3, { color: theme.text, marginBottom: space.lg }]}>Color theme</Text>
            <View style={{ gap: space.sm }}>
              {Object.values(COLOR_THEMES).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={async () => {
                    await setColorTheme(c.id);
                    setShowColorThemeModal(false);
                  }}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: space.md,
                    borderRadius: radius.md,
                    backgroundColor: colorThemeId === c.id ? theme.primary : theme.surface,
                    borderWidth: 2,
                    borderColor: colorThemeId === c.id ? theme.primary : theme.border,
                  }}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary, marginRight: space.sm }} />
                  <Text style={[typography.label, { color: colorThemeId === c.id ? theme.primaryText : theme.text }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Pressable onPress={() => setShowColorThemeModal(false)} style={{ marginTop: space.lg, alignItems: "center" }}>
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
