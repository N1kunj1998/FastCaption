import React from 'react';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/utils/themeStore';
import { AuthWebView } from './AuthWebView';
import { AuthNativeOptions } from './AuthNativeOptions';
import { useAuthStore, useAuthModal } from './store';
import { radius, space, getShadow } from '@/constants/designTokens';

/**
 * Renders the auth modal. When EXPO_PUBLIC_PROXY_BASE_URL is set, shows WebView auth (Create/Anything);
 * otherwise shows native "Sign in with Apple" and "Sign in with Google" (FastCaption API).
 */
export const AuthModal = () => {
  const { isOpen, mode, close } = useAuthModal();
  const { auth } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const proxyURL = process.env.EXPO_PUBLIC_PROXY_BASE_URL;
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  const useWebView = !!proxyURL;
  const visible = isOpen && !auth;

  if (!visible) return null;

  if (useWebView) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.surfaceElevated || theme.cardBg }}>
          <AuthWebView mode={mode} proxyURL={proxyURL} baseURL={baseURL || proxyURL} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: theme.surfaceElevated,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingTop: insets.top + space.lg,
            paddingBottom: insets.bottom + space.lg,
            paddingHorizontal: space.lg,
            ...getShadow(isDark, 'lg'),
          }}
          accessibilityRole="dialog"
          accessibilityLabel="Sign in or sign up"
        >
          <AuthNativeOptions onClose={close} />
        </View>
      </View>
    </Modal>
  );
};

export default useAuthModal;