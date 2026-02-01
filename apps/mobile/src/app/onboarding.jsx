import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Check } from "lucide-react-native";
import { useTheme, COLOR_THEMES, buildLightTheme } from "@/utils/themeStore";
import { NICHES, STYLES, PLATFORMS, INTRO_SLIDES } from "@/constants/onboarding";
import { space, radius, typography } from "@/constants/designTokens";
import { LOTTIE_EMPTY_STATE } from "@/constants/lottie";
import { Button, LottieView, Input } from "@/components/ui";
import { OnboardingIllustration } from "@/components/onboarding/OnboardingIllustration";
import { ConfettiOverlay } from "@/components/onboarding/ConfettiOverlay";

const INTRO_SLIDE_COUNT = INTRO_SLIDES.length;
const PROFILE_STEPS = 3;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THEME_CARD_SIZE = (SCREEN_WIDTH - space.lg * 2 - space.sm) / 2;

/** Minimal valid script for "See example script" preview */
const EXAMPLE_SCRIPT = {
  topic: "5 morning habits that changed my life",
  hooks: [
    "What if I told you that 5 simple habits added 2 hours of focus to my day—and they take less than 20 minutes?",
  ],
  script: [
    { text: "Hook: Ask the question and promise the payoff.", onScreenText: "5 habits, 20 mins" },
    { text: "Habit 1: Wake at the same time. Your body loves rhythm.", onScreenText: "Same wake time" },
    { text: "Habit 2: No phone for the first 30 minutes. Protect your attention.", onScreenText: "No phone 30 min" },
    { text: "Habit 3: Move for 10 minutes. Walk, stretch, or light exercise.", onScreenText: "Move 10 min" },
    { text: "Habit 4: One priority for the day. Write it down.", onScreenText: "One priority" },
    { text: "Habit 5: Review and close the loop before bed.", onScreenText: "Review at night" },
  ],
  broll: ["Alarm clock", "Phone face-down", "Morning walk", "Notebook", "Evening wind-down"],
  cta: "Pick one habit and try it for 7 days. Drop a comment with which one you're trying.",
  caption: "5 morning habits that changed my life 🧵 Save this and try one habit for 7 days.",
};

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, loadTheme, setColorTheme, colorThemeId } = useTheme();
  const [phase, setPhase] = useState("theme");
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  // Use light theme for theme picker + intro so it matches reference screens (clean, light)
  const effectiveTheme =
    phase === "theme" || phase === "intro"
      ? buildLightTheme(selectedThemeId || colorThemeId || "purple")
      : theme;
  const [introStep, setIntroStep] = useState(0);
  const [step, setStep] = useState(1);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [userName, setUserName] = useState("");
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function handleComplete() {
    await AsyncStorage.setItem("hasOnboarded", "true");
    await AsyncStorage.setItem("userNiche", selectedNiche ?? "");
    await AsyncStorage.setItem("userStyle", selectedStyle ?? "");
    await AsyncStorage.setItem("userPlatform", selectedPlatform ?? "");
    await AsyncStorage.setItem("userName", (userName ?? "").trim());
    router.replace("/(tabs)");
  }

  async function handleSkip() {
    await AsyncStorage.setItem("hasOnboarded", "true");
    await AsyncStorage.setItem("userNiche", "");
    await AsyncStorage.setItem("userStyle", "");
    await AsyncStorage.setItem("userPlatform", "");
    await AsyncStorage.setItem("userName", "");
    router.replace("/(tabs)");
  }

  async function handleThemeSelect(id) {
    setSelectedThemeId(id);
    await setColorTheme(id);
  }

  const goToIntro = () => setPhase("intro");
  const goToProfile = () => {
    setPhase("profile");
    setStep(1);
  };

  const canContinueProfile =
    (step === 1 && selectedNiche) ||
    (step === 2 && selectedStyle) ||
    (step === 3 && selectedPlatform);

  const currentIntroSlide = INTRO_SLIDES[introStep];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* ----- PHASE: Theme picker ----- */}
      {phase === "theme" && (
        <>
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400 }}
            style={{ paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.lg }}
          >
            <Text
              style={[
                typography.display,
                { color: effectiveTheme.text, marginBottom: space.xs, fontSize: 28 },
              ]}
            >
              Pick your style
            </Text>
            <Text style={[typography.subhead, { color: effectiveTheme.textSecondary, lineHeight: 22 }]}>
              Choose a color theme. You can change it later in Settings.
            </Text>
          </MotiView>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: space.lg,
              paddingBottom: insets.bottom + 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
              {Object.values(COLOR_THEMES).map((c, index) => (
                <MotiView
                  key={c.id}
                  from={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 350, delay: index * 80 }}
                >
                  <TouchableOpacity
                    onPress={() => handleThemeSelect(c.id)}
                    activeOpacity={0.9}
                    style={{
                      width: THEME_CARD_SIZE,
                      height: THEME_CARD_SIZE,
                      borderRadius: radius.xl,
                      overflow: "hidden",
                      borderWidth: 3,
                      borderColor: selectedThemeId === c.id ? (c.primary) : "transparent",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    <LinearGradient
                      colors={[c.primaryGradientStart, c.primaryGradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        flex: 1,
                        padding: space.md,
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={[
                          typography.label,
                          { color: "#fff", fontSize: 16 },
                        ]}
                      >
                        {c.name}
                      </Text>
                      {selectedThemeId === c.id && (
                        <MotiView
                          from={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 12 }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: "rgba(255,255,255,0.3)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check color="#fff" size={18} strokeWidth={3} />
                        </MotiView>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </MotiView>
              ))}
            </View>
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: effectiveTheme.background }}>
            <View
              style={{
                paddingHorizontal: space.lg,
                paddingTop: space.lg,
                paddingBottom: space.xl,
                borderTopWidth: 1,
                borderTopColor: effectiveTheme.border,
                backgroundColor: effectiveTheme.background,
              }}
            >
              <Button
                onPress={goToIntro}
                disabled={!selectedThemeId}
                variant="primary"
                label="Continue"
                fullWidth
              />
            </View>
          </SafeAreaView>
        </>
      )}

      {/* ----- PHASE: Intro slides (storytelling + illustrations) ----- */}
      {phase === "intro" && (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: space.lg,
              paddingVertical: space.md,
            }}
          >
            <View
              style={{ flex: 1, marginRight: space.md }}
              onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
            >
              <View
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: effectiveTheme.border,
                  overflow: "hidden",
                }}
              >
                <MotiView
                  animate={{
                    width: progressBarWidth * ((introStep + 1) / INTRO_SLIDE_COUNT),
                  }}
                  transition={{ type: "timing", duration: 350 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: effectiveTheme.primary,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
            <Pressable onPress={handleSkip} hitSlop={12}>
              <Text style={[typography.bodySmall, { color: effectiveTheme.textSecondary }]}>Skip</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: space.lg,
              paddingTop: space.lg,
              paddingBottom: insets.bottom + 100,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <OnboardingIllustration
              slideId={currentIntroSlide.id}
              primary={effectiveTheme.primary}
              gradientStart={effectiveTheme.primaryGradientStart}
              gradientEnd={effectiveTheme.primaryGradientEnd}
            />
            <MotiView
              key={introStep}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400 }}
              style={{ width: "100%", alignItems: "center" }}
            >
              <Text
                style={[
                  typography.display,
                  { color: effectiveTheme.text, marginBottom: space.sm, textAlign: "center", fontSize: 26 },
                ]}
              >
                {currentIntroSlide.title}
              </Text>
              <Text
                style={[
                  typography.subhead,
                  { color: effectiveTheme.textSecondary, lineHeight: 24, textAlign: "center", paddingHorizontal: space.sm },
                ]}
              >
                {currentIntroSlide.subtitle}
              </Text>
            </MotiView>
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: effectiveTheme.background }}>
            <View
              style={{
                paddingHorizontal: space.lg,
                paddingTop: space.lg,
                paddingBottom: space.xl,
                borderTopWidth: 1,
                borderTopColor: effectiveTheme.border,
                backgroundColor: effectiveTheme.background,
              }}
            >
              <Button
                onPress={() => {
                  if (introStep < INTRO_SLIDE_COUNT - 1) setIntroStep(introStep + 1);
                  else goToProfile();
                }}
                variant="primary"
                label={introStep < INTRO_SLIDE_COUNT - 1 ? "Continue" : "Get started"}
                fullWidth
              />
            </View>
          </SafeAreaView>
        </>
      )}

      {/* ----- PHASE: Profile (Niche, Style, Platform + Name) ----- */}
      {phase === "profile" && (
        <>
          <View
            style={{
              paddingHorizontal: space.lg,
              paddingVertical: space.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.sm,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.border,
                  overflow: "hidden",
                }}
                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              >
                <MotiView
                  animate={{
                    width: progressBarWidth * (step / PROFILE_STEPS),
                  }}
                  transition={{ type: "timing", duration: 350 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: theme.primary,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={[typography.caption, { color: theme.textSecondary, minWidth: 56 }]}>
                Step {step} of {PROFILE_STEPS}
              </Text>
            </View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: space.lg,
              paddingTop: space.lg,
              paddingBottom: insets.bottom + 220,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && (
              <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 300 }}>
                <Text style={[typography.heading1, { color: theme.text, marginBottom: space.xs }]}>
                  What's your main content niche?
                </Text>
                <Text style={[typography.body, { color: theme.textSecondary, marginBottom: space.xl }]}>
                  We'll tailor every script to your content style so it sounds like you.
                </Text>
                <View style={{ gap: space.sm }}>
                  {NICHES.map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      onPress={() => setSelectedNiche(n.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: selectedNiche === n.id ? theme.primary : theme.surface,
                        padding: space.lg,
                        borderRadius: radius.lg,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: space.md,
                        borderWidth: 2,
                        borderColor: selectedNiche === n.id ? theme.primary : theme.border,
                        shadowColor: theme.shadowColor,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <Text style={{ fontSize: 28 }}>{n.emoji}</Text>
                      <Text style={[typography.heading3, { color: selectedNiche === n.id ? theme.primaryText : theme.text }]}>
                        {n.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </MotiView>
            )}

            {step === 2 && (
              <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 300 }}>
                <Pressable onPress={() => { setStep(1); setSelectedStyle(null); }} style={{ marginBottom: space.lg }} hitSlop={12}>
                  <Text style={[typography.body, { color: theme.primary, fontWeight: "600" }]}>← Back</Text>
                </Pressable>
                <Text style={[typography.heading1, { color: theme.text, marginBottom: space.xs }]}>
                  How do you want to sound?
                </Text>
                <Text style={[typography.body, { color: theme.textSecondary, marginBottom: space.xl }]}>
                  Pick the vibe that matches your content — we'll use it in every script.
                </Text>
                <View style={{ gap: space.sm }}>
                  {STYLES.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSelectedStyle(s.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: selectedStyle === s.id ? theme.primary : theme.surface,
                        padding: space.lg,
                        borderRadius: radius.lg,
                        borderWidth: 2,
                        borderColor: selectedStyle === s.id ? theme.primary : theme.border,
                        shadowColor: theme.shadowColor,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <Text style={[typography.heading3, { color: selectedStyle === s.id ? theme.primaryText : theme.text, marginBottom: space.xxs }]}>
                        {s.label}
                      </Text>
                      <Text style={[typography.bodySmall, { color: selectedStyle === s.id ? theme.primaryText : theme.textSecondary, opacity: selectedStyle === s.id ? 0.9 : 1 }]}>
                        {s.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </MotiView>
            )}

            {step === 3 && (
              <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 300 }}>
                <Pressable onPress={() => { setStep(2); setSelectedPlatform(null); }} style={{ marginBottom: space.lg }} hitSlop={12}>
                  <Text style={[typography.body, { color: theme.primary, fontWeight: "600" }]}>← Back</Text>
                </Pressable>
                <Text style={[typography.heading1, { color: theme.text, marginBottom: space.xs }]}>
                  Where do you create?
                </Text>
                <Text style={[typography.body, { color: theme.textSecondary, marginBottom: space.lg }]}>
                  We'll optimize script length and format for your main platform.
                </Text>
                <View style={{ gap: space.sm, marginBottom: space.xl }}>
                  {PLATFORMS.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelectedPlatform(p.id)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: selectedPlatform === p.id ? theme.primary : theme.surface,
                        padding: space.lg,
                        borderRadius: radius.lg,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: space.md,
                        borderWidth: 2,
                        borderColor: selectedPlatform === p.id ? theme.primary : theme.border,
                        shadowColor: theme.shadowColor,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{p.emoji}</Text>
                      <Text style={[typography.heading3, { color: selectedPlatform === p.id ? theme.primaryText : theme.text }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Input
                  label="What should we call you? (optional)"
                  placeholder="Your name"
                  value={userName}
                  onChangeText={setUserName}
                  accessibilityLabel="Your name for personalization"
                />
                <Text style={[typography.caption, { color: theme.textTertiary, marginTop: space.xs }]}>
                  We'll use this to personalize your experience.
                </Text>
              </MotiView>
            )}
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: theme.background }}>
            <View
              style={{
                paddingHorizontal: space.lg,
                paddingTop: space.lg,
                paddingBottom: space.xl,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                backgroundColor: theme.background,
              }}
            >
            {step === 1 && (
              <Pressable onPress={handleSkip} style={{ marginBottom: space.sm, alignItems: "center" }}>
                <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>Skip for now</Text>
              </Pressable>
            )}
            {step === 3 && (
              <View style={{ alignItems: "center", marginBottom: space.sm }}>
                <LottieView source={LOTTIE_EMPTY_STATE} width={56} height={56} loop autoPlay />
              </View>
            )}
            <Button
              onPress={() => {
                if (step === 1 && selectedNiche) setStep(2);
                else if (step === 2 && selectedStyle) setStep(3);
                else if (step === 3 && selectedPlatform) {
                  setShowConfetti(true);
                }
              }}
              disabled={!canContinueProfile}
              variant="primary"
              label={
                step === 3
                  ? (userName.trim() ? `You're all set, ${userName.trim().split(/\s/)[0]}!` : "Start creating")
                  : "Continue"
              }
              fullWidth
            />
            {step === 3 && (
              <Pressable
                onPress={() => router.push({ pathname: "/result", params: { scriptData: JSON.stringify(EXAMPLE_SCRIPT) } })}
                style={{ marginTop: space.sm, alignItems: "center" }}
              >
                <Text style={[typography.bodySmall, { color: theme.primary, fontWeight: "600" }]}>
                  See an example script first
                </Text>
              </Pressable>
            )}
            </View>
          </SafeAreaView>
          </KeyboardAvoidingView>
        </>
      )}
      {showConfetti && (
        <ConfettiOverlay
          onComplete={() => {
            setShowConfetti(false);
            void handleComplete();
          }}
        />
      )}
    </View>
  );
}
