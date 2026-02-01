import { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Pressable, ScrollView, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Sparkles, BookmarkPlus, LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeStore";
import { usePresets } from "@/utils/presetsStore";
import { useAuth } from "@/utils/auth/useAuth";
import { useAuthModal } from "@/utils/auth/store";
import { useSubscription } from "@/utils/purchases";
import { canGenerate, incrementGenerationCount, useTrialUsage, DAILY_LIMIT_TRIAL, TRIAL_DAYS } from "@/utils/trialUsageStore";
import { generateScript } from "@/utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { space, radius, typography, getShadow } from "@/constants/designTokens";
import { Button, Card, Input, Chip } from "@/components/ui";

const TOPIC_MAX_LENGTH = 500;

const SCRIPT_FORMATS = [
  { id: "mistakes", label: "3 Mistakes", emoji: "❌" },
  { id: "myth", label: "Myth vs Truth", emoji: "💡" },
  { id: "dothis", label: "Do This, Not That", emoji: "✅" },
  { id: "story", label: "Storytime", emoji: "📖" },
  { id: "pov", label: "POV Skit", emoji: "🎭" },
  { id: "beforeafter", label: "Before/After", emoji: "⚡" },
];

const TRY_TOPICS = [
  "5 morning habits that changed my life",
  "Why I quit my 9-5",
  "Skincare routine that actually works",
  "How I built a side hustle",
];

export default function Generate() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { presets, loadPresets } = usePresets();
  const { isAuthenticated, isReady, auth } = useAuth();
  const { open: openAuth } = useAuthModal();
  const { isPro, presentPaywall } = useSubscription();
  const jwt = auth?.jwt ?? null;
  const { remainingToday, usedToday, withinTrial, refresh: refreshTrial } = useTrialUsage(isPro, jwt);
  const topicInputRef = useRef(null);

  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [format, setFormat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [userName, setUserName] = useState("");

  // Reset sign-in modal when user signs in
  useEffect(() => {
    if (isAuthenticated) setShowSignInModal(false);
  }, [isAuthenticated]);

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("userName").then((name) => {
      const trimmed = (name || "").trim();
      if (trimmed) setUserName(trimmed.split(/\s/)[0]);
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!isAuthenticated) {
      setShowSignInModal(true);
      return;
    }
    const trimmed = topic.trim();
    if (!trimmed) return;

    const { allowed } = await canGenerate(isPro, jwt);
    if (!allowed) {
      presentPaywall();
      return;
    }

    if (trimmed.length > TOPIC_MAX_LENGTH) {
      Alert.alert(
        "Topic too long",
        `Please keep your topic under ${TOPIC_MAX_LENGTH} characters (currently ${trimmed.length}).`
      );
      return;
    }

    setLoading(true);
    try {
      const data = await generateScript({
        topic: trimmed,
        duration: parseInt(duration, 10),
        format: format || "general",
      });
      await incrementGenerationCount(jwt);
      refreshTrial();
      router.push({
        pathname: "/result",
        params: { scriptData: JSON.stringify(data) },
      });
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Generate failed",
        error?.message || "Couldn't generate script. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [topic, duration, format, router, isAuthenticated, isPro, jwt, presentPaywall, refreshTrial]);

  const applyPreset = (preset) => {
    setTopic(preset.topic || "");
    setFormat(preset.format || null);
    setShowPresets(false);
  };

  const showSignInOverlay = showSignInModal && !isAuthenticated;

  const handleInteractionRequiringAuth = useCallback(() => {
    if (isReady && !isAuthenticated) {
      topicInputRef.current?.blur?.();
      setShowSignInModal(true);
    }
  }, [isReady, isAuthenticated]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: space.lg,
          paddingBottom: 64,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: display headline + subhead + optional gradient strip */}
        <View style={{ marginBottom: space.xl }}>
          {/* Thin gradient strip (full-width anchor) */}
          <View style={{ marginLeft: -space.lg, marginRight: -space.lg, marginBottom: space.md, height: 4, overflow: "hidden" }}>
            <LinearGradient
              colors={[theme.primaryGradientStart ?? "#8B5CF6", theme.primaryGradientEnd ?? "#A78BFA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </View>
          {userName ? (
            <Text
              style={[typography.subhead, { color: theme.textSecondary, marginBottom: space.xxs }]}
              accessibilityLabel={`Welcome ${userName}`}
            >
              Hey {userName},
            </Text>
          ) : null}
          <Text
            style={[
              typography.display,
              { color: theme.text, marginBottom: space.xs },
            ]}
            accessibilityRole="header"
            accessibilityLabel="Create your script"
          >
            Create your script
          </Text>
          <Text style={[typography.subhead, { color: theme.textSecondary }]}>
            Viral-ready scripts in seconds
          </Text>
          {isPro ? (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xs }]}>
              Unlimited generations with Pro
            </Text>
          ) : withinTrial ? (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xs }]}>
              {remainingToday} of {DAILY_LIMIT_TRIAL} free generations today · {TRIAL_DAYS}-day trial
            </Text>
          ) : (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: space.xs }]}>
              Free trial ended — upgrade to Pro for unlimited generations
            </Text>
          )}
        </View>

        {/* Try these topic suggestions */}
        <View style={{ marginBottom: space.lg }}>
          <Text
            style={[
              typography.label,
              { color: theme.textSecondary, marginBottom: space.xs },
            ]}
          >
            Try these
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: space.xs, flexWrap: "nowrap" }}>
              {TRY_TOPICS.map((t) => (
                <Chip
                  key={t}
                  label={t.length > 28 ? t.slice(0, 26) + "…" : t}
                  selected={topic.trim() === t}
                  onPress={() => setTopic(t)}
                  accessibilityLabel={`Use topic: ${t}`}
                  accessibilityRole="button"
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {presets.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowPresets(!showPresets)}
            activeOpacity={0.8}
            style={{ marginBottom: space.lg }}
            accessibilityRole="button"
            accessibilityLabel={`Use brand preset. ${presets.length} preset${presets.length === 1 ? "" : "s"} available.`}
            accessibilityState={{ expanded: showPresets }}
          >
            <Card padding="md" bordered>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs }}>
                <BookmarkPlus color={theme.accent} size={20} />
                <Text style={[typography.label, { color: theme.text }]}>
                  Use Brand Preset ({presets.length})
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {showPresets && (
          <View style={{ marginBottom: space.lg, gap: space.xs }}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => applyPreset(preset)}
                activeOpacity={0.8}
              >
                <Card padding="sm" bordered style={{ backgroundColor: theme.surface }}>
                  <Text style={[typography.label, { color: theme.text }]}>
                    {preset.name}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: theme.textSecondary, marginTop: space.xxs },
                    ]}
                  >
                    {preset.niche} • {preset.style}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ gap: space.lg }}>
          {/* Script Format */}
          <View>
            <Text
              style={[
                typography.label,
                { color: theme.textSecondary, marginBottom: space.xs },
              ]}
            >
              Script Format
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: space.xs }}>
                {SCRIPT_FORMATS.map((fmt) => (
                  <Chip
                    key={fmt.id}
                    label={fmt.label}
                    leftIcon={<Text style={{ fontSize: 16 }}>{fmt.emoji}</Text>}
                    selected={format === fmt.id}
                    onPress={() => setFormat(fmt.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Script format: ${fmt.label}. ${format === fmt.id ? "Selected" : "Not selected"}`}
                    accessibilityState={{ selected: format === fmt.id }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Topic */}
          <Input
            ref={topicInputRef}
            label="What's your video about?"
            value={topic}
            onChangeText={setTopic}
            onFocus={handleInteractionRequiringAuth}
            placeholder="e.g., 5 morning habits that changed my life"
            multiline
            maxLength={TOPIC_MAX_LENGTH}
            editable={isAuthenticated}
            accessibilityLabel="Topic for your video"
            accessibilityHint={isAuthenticated ? "Enter what your video is about" : "Sign in to enter a topic"}
          />

          {/* Duration */}
          <View>
            <Text
              style={[
                typography.label,
                { color: theme.textSecondary, marginBottom: space.xs },
              ]}
            >
              Duration
            </Text>
            <View style={{ flexDirection: "row", gap: space.sm }}>
              {["30", "60"].map((dur) => (
                <Chip
                  key={dur}
                  label={`${dur}s`}
                  selected={duration === dur}
                  onPress={() => setDuration(dur)}
                  style={{ flex: 1, justifyContent: "center" }}
                  accessibilityRole="button"
                  accessibilityLabel={`Duration ${dur} seconds. ${duration === dur ? "Selected" : "Not selected"}`}
                  accessibilityState={{ selected: duration === dur }}
                />
              ))}
            </View>
          </View>

          <Button
            onPress={handleGenerate}
            disabled={!topic.trim()}
            loading={loading}
            variant="primary"
            label={loading ? "Generating…" : "Generate Script"}
            icon={Sparkles}
            fullWidth
            style={{ marginTop: space.md }}
            accessibilityLabel={loading ? "Generating script" : "Generate script"}
            accessibilityState={{ disabled: !topic.trim(), busy: loading }}
          />
        </View>
      </ScrollView>

      {/* When not signed in, any tap on the page (input, button, or anywhere) shows the sign-in modal */}
      {isReady && !isAuthenticated && (
        <Pressable
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
          onPress={() => setShowSignInModal(true)}
          accessibilityLabel="Sign in required to create scripts"
          accessibilityRole="button"
          accessibilityHint="Tap to open sign in options"
        />
      )}

      {/* Sign-in popup: shown when user tries to interact without being signed in */}
      <Modal
        visible={showSignInOverlay}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            padding: space.lg,
          }}
        >
          <View
            style={{
              backgroundColor: theme.surfaceElevated,
              borderRadius: radius.xl,
              padding: space.xl,
              width: "100%",
              maxWidth: 340,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.border,
              ...getShadow(isDark, "lg"),
            }}
          >
            <LogIn color={theme.primary} size={44} style={{ marginBottom: space.lg }} />
            <Text
              style={[
                typography.heading3,
                { color: theme.text, textAlign: "center", marginBottom: space.xs },
              ]}
            >
              Sign in to create scripts
            </Text>
            <Text
              style={[
                typography.bodySmall,
                {
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginBottom: space.lg,
                  lineHeight: 22,
                },
              ]}
            >
              Sign in once to save and sync your scripts across devices.
            </Text>
            <Button
              onPress={() => {
                setShowSignInModal(false);
                setTimeout(() => openAuth({ mode: "signup" }), 300);
              }}
              variant="primary"
              label="Sign in or sign up"
              icon={LogIn}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
