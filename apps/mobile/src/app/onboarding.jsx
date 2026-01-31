import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeStore";
import { NICHES, STYLES } from "@/constants/onboarding";

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark, loadTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);

  useEffect(() => {
    loadTheme();
  }, []);

  async function handleComplete() {
    await AsyncStorage.setItem("hasOnboarded", "true");
    await AsyncStorage.setItem("userNiche", selectedNiche);
    await AsyncStorage.setItem("userStyle", selectedStyle);
    router.replace("/(tabs)");
  }

  async function handleSkip() {
    await AsyncStorage.setItem("hasOnboarded", "true");
    await AsyncStorage.setItem("userNiche", "");
    await AsyncStorage.setItem("userStyle", "");
    router.replace("/(tabs)");
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 40,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              What's your niche?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 32,
              }}
            >
              We'll tailor scripts to your content style
            </Text>

            <View style={{ gap: 12 }}>
              {NICHES.map((niche) => (
                <TouchableOpacity
                  key={niche.id}
                  onPress={() => setSelectedNiche(niche.id)}
                  style={{
                    backgroundColor:
                      selectedNiche === niche.id ? theme.primary : theme.cardBg,
                    padding: 20,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    borderWidth: 1,
                    borderColor:
                      selectedNiche === niche.id ? theme.primary : theme.border,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{niche.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color:
                        selectedNiche === niche.id
                          ? theme.primaryText
                          : theme.text,
                    }}
                  >
                    {niche.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <TouchableOpacity
              onPress={() => {
                setStep(1);
                setSelectedStyle(null);
              }}
              style={{
                alignSelf: "flex-start",
                marginBottom: 24,
                paddingVertical: 8,
                paddingHorizontal: 0,
              }}
            >
              <Text style={{ fontSize: 16, color: theme.primary }}>
                ← Change niche
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Pick your style
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 32,
              }}
            >
              How do you want to sound?
            </Text>

            <View style={{ gap: 12 }}>
              {STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  onPress={() => setSelectedStyle(style.id)}
                  style={{
                    backgroundColor:
                      selectedStyle === style.id ? theme.primary : theme.cardBg,
                    padding: 20,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor:
                      selectedStyle === style.id ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color:
                        selectedStyle === style.id
                          ? theme.primaryText
                          : theme.text,
                      marginBottom: 4,
                    }}
                  >
                    {style.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color:
                        selectedStyle === style.id
                          ? theme.primaryText
                          : theme.textSecondary,
                      opacity: selectedStyle === style.id ? 0.8 : 1,
                    }}
                  >
                    {style.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
          paddingBottom: insets.bottom + 24,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        {step === 1 && (
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              marginBottom: 12,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: theme.textTertiary }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            if (step === 1 && selectedNiche) {
              setStep(2);
            } else if (step === 2 && selectedStyle) {
              handleComplete();
            }
          }}
          disabled={
            (step === 1 && !selectedNiche) || (step === 2 && !selectedStyle)
          }
          style={{
            backgroundColor:
              (step === 1 && selectedNiche) || (step === 2 && selectedStyle)
                ? theme.primary
                : theme.backgroundSecondary,
            padding: 18,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color:
                (step === 1 && selectedNiche) || (step === 2 && selectedStyle)
                  ? theme.primaryText
                  : theme.textTertiary,
            }}
          >
            {step === 1 ? "Continue" : "Get Started"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
