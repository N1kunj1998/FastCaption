import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Color theme overrides: primary, gradient, and light-mode background tint. */
export const COLOR_THEMES = {
  purple: {
    id: "purple",
    name: "Purple",
    primary: "#8B5CF6",
    primaryGradientStart: "#8B5CF6",
    primaryGradientEnd: "#A78BFA",
    lightBg: "#F8F4FF",
    lightBgSecondary: "#F0EBFF",
  },
  green: {
    id: "green",
    name: "Green",
    primary: "#059669",
    primaryGradientStart: "#059669",
    primaryGradientEnd: "#10B981",
    lightBg: "#ECFDF5",
    lightBgSecondary: "#D1FAE5",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    primary: "#0284C7",
    primaryGradientStart: "#0284C7",
    primaryGradientEnd: "#0EA5E9",
    lightBg: "#F0F9FF",
    lightBgSecondary: "#E0F2FE",
  },
  coral: {
    id: "coral",
    name: "Coral",
    primary: "#EA580C",
    primaryGradientStart: "#EA580C",
    primaryGradientEnd: "#F97316",
    lightBg: "#FFF7ED",
    lightBgSecondary: "#FFEDD5",
  },
};

const darkBase = {
  id: "dark",
  background: "#0f0f0f",
  backgroundSecondary: "#1a1a1a",
  backgroundTertiary: "#2a2a2a",
  text: "#fff",
  textSecondary: "#999",
  textTertiary: "#666",
  primary: "#fff",
  primaryText: "#000",
  accent: "#FFD700",
  border: "#2a2a2a",
  cardBg: "#1a1a1a",
  surface: "#1a1a1a",
  surfaceElevated: "#242424",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  tabBarBg: "#0a0a0a",
  tabBarBorder: "#1a1a1a",
  tabBarActive: "#fff",
  tabBarInactive: "#666",
  shadowColor: "rgba(0,0,0,0.5)",
};

const lightBase = {
  id: "light",
  text: "#1a1a2e",
  textSecondary: "#5a5a6e",
  textTertiary: "#9CA3AF",
  primaryText: "#fff",
  accent: "#EC4899",
  border: "#E5E7EB",
  cardBg: "#fff",
  surface: "#fff",
  surfaceElevated: "#fff",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  tabBarBg: "#fff",
  tabBarBorder: "#E5E7EB",
  tabBarInactive: "#6B7280",
  shadowColor: "rgba(0,0,0,0.12)",
};

export function buildLightTheme(colorThemeId) {
  const c = COLOR_THEMES[colorThemeId] || COLOR_THEMES.purple;
  return {
    ...lightBase,
    background: c.lightBg,
    backgroundSecondary: c.lightBgSecondary,
    backgroundTertiary: "#E9E3FF",
    primary: c.primary,
    tabBarActive: c.primary,
    primaryGradientStart: c.primaryGradientStart,
    primaryGradientEnd: c.primaryGradientEnd,
  };
}

function buildDarkTheme(colorThemeId) {
  const c = COLOR_THEMES[colorThemeId] || COLOR_THEMES.purple;
  return {
    ...darkBase,
    primary: c.primary,
    tabBarActive: c.primary,
    primaryGradientStart: c.primaryGradientStart,
    primaryGradientEnd: c.primaryGradientEnd,
  };
}

const defaultColorTheme = "purple";

export const useTheme = create((set, get) => ({
  theme: buildLightTheme(defaultColorTheme),
  isDark: false,
  colorThemeId: defaultColorTheme,

  setTheme: async (isDark) => {
    const { colorThemeId } = get();
    const newTheme = isDark ? buildDarkTheme(colorThemeId) : buildLightTheme(colorThemeId);
    set({ theme: newTheme, isDark });
    await AsyncStorage.setItem("theme", isDark ? "dark" : "light");
  },

  setColorTheme: async (colorThemeId) => {
    const { isDark } = get();
    const newTheme = isDark ? buildDarkTheme(colorThemeId) : buildLightTheme(colorThemeId);
    set({ theme: newTheme, colorThemeId });
    await AsyncStorage.setItem("colorTheme", colorThemeId);
  },

  loadTheme: async () => {
    const [savedMode, savedColor] = await Promise.all([
      AsyncStorage.getItem("theme"),
      AsyncStorage.getItem("colorTheme"),
    ]);
    const isDark = savedMode === "dark";
    const colorThemeId = COLOR_THEMES[savedColor] ? savedColor : defaultColorTheme;
    const newTheme = isDark ? buildDarkTheme(colorThemeId) : buildLightTheme(colorThemeId);
    set({ theme: newTheme, isDark, colorThemeId });
  },
}));
