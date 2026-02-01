import { create } from "zustand";

/**
 * When opening a favorite hook from Library, we pass script data via this store
 * to avoid URL length limits (scriptData in params can truncate long hooks).
 */
export const useResultNavigationStore = create((set, get) => ({
  pendingScriptData: null,

  setPendingScriptData: (data) => set({ pendingScriptData: data }),

  getAndClearPendingScriptData: () => {
    const data = get().pendingScriptData;
    set({ pendingScriptData: null });
    return data;
  },
}));
