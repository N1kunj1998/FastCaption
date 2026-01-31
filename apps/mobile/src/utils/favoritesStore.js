import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useFavorites = create((set, get) => ({
  favorites: [],

  loadFavorites: async () => {
    try {
      const saved = await AsyncStorage.getItem("favoriteHooks");
      if (saved) {
        set({ favorites: JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  },

  addFavorite: async (hook, topic) => {
    const newFavorite = {
      id: Date.now().toString(),
      hook,
      topic,
      createdAt: new Date().toISOString(),
    };
    const updated = [newFavorite, ...get().favorites];
    set({ favorites: updated });
    await AsyncStorage.setItem("favoriteHooks", JSON.stringify(updated));
  },

  removeFavorite: async (id) => {
    const updated = get().favorites.filter((f) => f.id !== id);
    set({ favorites: updated });
    await AsyncStorage.setItem("favoriteHooks", JSON.stringify(updated));
  },

  isFavorite: (hook) => {
    return get().favorites.some((f) => f.hook === hook);
  },
}));
