import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Copy, Save, Heart, Bookmark, FileText, Sparkles, Share2 } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeStore";
import { useFavorites } from "@/utils/favoritesStore";
import { usePresets } from "@/utils/presetsStore";
import { useToastStore } from "@/utils/toastStore";
import { useResultNavigationStore } from "@/utils/resultNavigationStore";
import { remixHook, isValidScriptData } from "@/utils/api";
import { space, radius, typography } from "@/constants/designTokens";
import { Button, Card, Chip, Input, EmptyState } from "@/components/ui";

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
  const [collapsed, setCollapsed] = useState({ broll: false, cta: false, caption: false });

  useEffect(() => {
    try {
      // When opening from favorites, data may come from store (avoids URL length limits)
      const fromFavorite = params.from === "favorite";
      const getAndClearPending = useResultNavigationStore.getState().getAndClearPendingScriptData;
      let raw = fromFavorite ? getAndClearPending() : null;
      if (!raw && params.scriptData) {
        try {
          raw = JSON.parse(params.scriptData);
        } catch (_) {}
      }
      if (!raw || !isValidScriptData(raw)) {
        setParseError(true);
        return;
      }
      setScriptData(raw);
      setSelectedHook(0);
    } catch {
      setParseError(true);
    }
  }, [params.scriptData, params.from]);

  const showToast = useToastStore((s) => s.show);

  const shareScript = useCallback(() => {
    if (!scriptData) return;
    const parts = [
      scriptData.topic,
      "",
      ...(scriptData.hooks.length ? ["Hooks:", ...scriptData.hooks, ""] : []),
      ...(scriptData.script.length
        ? ["Script:", ...scriptData.script.map((s) => s.text), ""]
        : []),
      scriptData.broll.length ? ["B-roll:", ...scriptData.broll, ""] : [],
      scriptData.cta ? ["CTA:", scriptData.cta, ""] : [],
      scriptData.caption ? ["Caption:", scriptData.caption] : [],
    ].flat();
    const message = parts.join("\n");
    Share.share({
      message,
      title: scriptData.topic,
    }).catch(() => {});
  }, [scriptData]);

  const copyToClipboard = useCallback(
    async (text) => {
      await Clipboard.setStringAsync(text);
      showToast("Copied!");
    },
    [showToast]
  );

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
      showToast("Saved!");
    } catch (error) {
      console.error("Failed to save:", error);
      Alert.alert("Error", "Failed to save script");
    } finally {
      setSaving(false);
    }
  }, [scriptData, showToast]);

  const handleFavoriteHook = useCallback(async () => {
    if (!scriptData || scriptData.hooks.length === 0) return;
    const hook = scriptData.hooks[Math.min(selectedHook, scriptData.hooks.length - 1)];
    if (!isFavorite(hook)) {
      await addFavorite(hook, scriptData.topic);
      showToast("Hook added to favorites");
    } else {
      showToast("Already in favorites");
    }
  }, [scriptData, selectedHook, addFavorite, isFavorite, showToast]);

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
        showToast("Remixed!");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to remix hook");
      } finally {
        setRemixing(null);
      }
    },
    [scriptData, selectedHook, showToast],
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
    showToast("Brand preset created");
  }, [presetName, scriptData, savePreset, showToast]);

  if (parseError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <EmptyState
          icon={FileText}
          title="Invalid or missing script data"
          description="Something went wrong loading this script."
          actionLabel="Back to Generate"
          onAction={() => router.replace("/(tabs)")}
        />
      </View>
    );
  }

  if (!scriptData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const toggleCollapsed = (key) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: space.xs }}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: space.xs, alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setShowPresetModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: theme.cardBg,
              paddingHorizontal: space.sm,
              paddingVertical: space.xs,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            accessibilityLabel="Save as brand preset"
            accessibilityRole="button"
          >
            <Bookmark color={theme.text} size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={shareScript}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: theme.cardBg,
              paddingHorizontal: space.sm,
              paddingVertical: space.xs,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            accessibilityLabel="Share script"
            accessibilityRole="button"
          >
            <Share2 color={theme.text} size={18} />
          </TouchableOpacity>
          <Button
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            variant="primary"
            label="Save to Library"
            icon={Save}
            size="sm"
            accessibilityLabel="Save script to library"
          />
        </View>
      </View>

      <Modal
        visible={showPresetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPresetModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: space.lg,
          }}
          onPress={() => setShowPresetModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.background,
              padding: space.lg,
              borderRadius: radius.lg,
              width: "100%",
              maxWidth: 400,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={[typography.heading3, { color: theme.text, marginBottom: space.md }]}
            >
              Save as Brand Preset
            </Text>
            <Input
              label="Preset name"
              value={presetName}
              onChangeText={setPresetName}
              placeholder="e.g., Fitness Morning Routine"
              style={{ marginBottom: space.md }}
            />
            <View style={{ flexDirection: "row", gap: space.sm }}>
              <Button
                onPress={() => setShowPresetModal(false)}
                variant="secondary"
                label="Cancel"
                style={{ flex: 1 }}
              />
              <Button
                onPress={handleSavePreset}
                disabled={!presetName.trim()}
                variant="primary"
                label="Save"
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: space.lg,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space.lg }}>
          {/* Topic */}
          <Text
            style={[typography.caption, { color: theme.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: space.xxs }]}
          >
            Topic
          </Text>
          <Text style={[typography.heading3, { color: theme.text }]}>
            {scriptData.topic}
          </Text>

          {/* Hooks */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: space.sm,
              }}
            >
              <Text style={[typography.heading3, { color: theme.text }]}>
                Hooks
              </Text>
              {scriptData.hooks.length > 0 && (
                <View style={{ flexDirection: "row", gap: space.xs }}>
                  <TouchableOpacity
                    onPress={handleFavoriteHook}
                    style={{ padding: space.xs }}
                    accessibilityLabel={currentHook && isFavorite(currentHook) ? "Remove from favorites" : "Add hook to favorites"}
                    accessibilityRole="button"
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
                      size={20}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => currentHook && copyToClipboard(currentHook)}
                    style={{ padding: space.xs }}
                    accessibilityLabel="Copy hook"
                    accessibilityRole="button"
                  >
                    <Copy color={theme.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {scriptData.hooks.length === 0 ? (
              <Card padding="md" bordered>
                <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                  No hooks
                </Text>
              </Card>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: space.sm }}
                >
                  <View style={{ flexDirection: "row", gap: space.xs }}>
                    {scriptData.hooks.map((_, index) => (
                      <Chip
                        key={index}
                        label={String(index + 1)}
                        selected={selectedHook === index}
                        onPress={() => setSelectedHook(index)}
                        accessibilityLabel={`Hook ${index + 1}. ${selectedHook === index ? "Selected" : "Not selected"}`}
                        accessibilityState={{ selected: selectedHook === index }}
                      />
                    ))}
                  </View>
                </ScrollView>

                <Card padding="md" bordered>
                  <Text style={[typography.body, { color: theme.text, lineHeight: 24, fontSize: 17 }]}>
                    {currentHook ?? ""}
                  </Text>
                </Card>
              </>
            )}

            {scriptData.hooks.length > 0 && (
              <View style={{ marginTop: space.md }}>
                <Text
                  style={[typography.label, { color: theme.textSecondary, marginBottom: space.xs }]}
                >
                  Remix this hook:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: space.xs }}>
                    {REMIX_STYLES.map((style) => (
                      <Chip
                        key={style.id}
                        label={style.label}
                        leftIcon={
                          remixing === style.id ? (
                            <ActivityIndicator size="small" color={theme.text} />
                          ) : (
                            <Text style={{ fontSize: 14 }}>{style.emoji}</Text>
                          )
                        }
                        selected={false}
                        onPress={() => handleRemixHook(style.id)}
                        disabled={remixing !== null}
                        style={remixing === style.id ? { opacity: 0.9 } : undefined}
                      />
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
                marginBottom: space.sm,
              }}
            >
              <Text style={[typography.heading3, { color: theme.text }]}>
                Script
              </Text>
              {scriptData.script.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    copyToClipboard(
                      scriptData.script.map((s) => s.text).join("\n\n")
                    )
                  }
                  style={{ padding: space.xs }}
                  accessibilityLabel="Copy full script"
                  accessibilityRole="button"
                >
                  <Copy color={theme.textSecondary} size={20} />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ gap: space.sm }}>
              {scriptData.script.length === 0 ? (
                <Card padding="md" bordered>
                  <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                    No script
                  </Text>
                </Card>
              ) : (
                scriptData.script.map((scene, index) => (
                  <Card key={index} padding="md" bordered>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: space.xs,
                      }}
                    >
                      <Text style={[typography.caption, { color: theme.textSecondary }]}>
                        Scene {index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(scene.text)}
                        style={{ padding: space.xxs }}
                        accessibilityLabel={`Copy scene ${index + 1}`}
                        accessibilityRole="button"
                      >
                        <Copy color={theme.textSecondary} size={16} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[typography.body, { color: theme.text, lineHeight: 24 }]}>
                      {scene.text}
                    </Text>
                    {scene.onScreenText && (
                      <View
                        style={{
                          marginTop: space.sm,
                          paddingTop: space.sm,
                          borderTopWidth: 1,
                          borderTopColor: theme.border,
                        }}
                      >
                        <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: space.xxs }]}>
                          On-screen:
                        </Text>
                        <Text style={[typography.bodySmall, { color: theme.accent, fontWeight: "600" }]}>
                          {scene.onScreenText}
                        </Text>
                      </View>
                    )}
                  </Card>
                ))
              )}
            </View>
          </View>

          {/* B-roll (collapsible) */}
          <View>
            <Pressable
              onPress={() => toggleCollapsed("broll")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: collapsed.broll ? 0 : space.sm,
              }}
              accessibilityLabel={collapsed.broll ? "Expand B-roll ideas" : "Collapse B-roll ideas"}
              accessibilityRole="button"
              accessibilityState={{ expanded: !collapsed.broll }}
            >
              <Text style={[typography.heading3, { color: theme.text }]}>
                B-roll Ideas
              </Text>
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                {collapsed.broll ? "Show" : "Hide"}
              </Text>
            </Pressable>
            {!collapsed.broll && (
              <Card padding="md" bordered>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: space.xs }}>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(scriptData.broll.join("\n"))}
                    style={{ padding: space.xxs }}
                    accessibilityLabel="Copy B-roll ideas"
                    accessibilityRole="button"
                  >
                    <Copy color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <View style={{ gap: space.xs }}>
                  {scriptData.broll.map((item, index) => (
                    <Text key={index} style={[typography.bodySmall, { color: theme.text, lineHeight: 20 }]}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </Card>
            )}
          </View>

          {/* CTA (collapsible) */}
          <View>
            <Pressable
              onPress={() => toggleCollapsed("cta")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: collapsed.cta ? 0 : space.sm,
              }}
              accessibilityLabel={collapsed.cta ? "Expand call to action" : "Collapse call to action"}
              accessibilityRole="button"
              accessibilityState={{ expanded: !collapsed.cta }}
            >
              <Text style={[typography.heading3, { color: theme.text }]}>
                Call to Action
              </Text>
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                {collapsed.cta ? "Show" : "Hide"}
              </Text>
            </Pressable>
            {!collapsed.cta && (
              <Card padding="md" bordered>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: space.xs }}>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(scriptData.cta)}
                    style={{ padding: space.xxs }}
                    accessibilityLabel="Copy call to action"
                    accessibilityRole="button"
                  >
                    <Copy color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <Text style={[typography.body, { color: theme.text, lineHeight: 24 }]}>
                  {scriptData.cta}
                </Text>
              </Card>
            )}
          </View>

          {/* Caption (collapsible) */}
          <View>
            <Pressable
              onPress={() => toggleCollapsed("caption")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: collapsed.caption ? 0 : space.sm,
              }}
              accessibilityLabel={collapsed.caption ? "Expand caption" : "Collapse caption"}
              accessibilityRole="button"
              accessibilityState={{ expanded: !collapsed.caption }}
            >
              <Text style={[typography.heading3, { color: theme.text }]}>
                Caption
              </Text>
              <Text style={[typography.bodySmall, { color: theme.textSecondary }]}>
                {collapsed.caption ? "Show" : "Hide"}
              </Text>
            </Pressable>
            {!collapsed.caption && (
              <Card padding="md" bordered>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: space.xs }}>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(scriptData.caption)}
                    style={{ padding: space.xxs }}
                    accessibilityLabel="Copy caption"
                    accessibilityRole="button"
                  >
                    <Copy color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <Text style={[typography.bodySmall, { color: theme.text, lineHeight: 22 }]}>
                  {scriptData.caption}
                </Text>
              </Card>
            )}
          </View>

          {/* New script CTA */}
          <Button
            onPress={() => router.replace("/(tabs)")}
            variant="secondary"
            label="New script"
            icon={Sparkles}
            fullWidth
            style={{ marginTop: space.md }}
            accessibilityLabel="Create a new script"
          />
        </View>
      </ScrollView>
    </View>
  );
}
