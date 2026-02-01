import { create } from "zustand";

const TOAST_DURATION_MS = 2500;

/**
 * Global toast state. Use from any screen: useToastStore.getState().show("Copied!").
 * Toast component in _layout renders the message.
 */
export const useToastStore = create((set, get) => ({
  message: null,
  visible: false,
  timeoutId: null,

  show: (message) => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => set({ visible: false, message: null, timeoutId: null }), TOAST_DURATION_MS);
    set({ message, visible: true, timeoutId: id });
  },

  hide: () => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ message: null, visible: false, timeoutId: null });
  },
}));
