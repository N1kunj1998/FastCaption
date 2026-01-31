import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FileText, Trash2, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/utils/themeStore";
import { useFavorites } from "@/utils/favoritesStore";
import { isValidScriptData } from "@/utils/api";

export default function Library() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { favorites, loadFavorites, removeFavorite } = useFavorites();
  const [savedScripts, setSavedScripts] = useState([]);
  const [activeTab, setActiveTab] = useState("scripts");

  useEffect(() => {
    loadScripts();
    loadFavorites();
  }, []);

  async function loadScripts() {
    try {
      const scripts = await AsyncStorage.getItem("savedScripts");
      if (scripts) {
        setSavedScripts(JSON.parse(scripts));
      }
    } catch (error) {
      console.error("Failed to load scripts:", error);
    }
  }

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

      <View style={{ padding: 24, paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 8,
          }}
        >
          Library
        </Text>
        <Text style={{ fontSize: 16, color: theme.textSecondary }}>
          {activeTab === "scripts"
            ? `${savedScripts.length} saved ${savedScripts.length === 1 ? "script" : "scripts"}`
            : `${favorites.length} favorite ${favorites.length === 1 ? "hook" : "hooks"}`}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.cardBg,
            borderRadius: 10,
            padding: 4,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("scripts")}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor:
                activeTab === "scripts" ? theme.primary : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: "600",
                color:
                  activeTab === "scripts"
                    ? theme.primaryText
                    : theme.textSecondary,
              }}
            >
              Scripts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("favorites")}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor:
                activeTab === "favorites" ? theme.primary : "transparent",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: "600",
                color:
                  activeTab === "favorites"
                    ? theme.primaryText
                    : theme.textSecondary,
              }}
            >
              Favorites
            </Text>
          </TouchableOpacity>
        </View>
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
        {activeTab === "scripts" ? (
          savedScripts.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <FileText color={theme.textTertiary} size={48} />
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textSecondary,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No saved scripts yet{"\n"}Generate your first script to get
                started
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {savedScripts.map((script) => (
                <View
                  key={script.id}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => openScript(script)}
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.text,
                        marginBottom: 4,
                      }}
                    >
                      {script.topic}
                    </Text>
                    <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                      {new Date(script.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmDeleteScript(script)}
                    style={{ padding: 8 }}
                  >
                    <Trash2 color={theme.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        ) : favorites.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Heart color={theme.textTertiary} size={48} />
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No favorite hooks yet{"\n"}Save hooks from your results
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {favorites.map((fav) => (
              <View
                key={fav.id}
                style={{
                  backgroundColor: theme.cardBg,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                    {fav.topic}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFavorite(fav.id)}
                    style={{ padding: 4 }}
                  >
                    <Trash2 color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <Text
                  style={{ fontSize: 15, color: theme.text, lineHeight: 22 }}
                >
                  {fav.hook}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
