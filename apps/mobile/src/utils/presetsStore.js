import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const usePresets = create((set, get) => ({
  presets: [],

  loadPresets: async () => {
    try {
      const saved = await AsyncStorage.getItem("brandPresets");
      if (saved) {
        set({ presets: JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Failed to load presets:", error);
    }
  },

  savePreset: async (preset) => {
    const newPreset = {
      id: Date.now().toString(),
      ...preset,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPreset, ...get().presets];
    set({ presets: updated });
    await AsyncStorage.setItem("brandPresets", JSON.stringify(updated));
  },

  deletePreset: async (id) => {
    const updated = get().presets.filter((p) => p.id !== id);
    set({ presets: updated });
    await AsyncStorage.setItem("brandPresets", JSON.stringify(updated));
  },
}));
