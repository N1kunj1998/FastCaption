import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const darkTheme = {
  id: "dark",
  background: "#000",
  backgroundSecondary: "#1a1a1a",
  backgroundTertiary: "#2a2a2a",
  text: "#fff",
  textSecondary: "#999",
  textTertiary: "#666",
  primary: "#fff",
  primaryText: "#000",
  accent: "#FFD700",
  border: "#1a1a1a",
  cardBg: "#1a1a1a",
};

const lightTheme = {
  id: "light",
  background: "#F8F4FF",
  backgroundSecondary: "#fff",
  backgroundTertiary: "#F0EBFF",
  text: "#1a1a2e",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  primary: "#8B5CF6",
  primaryText: "#fff",
  accent: "#EC4899",
  border: "#E5E7EB",
  cardBg: "#fff",
};

export const useTheme = create((set) => ({
  theme: darkTheme,
  isDark: true,

  setTheme: async (isDark) => {
    const newTheme = isDark ? darkTheme : lightTheme;
    set({ theme: newTheme, isDark });
    await AsyncStorage.setItem("theme", isDark ? "dark" : "light");
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem("theme");
    const isDark = saved !== "light";
    const newTheme = isDark ? darkTheme : lightTheme;
    set({ theme: newTheme, isDark });
  },
}));
