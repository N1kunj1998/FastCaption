import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Sparkles, BookmarkPlus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/utils/themeStore";
import { usePresets } from "@/utils/presetsStore";
import { generateScript } from "@/utils/api";

const TOPIC_MAX_LENGTH = 500;

const SCRIPT_FORMATS = [
  { id: "mistakes", label: "3 Mistakes", emoji: "❌" },
  { id: "myth", label: "Myth vs Truth", emoji: "💡" },
  { id: "dothis", label: "Do This, Not That", emoji: "✅" },
  { id: "story", label: "Storytime", emoji: "📖" },
  { id: "pov", label: "POV Skit", emoji: "🎭" },
  { id: "beforeafter", label: "Before/After", emoji: "⚡" },
];

export default function Generate() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { presets, loadPresets } = usePresets();

  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [format, setFormat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = topic.trim();
    if (!trimmed) return;

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
  }, [topic, duration, format, router]);

  const applyPreset = (preset) => {
    setTopic(preset.topic || "");
    setFormat(preset.format || null);
    setShowPresets(false);
  };

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
        contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Generate Script
          </Text>
          <Text style={{ fontSize: 16, color: theme.textSecondary }}>
            Create viral-ready content in seconds
          </Text>
        </View>

        {presets.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowPresets(!showPresets)}
            style={{
              backgroundColor: theme.cardBg,
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <BookmarkPlus color={theme.accent} size={20} />
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: theme.text }}
            >
              Use Brand Preset ({presets.length})
            </Text>
          </TouchableOpacity>
        )}

        {showPresets && (
          <View style={{ marginBottom: 20, gap: 8 }}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => applyPreset(preset)}
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  padding: 14,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: theme.text }}
                >
                  {preset.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {preset.niche} • {preset.style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ gap: 24 }}>
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Script Format
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {SCRIPT_FORMATS.map((fmt) => (
                  <TouchableOpacity
                    key={fmt.id}
                    onPress={() => setFormat(fmt.id)}
                    style={{
                      backgroundColor:
                        format === fmt.id ? theme.primary : theme.cardBg,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      borderWidth: 1,
                      borderColor:
                        format === fmt.id ? theme.primary : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{fmt.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color:
                          format === fmt.id ? theme.primaryText : theme.text,
                      }}
                    >
                      {fmt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              What's your video about?
            </Text>
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g., 5 morning habits that changed my life"
              placeholderTextColor={theme.textTertiary}
              multiline
              maxLength={TOPIC_MAX_LENGTH}
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text,
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: "top",
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
            {topic.length > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: topic.length > TOPIC_MAX_LENGTH ? theme.accent : theme.textTertiary,
                  marginTop: 4,
                }}
              >
                {topic.length} / {TOPIC_MAX_LENGTH}
              </Text>
            )}
          </View>

          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Duration
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {["30", "60"].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  onPress={() => setDuration(dur)}
                  style={{
                    flex: 1,
                    backgroundColor:
                      duration === dur ? theme.primary : theme.cardBg,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor:
                      duration === dur ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: duration === dur ? theme.primaryText : theme.text,
                    }}
                  >
                    {dur}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={!topic.trim() || loading}
            style={{
              backgroundColor:
                topic.trim() && !loading
                  ? theme.primary
                  : theme.backgroundSecondary,
              padding: 18,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <>
                <Sparkles
                  color={topic.trim() ? theme.primaryText : theme.textTertiary}
                  size={20}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: topic.trim()
                      ? theme.primaryText
                      : theme.textTertiary,
                  }}
                >
                  Generate Script
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
