import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FileText, Trash2, Heart, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeStore";
import { useFavorites } from "@/utils/favoritesStore";
import { useResultNavigationStore } from "@/utils/resultNavigationStore";
import { isValidScriptData } from "@/utils/api";
import { space, radius, typography } from "@/constants/designTokens";
import { LOTTIE_EMPTY_STATE } from "@/constants/lottie";
import { Card, EmptyState } from "@/components/ui";

export default function Library() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { favorites, loadFavorites, removeFavorite } = useFavorites();
  const [savedScripts, setSavedScripts] = useState([]);
  const [activeTab, setActiveTab] = useState("scripts");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  useEffect(() => {
    loadScripts();
    loadFavorites();
  }, []);

  async function loadScripts() {
    try {
      const scripts = await AsyncStorage.getItem("savedScripts");
      if (scripts) {
        const parsed = JSON.parse(scripts);
        setSavedScripts(parsed);
      } else {
        setSavedScripts([]);
      }
    } catch (error) {
      console.error("Failed to load scripts:", error);
    }
  }

  const filteredAndSortedScripts = useMemo(() => {
    let list = [...savedScripts];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => (s.topic || "").toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortNewestFirst ? db - da : da - db;
    });
    return list;
  }, [savedScripts, searchQuery, sortNewestFirst]);

  async function deleteScript(id) {
    const updated = savedScripts.filter((s) => s.id !== id);
    setSavedScripts(updated);
    await AsyncStorage.setItem("savedScripts", JSON.stringify(updated));
  }

  function confirmDeleteScript(script) {
    Alert.alert(
      "Delete script?",
      "This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteScript(script.id),
        },
      ]
    );
  }

  function openScript(script) {
    const data = script.data;
    if (!data || !isValidScriptData(data)) {
      Alert.alert(
        "Can't open script",
        "This saved script is invalid or corrupted. You can delete it from the list."
      );
      return;
    }
    router.push({
      pathname: "/result",
      params: { scriptData: JSON.stringify(data) },
    });
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

      <View style={{ paddingHorizontal: space.lg, paddingBottom: space.md }}>
        <Text
          style={[typography.heading1, { color: theme.text, marginBottom: space.xs }]}
        >
          Library
        </Text>
        <Text style={[typography.body, { color: theme.textSecondary }]}>
          {activeTab === "scripts"
            ? `${savedScripts.length} saved ${savedScripts.length === 1 ? "script" : "scripts"}`
            : `${favorites.length} favorite ${favorites.length === 1 ? "hook" : "hooks"}`}
        </Text>
      </View>

      {/* Search & sort (scripts tab only) */}
      {activeTab === "scripts" && savedScripts.length > 0 && (
        <View style={{ paddingHorizontal: space.lg, marginBottom: space.sm }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: space.xs,
              backgroundColor: theme.cardBg,
              borderRadius: radius.sm,
              paddingHorizontal: space.sm,
              paddingVertical: space.xs,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Search color={theme.textTertiary} size={18} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search scripts..."
              placeholderTextColor={theme.textTertiary}
              style={[typography.bodySmall, { flex: 1, color: theme.text, paddingVertical: space.xs }]}
            />
          </View>
          <Pressable
            onPress={() => setSortNewestFirst((v) => !v)}
            style={{ marginTop: space.xs, alignSelf: "flex-end" }}
          >
            <Text style={[typography.caption, { color: theme.primary }]}>
              Sort: {sortNewestFirst ? "Newest first" : "Oldest first"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Tabs */}
      <View style={{ paddingHorizontal: space.lg, marginBottom: space.md }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.cardBg,
            borderRadius: radius.sm,
            padding: space.xxs,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Pressable
            onPress={() => setActiveTab("scripts")}
            style={{
              flex: 1,
              paddingVertical: space.sm,
              borderRadius: radius.sm,
              backgroundColor:
                activeTab === "scripts" ? theme.primary : "transparent",
            }}
            accessibilityRole="tab"
            accessibilityLabel="Scripts tab"
            accessibilityState={{ selected: activeTab === "scripts" }}
          >
            <Text
              style={[
                typography.label,
                {
                  textAlign: "center",
                  color:
                    activeTab === "scripts"
                      ? theme.primaryText
                      : theme.textSecondary,
                },
              ]}
            >
              Scripts
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("favorites")}
            style={{
              flex: 1,
              paddingVertical: space.sm,
              borderRadius: radius.sm,
              backgroundColor:
                activeTab === "favorites" ? theme.primary : "transparent",
            }}
            accessibilityRole="tab"
            accessibilityLabel="Favorites tab"
            accessibilityState={{ selected: activeTab === "favorites" }}
          >
            <Text
              style={[
                typography.label,
                {
                  textAlign: "center",
                  color:
                    activeTab === "favorites"
                      ? theme.primaryText
                      : theme.textSecondary,
                },
              ]}
            >
              Favorites
            </Text>
          </Pressable>
        </View>
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
        {activeTab === "scripts" ? (
          savedScripts.length === 0 ? (
            <EmptyState
              icon={FileText}
              lottieSource={LOTTIE_EMPTY_STATE}
              title="No scripts yet"
              description="Generate your first script to get started."
              actionLabel="Generate script"
              onAction={() => router.push("/(tabs)")}
            />
          ) : filteredAndSortedScripts.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching scripts"
              description="Try a different search term."
            />
          ) : (
            <View style={{ gap: space.sm }}>
              {filteredAndSortedScripts.map((script) => (
                <Card key={script.id} padding="md" bordered>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: space.sm,
                    }}
                  >
                    <Pressable
                      onPress={() => openScript(script)}
                      onLongPress={() => confirmDeleteScript(script)}
                      style={{ flex: 1 }}
                      accessibilityLabel={`Open script: ${script.topic}`}
                      accessibilityRole="button"
                      accessibilityHint="Long press to delete"
                    >
                      <Text
                        style={[typography.label, { color: theme.text, marginBottom: space.xxs }]}
                      >
                        {script.topic}
                      </Text>
                      <Text style={[typography.caption, { color: theme.textSecondary }]}>
                        {new Date(script.createdAt).toLocaleDateString()}
                      </Text>
                    </Pressable>
                    <TouchableOpacity
                      onPress={() => confirmDeleteScript(script)}
                      style={{ padding: space.xs }}
                      accessibilityLabel="Delete script"
                      accessibilityRole="button"
                    >
                      <Trash2 color={theme.textSecondary} size={20} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            lottieSource={LOTTIE_EMPTY_STATE}
            title="No favorite hooks yet"
            description="Save hooks from your results to see them here."
            actionLabel="Generate script"
            onAction={() => router.push("/(tabs)")}
          />
        ) : (
          <View style={{ gap: space.sm }}>
            {favorites.map((fav) => (
              <Card key={fav.id} padding="md" bordered>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: space.xs,
                  }}
                >
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    {fav.topic}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFavorite(fav.id)}
                    style={{ padding: space.xxs }}
                    accessibilityLabel="Remove from favorites"
                    accessibilityRole="button"
                  >
                    <Trash2 color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <Pressable
                  onPress={() => {
                    if (fav.hook) {
                      const scriptData = {
                        topic: fav.topic || "Saved hook",
                        hooks: [fav.hook],
                        script: [],
                        broll: [],
                        cta: "",
                        caption: "",
                      };
                      useResultNavigationStore.getState().setPendingScriptData(scriptData);
                      router.push({
                        pathname: "/result",
                        params: { from: "favorite" },
                      });
                    }
                  }}
                  accessibilityLabel={`Open hook from ${fav.topic}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[typography.bodySmall, { color: theme.text, lineHeight: 22 }]}
                  >
                    {fav.hook}
                  </Text>
                </Pressable>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
