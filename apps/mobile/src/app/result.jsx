import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Copy, Save, Heart, Bookmark } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeStore";
import { useFavorites } from "@/utils/favoritesStore";
import { usePresets } from "@/utils/presetsStore";
import { remixHook, isValidScriptData } from "@/utils/api";

const REMIX_STYLES = [
  { id: "controversial", label: "More controversial", emoji: "🔥" },
  { id: "shorter", label: "Shorter", emoji: "✂️" },
  { id: "emotional", label: "More emotional", emoji: "💔" },
  { id: "premium", label: "More premium", emoji: "💎" },
  { id: "curiosity", label: "More curiosity", emoji: "🤔" },
  { id: "lessSalesy", label: "Less salesy", emoji: "🤝" },
];

export default function Result() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { addFavorite, isFavorite } = useFavorites();
  const { savePreset } = usePresets();

  const [scriptData, setScriptData] = useState(null);
  const [parseError, setParseError] = useState(false);
  const [selectedHook, setSelectedHook] = useState(0);
  const [saving, setSaving] = useState(false);
  const [remixing, setRemixing] = useState(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    try {
      const raw = params.scriptData ? JSON.parse(params.scriptData) : null;
      if (!raw || !isValidScriptData(raw)) {
        setParseError(true);
        return;
      }
      setScriptData(raw);
      setSelectedHook(0);
    } catch {
      setParseError(true);
    }
  }, [params.scriptData]);

  const copyToClipboard = useCallback(async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", `${label} copied to clipboard`);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const existing = await AsyncStorage.getItem("savedScripts");
      const scripts = existing ? JSON.parse(existing) : [];

      const newScript = {
        id: Date.now().toString(),
        topic: scriptData.topic,
        data: scriptData,
        createdAt: new Date().toISOString(),
      };

      scripts.unshift(newScript);
      await AsyncStorage.setItem("savedScripts", JSON.stringify(scripts));

      Alert.alert("Saved!", "Script saved to your library");
    } catch (error) {
      console.error("Failed to save:", error);
      Alert.alert("Error", "Failed to save script");
    } finally {
      setSaving(false);
    }
  }, [scriptData]);

  const handleFavoriteHook = useCallback(async () => {
    if (!scriptData || scriptData.hooks.length === 0) return;
    const hook = scriptData.hooks[Math.min(selectedHook, scriptData.hooks.length - 1)];
    if (!isFavorite(hook)) {
      await addFavorite(hook, scriptData.topic);
      Alert.alert("Saved!", "Hook added to favorites");
    } else {
      Alert.alert("Already saved", "This hook is already in your favorites");
    }
  }, [scriptData, selectedHook, addFavorite, isFavorite]);

  const handleRemixHook = useCallback(
    async (style) => {
      if (!scriptData || scriptData.hooks.length === 0) return;
      const hookIndex = Math.min(selectedHook, scriptData.hooks.length - 1);
      setRemixing(style);
      try {
        const data = await remixHook({
          hook: scriptData.hooks[hookIndex],
          style,
          topic: scriptData.topic,
        });
        setScriptData((prev) => ({
          ...prev,
          hooks: prev.hooks.map((h, i) => (i === hookIndex ? data.hook : h)),
        }));
        Alert.alert("Remixed!", "Your hook has been remixed");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to remix hook");
      } finally {
        setRemixing(null);
      }
    },
    [scriptData, selectedHook],
  );

  const handleSavePreset = useCallback(async () => {
    if (!presetName.trim()) return;

    const userNiche = await AsyncStorage.getItem("userNiche");
    const userStyle = await AsyncStorage.getItem("userStyle");

    await savePreset({
      name: presetName,
      topic: scriptData.topic,
      niche: userNiche,
      style: userStyle,
    });

    setShowPresetModal(false);
    setPresetName("");
    Alert.alert("Saved!", "Brand preset created");
  }, [presetName, scriptData, savePreset]);

  if (parseError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={{ fontSize: 18, color: theme.text, textAlign: "center", marginBottom: 16 }}>
          Invalid or missing script data
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: theme.primaryText }}>Go home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!scriptData) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const safeHookIndex =
    scriptData.hooks.length > 0 ? Math.min(selectedHook, scriptData.hooks.length - 1) : null;
  const currentHook = safeHookIndex !== null ? scriptData.hooks[safeHookIndex] : null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowPresetModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: theme.cardBg,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Bookmark color={theme.text} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: theme.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Save color={theme.primaryText} size={18} />
            <Text
              style={{
                color: theme.primaryText,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPresetModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: theme.cardBg,
              padding: 24,
              borderRadius: 16,
              width: "80%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 16,
              }}
            >
              Save as Brand Preset
            </Text>
            <TextInput
              value={presetName}
              onChangeText={setPresetName}
              placeholder="e.g., Fitness Morning Routine"
              placeholderTextColor={theme.textTertiary}
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowPresetModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: theme.background,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSavePreset}
                disabled={!presetName.trim()}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: presetName.trim()
                    ? theme.primary
                    : theme.backgroundSecondary,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: presetName.trim()
                      ? theme.primaryText
                      : theme.textTertiary,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 24 }}>
          {/* Hooks */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
              >
                Hooks
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {scriptData.hooks.length > 0 && (
                  <>
                    <TouchableOpacity
                      onPress={handleFavoriteHook}
                      style={{ padding: 8 }}
                    >
                      <Heart
                        color={
                          currentHook && isFavorite(currentHook)
                            ? theme.accent
                            : theme.textSecondary
                        }
                        fill={
                          currentHook && isFavorite(currentHook)
                            ? theme.accent
                            : "none"
                        }
                        size={18}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        currentHook && copyToClipboard(currentHook, "Hook")
                      }
                      style={{ padding: 8 }}
                    >
                      <Copy color={theme.textSecondary} size={18} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {scriptData.hooks.length === 0 ? (
              <View
                style={{
                  backgroundColor: theme.cardBg,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  No hooks
                </Text>
              </View>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 12 }}
                >
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {scriptData.hooks.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedHook(index)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor:
                            selectedHook === index ? theme.primary : theme.cardBg,
                          borderWidth: 1,
                          borderColor:
                            selectedHook === index ? theme.primary : theme.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              selectedHook === index
                                ? theme.primaryText
                                : theme.textSecondary,
                          }}
                        >
                          {index + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View
                  style={{
                    backgroundColor: theme.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}>
                    {currentHook ?? ""}
                  </Text>
                </View>
              </>
            )}

            {/* Remix Buttons - only when there are hooks */}
            {scriptData.hooks.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.textSecondary,
                    marginBottom: 10,
                  }}
                >
                  Remix this hook:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {REMIX_STYLES.map((style) => (
                      <TouchableOpacity
                        key={style.id}
                        onPress={() => handleRemixHook(style.id)}
                        disabled={remixing !== null}
                        style={{
                          backgroundColor: theme.cardBg,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        {remixing === style.id ? (
                          <ActivityIndicator size="small" color={theme.text} />
                        ) : (
                          <>
                            <Text style={{ fontSize: 14 }}>{style.emoji}</Text>
                            <Text style={{ fontSize: 13, color: theme.text }}>
                              {style.label}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Script */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
              >
                Script
              </Text>
              {scriptData.script.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    copyToClipboard(
                      scriptData.script.map((s) => s.text).join("\n\n"),
                      "Script",
                    )
                  }
                  style={{ padding: 8 }}
                >
                  <Copy color={theme.textSecondary} size={18} />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ gap: 12 }}>
              {scriptData.script.length === 0 ? (
                <View
                  style={{
                    backgroundColor: theme.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                    No script
                  </Text>
                </View>
              ) : (
              scriptData.script.map((scene, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Scene {index + 1}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}
                  >
                    {scene.text}
                  </Text>
                  {scene.onScreenText && (
                    <View
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        On-screen:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.accent,
                          fontWeight: "600",
                        }}
                      >
                        {scene.onScreenText}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
            </View>
          </View>

          {/* B-roll */}
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 12,
              }}
            >
              B-roll Ideas
            </Text>
            <View
              style={{
                backgroundColor: theme.cardBg,
                padding: 16,
                borderRadius: 12,
                gap: 8,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {scriptData.broll.map((item, index) => (
                <Text
                  key={index}
                  style={{ fontSize: 14, color: theme.text, lineHeight: 20 }}
                >
                  • {item}
                </Text>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
              >
                Call to Action
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(scriptData.cta, "CTA")}
                style={{ padding: 8 }}
              >
                <Copy color={theme.textSecondary} size={18} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: theme.cardBg,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}>
                {scriptData.cta}
              </Text>
            </View>
          </View>

          {/* Caption */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
              >
                Caption
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(scriptData.caption, "Caption")}
                style={{ padding: 8 }}
              >
                <Copy color={theme.textSecondary} size={18} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: theme.cardBg,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 14, color: theme.text, lineHeight: 22 }}>
                {scriptData.caption}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
